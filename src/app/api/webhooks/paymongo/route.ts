import { NextResponse } from "next/server";

// Get webhook secret from environment variable
// const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { data, type } = JSON.parse(payload);

    console.log("data: ", data);
    console.log("type: ", type);
  } catch (error) {
    console.error("Error processing PayMongo webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
