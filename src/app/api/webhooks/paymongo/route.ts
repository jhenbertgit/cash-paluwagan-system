import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/actions/transaction.action";

/**
 * Handle PayMongo webhook events
 * @see https://developers.paymongo.com/docs/webhook-events
 */
export async function POST(request: Request) {
  try {
    // Get raw body
    const rawBody = await request.text();

    // Parse the webhook payload
    const { data } = JSON.parse(rawBody);
    const type = data?.attributes?.type;

    // Handle checkout session events
    switch (type) {
      case "checkout_session.payment.paid": {
        console.log("Data Attributes: ", data?.attributes?.data?.attributes);

        const checkoutSessionId = data?.attributes?.data?.id;

        const { metadata, payment_intent } = data?.attributes?.data?.attributes;
        const amount = payment_intent?.attributes?.amount;

        console.log("Checkout Session ID: ", checkoutSessionId);

        // Create transaction record
        const transaction = {
          checkoutSessionId: checkoutSessionId,
          amount: amount ? amount / 100 : 0, // Convert from cents
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
