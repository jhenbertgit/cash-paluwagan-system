import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/actions/transaction.action";
// Get webhook secret from environment variable
// const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET_KEY;

export async function POST(request: Request) {
  const payload = await request.json();
  const { data, type } = JSON.parse(payload);

  console.log("data: ", data);
  console.log("type: ", type);

  try {
    const eventType = data?.attributes?.type;

    if (eventType === "checkout_session.payment.paid") {
      console.log("Payment created");

      const transaction = {
        transactionId: data?.id,
        amount: data?.attributes?.amount ? data?.attributes?.amount / 100 : 0,
        memberId: data?.attributes?.metadata?.memberId,
        createdAt: new Date(),
      };

      await createTransaction(transaction);
    }
  } catch (error) {
    console.error("Error processing PayMongo webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
