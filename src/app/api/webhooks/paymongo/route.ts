// Webhook for PayMongo payments
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("===Webhook triggered===");

    const body = await req.json();
    const data = body.data;

    console.log(data);
    console.log("===Webhook end===");

    if (data.attributes.type === "source.chargeable") {
      // GCash and GrabPay
      console.log("E-wallet Payment Chargeable");

      // Create a payment resource
    //   const options = {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //       Authorization: `Basic ${Buffer.from(
    //         process.env.PAYMONGO_SECRET!
    //       ).toString("base64")}`,
    //     },
    //     body: JSON.stringify({
    //       data: {
    //         attributes: {
    //           amount: data.attributes.data.attributes.amount,
    //           source: {
    //             id: `${data.attributes.data.id}`,
    //             type: `${data.attributes.data.type}`,
    //           },
    //           description: data.attributes.data.attributes.description,
    //           currency: "PHP",
    //           statement_descriptor:
    //             data.attributes.data.attributes.statement_descriptor,
    //         },
    //       },
    //     }),
    //   };

    //   const response = await fetch(
    //     "https://api.paymongo.com/v1/payments",
    //     options
    //   );
    //   const result = await response.json();
    //   console.log(result);
    }

    if (data.attributes.type === "payment.paid") {
      // All Payment Types
      console.log("Payment Paid");
      // Add next steps for you
    }

    if (data.attributes.type === "payment.failed") {
      // Failed Payments - Cards, PayMaya
      console.log("Payment Failed");
      // Add next steps for you
    }

    return NextResponse.json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
