/**
 * PayPal Webhook Handler
 * Processes PayPal subscription events
 */

import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { userSubscriptions, usageHistory } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getTierFromPlanId } from "~/server/paypal/config";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    plan_id?: string;
    custom_id?: string; // This is our userId
    status?: string;
    subscriber?: {
      email_address?: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PayPalWebhookEvent;

    console.log("[PayPal Webhook] Received event:", body.event_type);

    // Extract user ID from custom_id
    const userId = body.resource.custom_id;

    if (!userId) {
      console.error("[PayPal Webhook] No user ID in webhook");
      return NextResponse.json({ error: "No user ID" }, { status: 400 });
    }

    // Handle different event types
    switch (body.event_type) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(body, userId);
        break;

      case "BILLING.SUBSCRIPTION.UPDATED":
        await handleSubscriptionUpdated(body, userId);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await handleSubscriptionCancelled(body, userId);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(body, userId);
        break;

      case "PAYMENT.SALE.REFUNDED":
        await handlePaymentRefunded(body, userId);
        break;

      default:
        console.log("[PayPal Webhook] Unhandled event type:", body.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayPal Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle subscription activated
 */
async function handleSubscriptionActivated(
  event: PayPalWebhookEvent,
  userId: string,
) {
  const planId = event.resource.plan_id;

  if (!planId) {
    console.error("[PayPal Webhook] No plan ID in activation event");
    return;
  }

  const tier = getTierFromPlanId(planId);

  if (!tier) {
    console.error("[PayPal Webhook] Unknown plan ID:", planId);
    return;
  }

  // Update or create user subscription
  const existing = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  if (existing[0]) {
    // Update existing subscription
    await db
      .update(userSubscriptions)
      .set({
        tier,
        status: "active",
        paypalSubscriptionId: event.resource.id,
        periodStart: now,
        periodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: now,
      })
      .where(eq(userSubscriptions.userId, userId));
  } else {
    // Create new subscription
    await db.insert(userSubscriptions).values({
      id: randomUUID(),
      userId,
      tier,
      status: "active",
      paypalSubscriptionId: event.resource.id,
      pdfsUsedThisMonth: 0,
      storageUsedBytes: 0,
      periodStart: now,
      periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Log the upgrade
  await db.insert(usageHistory).values({
    id: randomUUID(),
    userId,
    action: "tier_upgraded",
    amount: 1,
    metadata: {
      newTier: tier,
      paypalSubscriptionId: event.resource.id,
      eventType: event.event_type,
    },
    createdAt: now,
  });

  console.log(
    `[PayPal Webhook] Activated ${tier} subscription for user ${userId}`,
  );
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(
  event: PayPalWebhookEvent,
  userId: string,
) {
  const planId = event.resource.plan_id;

  if (!planId) return;

  const tier = getTierFromPlanId(planId);

  if (!tier) return;

  await db
    .update(userSubscriptions)
    .set({
      tier,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId));

  console.log(
    `[PayPal Webhook] Updated subscription for user ${userId} to ${tier}`,
  );
}

/**
 * Handle subscription cancelled/suspended/expired
 */
async function handleSubscriptionCancelled(
  event: PayPalWebhookEvent,
  userId: string,
) {
  const status =
    event.event_type === "BILLING.SUBSCRIPTION.CANCELLED"
      ? "cancelled"
      : event.event_type === "BILLING.SUBSCRIPTION.SUSPENDED"
        ? "cancelled"
        : "expired";

  await db
    .update(userSubscriptions)
    .set({
      status,
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId));

  // Log the cancellation
  await db.insert(usageHistory).values({
    id: randomUUID(),
    userId,
    action: "subscription_cancelled",
    amount: 1,
    metadata: {
      reason: status,
      eventType: event.event_type,
    },
    createdAt: new Date(),
  });

  console.log(`[PayPal Webhook] Cancelled subscription for user ${userId}`);
}

/**
 * Handle payment completed
 */
async function handlePaymentCompleted(
  event: PayPalWebhookEvent,
  userId: string,
) {
  // Log successful payment
  await db.insert(usageHistory).values({
    id: randomUUID(),
    userId,
    action: "payment_completed",
    amount: 1,
    metadata: {
      paymentId: event.resource.id,
      eventType: event.event_type,
    },
    createdAt: new Date(),
  });

  console.log(`[PayPal Webhook] Payment completed for user ${userId}`);
}

/**
 * Handle payment refunded
 */
async function handlePaymentRefunded(
  event: PayPalWebhookEvent,
  userId: string,
) {
  // Log refund
  await db.insert(usageHistory).values({
    id: randomUUID(),
    userId,
    action: "payment_refunded",
    amount: 1,
    metadata: {
      paymentId: event.resource.id,
      eventType: event.event_type,
    },
    createdAt: new Date(),
  });

  console.log(`[PayPal Webhook] Payment refunded for user ${userId}`);
}
