"use server";

import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/actions/transaction.action";
import { handleError } from "@/lib/utils";
import type { WebhookEvent, PaymentStatus } from "./types";

const WEBHOOK_EVENTS = {
  PAYMENT_PAID: "checkout_session.payment.paid",
} as const;

/**
 * Maps PayMongo payment status to our transaction status
 */
const mapPaymentStatus = (status: PaymentStatus) =>
  status === "succeeded" ? "completed" : "pending";

/**
 * Creates standardized API response
 */
const createResponse = (success: boolean, message: string, data?: unknown) => {
  const response = {
    success,
    message,
  };

  if (data) {
    return NextResponse.json({ ...response, data });
  }

  return NextResponse.json(response);
};

/**
 * Handles payment success event
 */
async function handlePaymentPaid(data: WebhookEvent["data"]) {
  const {
    id: checkoutSessionId,
    attributes: { payment_intent, payment_method_used, metadata },
  } = data;

  console.log("handlePaymentData: ", data);
  const { status, amount } = payment_intent?.attributes ?? {};

  const transaction: CreateTransactionParams = {
    checkoutSessionId,
    amount: amount ? amount / 100 : 0,
    memberId: metadata?.memberId,
    status: mapPaymentStatus(status) as "completed" | "pending" | "failed",
    paymentMethod: payment_method_used,
  };

  const newTransaction = await createTransaction(transaction);

  return createResponse(true, "Payment processed successfully", {
    transaction: newTransaction,
  });
}

/**
 * Handle PayMongo webhook events
 * @see https://developers.paymongo.com/docs/webhook-events
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const { data } = JSON.parse(rawBody);
    const eventType = data?.attributes?.type;

    console.log("data: ", data);
    switch (eventType) {
      case WEBHOOK_EVENTS.PAYMENT_PAID:
        return handlePaymentPaid(data?.attributes?.data);

      default:
        return createResponse(false, `Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    handleError(error);

    return createResponse(false, "Webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
