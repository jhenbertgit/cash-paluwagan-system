"use server";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { WebhookEvent, clerkClient, UserJSON } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { headers } from "next/headers";
import { Webhook } from "svix";

type WebhookHandler = (evt: WebhookEvent) => Promise<NextResponse>;

const WEBHOOK_HANDLERS: Record<string, WebhookHandler> = {
  "user.created": async (evt) => {
    const {
      id,
      email_addresses,
      image_url: photo,
      first_name,
      last_name,
      username,
    } = evt.data as UserJSON;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name!,
      lastName: last_name!,
      photo: photo ?? "",
    };

    const newUser = await createUser(user);

    if (newUser) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        publicMetadata: { userId: newUser._id },
      });
    }

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  },

  "user.updated": async (evt) => {
    const {
      id,
      image_url: photo,
      first_name,
      last_name,
      username,
    } = evt.data as UserJSON;

    const user = {
      firstName: first_name!,
      lastName: last_name!,
      username: username!,
      photo: photo ?? "",
    };

    const updatedUser = await updateUser(id, user);
    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  },

  "user.deleted": async (evt) => {
    const { id } = evt.data;
    const deletedUser = await deleteUser(id!);
    return NextResponse.json({
      message: "User deleted successfully from MongoDB",
      user: deletedUser,
    });
  },
};

/**
 * Handles Clerk webhook events
 */
export async function POST(request: Request) {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Missing WEBHOOK_SECRET environment variable");
    }

    // Get and validate headers
    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new Error("Missing required Svix headers");
    }

    // Verify webhook signature
    const payload = await request.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (error) {
      handleError(error);
      return new Response("Invalid webhook signature", { status: 400 });
    }

    // Handle the event
    const handler = WEBHOOK_HANDLERS[evt.type];

    if (handler) {
      return await handler(evt);
    }

    // Log unhandled event types
    console.log(`Unhandled webhook event type: ${evt.type}`, evt);
    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    handleError(error);
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
