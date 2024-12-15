import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();

    // Ensure the necessary environment variable is set
    if (!process.env.PAYMONGO_SECRET) {
      throw new Error("PAYMONGO_SECRET environment variable is not set.");
    }

    // Create options for the Payment Intent API request
    const optionsIntent = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYMONGO_SECRET
        ).toString("base64")}`,
      },
      body: JSON.stringify(body), // The body should match the required format by PayMongo
    };

    // Make the API call to PayMongo
    const response = await fetch(
      "https://api.paymongo.com/v1/payment_intents",
      optionsIntent
    );
    const jsonResponse = await response.json();

    if (response.ok) {
      // Successful response
      return NextResponse.json({ success: true, data: jsonResponse });
    } else {
      // Log the error for debugging
      console.error("Error from PayMongo:", jsonResponse.errors);

      // Return the error response
      return NextResponse.json(
        { success: false, errors: jsonResponse.errors },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error in create payment intent handler:", error);

    // Return a 500 Internal Server Error response
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
