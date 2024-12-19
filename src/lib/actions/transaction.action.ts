"use server";

import { redirect } from "next/navigation";
import { connectToDB } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";

/**
 * Processes a payment checkout through PayMongo payment gateway
 * @param {CheckoutTransactionParams} params - The checkout parameters
 * @throws {Error} When PayMongo secret key or server URL is missing
 * @throws {Error} When checkout session creation fails
 * @throws {Error} When checkout URL is missing in PayMongo response
 */
export async function checkoutPayment({
  name,
  email,
  userId,
}: CheckoutTransactionParams) {
  const secretKey = process.env.PAYMONGO_SECRET;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Validate environment variables
  if (!secretKey || !serverUrl) {
    throw new Error(
      !secretKey ? "PayMongo secret key is missing" : "Server URL is missing"
    );
  }

  const PAYMONGO_API_URL = "https://api.paymongo.com/v1/checkout_sessions";
  const AMOUNT = 100000;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Basic ${Buffer.from(secretKey).toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: { name, email },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: "PHP",
              quantity: 1,
              name: "Paluwagan",
              amount: AMOUNT,
            },
          ],
          payment_method_types: ["gcash", "grab_pay", "paymaya", "card"],
          description: "Paluwagan monthly amortization",
          success_url: `${serverUrl}/dashboard`,
          cancel_url: `${serverUrl}/pay`,
          metadata: {
            memberId: userId,
          },
        },
      },
    }),
  };

  try {
    const response = await fetch(PAYMONGO_API_URL, options);

    if (!response.ok) {
      throw new Error(
        `Failed to create checkout session: ${response.statusText}`
      );
    }

    const session = await response.json();
    const checkoutUrl = session?.data?.attributes?.checkout_url;

    if (!checkoutUrl) {
      throw new Error("Checkout URL is missing in the PayMongo response");
    }

    redirect(checkoutUrl);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "NEXT_REDIRECT") {
      console.error("An error occurred during checkout:", error);
      throw error;
    }
    throw error;
  }
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDB();

    const newTransaction = await Transaction.create({
      ...transaction,
      member: transaction.memberId,
    });

    console.log("New Transaction: ", newTransaction);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    console.log(error);
  }
}
