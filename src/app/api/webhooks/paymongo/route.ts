import crypto from "crypto";

import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/actions/transaction.action";

const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET;
const MAX_TIMESTAMP_DIFF = 5 * 60 * 1000; // 5 minutes in milliseconds

interface SignatureParts {
  timestamp: string;
  testSignature: string;
  liveSignature: string;
}

/**
 * Parse PayMongo signature header into parts
 */
function parseSignatureHeader(header: string): SignatureParts | null {
  try {
    const parts = header.split(",").reduce((acc, part) => {
      const [key, value] = part.split("=");
      return { ...acc, [key]: value };
    }, {} as Record<string, string>);

    return {
      timestamp: parts["t"],
      testSignature: parts["te"],
      liveSignature: parts["li"],
    };
  } catch (error) {
    console.error("Failed to parse signature header:", error);
    return null;
  }
}

/**
 * Verify PayMongo webhook signature
 * @see https://developers.paymongo.com/docs/webhook-authentication
 */
function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  isTestMode: boolean = true
): boolean {
  if (!WEBHOOK_SECRET || !signatureHeader) {
    console.error("Webhook secret or signature missing");
    return false;
  }

  try {
    // Parse signature header
    const parts = parseSignatureHeader(signatureHeader);
    if (!parts) {
      console.error("Invalid signature header format");
      return false;
    }

    // Verify timestamp to prevent replay attacks
    const timestamp = parseInt(parts.timestamp);
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (Math.abs(currentTime - timestamp) > MAX_TIMESTAMP_DIFF / 1000) {
      console.error("Webhook timestamp is too old");
      return false;
    }

    // Create signature payload
    const payload = `${parts.timestamp}.${rawBody}`;

    // Generate signature
    const computedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    // Compare with appropriate signature (test/live)
    const expectedSignature = isTestMode
      ? parts.testSignature
      : parts.liveSignature;

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Handle PayMongo webhook events
 * @see https://developers.paymongo.com/docs/webhook-events
 */
export async function POST(request: Request) {
  try {
    // Get raw body and signature
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("Paymongo-Signature");

    // Determine environment mode (you might want to get this from env vars)
    const isTestMode = process.env.NODE_ENV !== "production";

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signatureHeader, isTestMode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhook signature",
        },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const { data } = JSON.parse(rawBody);
    const type = data?.attributes?.type;
    // Log webhook event
    console.log("PayMongo Webhook Event:", {
      dataId: data?.id,
      timestamp: new Date().toISOString(),
      mode: isTestMode ? "test" : "live",
    });

    // Handle checkout session events
    switch (type) {
      case "checkout_session.payment.paid": {
        const { amount, metadata, payment_intent } = data?.attributes;

        // Create transaction record
        const transaction = {
          transactionId: payment_intent.id,
          amount: amount / 100, // Convert from cents
          memberId: metadata?.memberId,
          createdAt: new Date(),
        };

        // Record transaction and update user credits
        const newTransaction = await createTransaction(transaction);

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          transaction: newTransaction,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          message: `Unhandled event type: ${type}`,
        });
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
