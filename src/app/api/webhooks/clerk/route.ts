import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { onUserSignup } from "~/server/email/triggers";

export async function POST(req: Request) {
  // Get the Webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = (await req.json()) as unknown;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`[Clerk Webhook] Received: ${eventType}`);

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const userEmail = email_addresses?.[0]?.email_address;
    const userName = first_name
      ? `${first_name} ${last_name ?? ""}`.trim()
      : "User";

    if (id && userEmail) {
      console.log(`[Clerk Webhook] New user: ${id} (${userEmail})`);
      
      // Trigger welcome email and funnel
      try {
        await onUserSignup(id, userEmail, userName);
        console.log(`[Clerk Webhook] Triggered signup funnel for ${id}`);
      } catch (error) {
        console.error("[Clerk Webhook] Failed to trigger signup funnel:", error);
        // Don't fail the webhook - registration should still succeed
      }
    }
  }

  return new NextResponse("Webhook processed", { status: 200 });
}

