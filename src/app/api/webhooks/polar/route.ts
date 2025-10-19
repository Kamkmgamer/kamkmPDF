/**
 * Polar.sh Webhook Handler
 * Uses official @polar-sh/nextjs SDK for webhook handling
 */

import { Webhooks } from "@polar-sh/nextjs";
import { db } from "~/server/db";
import { userSubscriptions, usageHistory, creditProducts } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getTierFromProductId } from "~/server/polar/config";
import { randomUUID } from "crypto";
import { env } from "~/env";

// Type definitions for Polar webhook events
interface PolarWebhookPayload {
  type: string;
  data: PolarEventData;
}

interface PolarEventData {
  id: string;
  status?: string;
  customer_id?: string;
  product_id?: string;
  current_period_end?: string;
  customer_metadata?: {
    userId?: string;
    packageId?: string;
    credits?: string;
  };
  [key: string]: unknown;
}

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("[Polar Webhook] Received event:", payload.type);
    
    // Handle all events through the generic payload handler
    try {
      await handleWebhookEvent(payload);
    } catch (error) {
      console.error("[Polar Webhook] Error handling event:", error);
      throw error;
    }
  },
});

/**
 * Handle webhook event based on type
 */
async function handleWebhookEvent(payload: PolarWebhookPayload) {
  const eventType = payload.type;
  const data = payload.data;

  console.log("[Polar Webhook] Processing event:", eventType, "ID:", data?.id);

  switch (eventType) {
    case "checkout.created":
      console.log("[Polar Webhook] Checkout created:", data.id);
      break;

    case "checkout.updated":
      console.log("[Polar Webhook] Checkout updated:", data.id);
      if (data.status === "confirmed") {
        // Check if this is a credit purchase by looking up the product
        const isCreditPurchase = await checkIfCreditProduct(data.product_id);
        
        if (isCreditPurchase) {
          await handleCreditPurchase(data);
        } else if (data.customer_id) {
          await handleCheckoutConfirmed(data);
        }
      }
      break;

    case "subscription.created":
      console.log("[Polar Webhook] Subscription created:", data.id);
      await handleSubscriptionActivated(data);
      break;

    case "subscription.updated":
      console.log("[Polar Webhook] Subscription updated:", data.id);
      await handleSubscriptionUpdated(data);
      break;

    case "subscription.canceled":
    case "subscription.revoked":
      console.log("[Polar Webhook] Subscription canceled/revoked:", data.id);
      await handleSubscriptionCancelled(data);
      break;

    default:
      console.log("[Polar Webhook] Unhandled event type:", eventType);
  }
}

/**
 * Handle checkout confirmed
 */
async function handleCheckoutConfirmed(data: PolarEventData) {
  const productId = data.product_id;
  const customerId = data.customer_id;
  const userId = customerId; // Use customer ID as user ID

  if (!productId || !userId) {
    console.error("[Polar Webhook] Missing product ID or user ID");
    return;
  }

  const tier = await getTierFromProductId(productId);

  if (!tier) {
    console.error("[Polar Webhook] Unknown product ID:", productId);
    return;
  }

  // Update or create user subscription
  const existing = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  if (existing[0]) {
    // Update existing subscription
    await db
      .update(userSubscriptions)
      .set({
        tier,
        status: "active",
        polarSubscriptionId: data.id,
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
      polarSubscriptionId: data.id,
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
      checkoutId: data.id,
    },
    createdAt: now,
  });

  console.log(
    `[Polar Webhook] Activated ${tier} subscription for user ${userId}`,
  );
}

/**
 * Handle subscription activated
 */
async function handleSubscriptionActivated(data: PolarEventData) {
  const productId = data.product_id;
  const userId = data.customer_id; // Use customer ID as user ID

  if (!productId || !userId) {
    console.error("[Polar Webhook] Missing product ID or user ID");
    return;
  }

  const tier = await getTierFromProductId(productId);

  if (!tier) {
    console.error("[Polar Webhook] Unknown product ID:", productId);
    return;
  }

  // Update or create user subscription
  const existing = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  const now = new Date();
  const periodEnd = data.current_period_end
    ? new Date(data.current_period_end)
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (existing[0]) {
    // Update existing subscription
    await db
      .update(userSubscriptions)
      .set({
        tier,
        status: "active",
        polarSubscriptionId: data.id,
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
      polarSubscriptionId: data.id,
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
      subscriptionId: data.id,
    },
    createdAt: now,
  });

  console.log(
    `[Polar Webhook] Activated ${tier} subscription for user ${userId}`,
  );
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(data: PolarEventData) {
  const productId = data.product_id;
  const userId = data.customer_id;

  if (!productId || !userId) return;

  const tier = await getTierFromProductId(productId);

  if (!tier) return;

  await db
    .update(userSubscriptions)
    .set({
      tier,
      status: data.status === "active" ? "active" : "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId));

  console.log(
    `[Polar Webhook] Updated subscription for user ${userId} to ${tier}`,
  );
}

/**
 * Handle subscription cancelled/revoked
 */
async function handleSubscriptionCancelled(data: PolarEventData) {
  const userId = data.customer_id;

  if (!userId) return;

  await db
    .update(userSubscriptions)
    .set({
      status: "cancelled",
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
      subscriptionId: data.id,
    },
    createdAt: new Date(),
  });

  console.log(`[Polar Webhook] Cancelled subscription for user ${userId}`);
}

/**
 * Check if a product is a credit product
 */
async function checkIfCreditProduct(productId?: string): Promise<boolean> {
  if (!productId) return false;

  const creditProduct = await db.query.creditProducts.findFirst({
    where: eq(creditProducts.productId, productId),
  });

  return !!creditProduct;
}

/**
 * Handle credit purchase
 */
async function handleCreditPurchase(data: PolarEventData) {
  // Look up the credit product by product ID
  const creditProduct = await db.query.creditProducts.findFirst({
    where: eq(creditProducts.productId, data.product_id ?? ""),
  });

  if (!creditProduct) {
    console.error("[Polar Webhook] Credit product not found for product ID:", data.product_id);
    return;
  }

  // Get user ID from customer email or customer ID
  const userEmail = data.customer_email;
  if (!userEmail) {
    console.error("[Polar Webhook] No customer email in checkout data");
    return;
  }

  // Find user by email (you'll need to implement this based on your auth system)
  // For now, we'll use customer_id as userId
  const userId = data.customer_id;
  if (!userId) {
    console.error("[Polar Webhook] No customer ID in checkout data");
    return;
  }

  console.log(`[Polar Webhook] Processing credit purchase: ${creditProduct.credits} credits for user ${userId}`);

  // Update user's credit balance
  await db.execute(
    sql`
      UPDATE pdfprompt_user_subscription
      SET 
        credits_balance = COALESCE(credits_balance, 0) + ${creditProduct.credits},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `
  );

  // Log the credit purchase
  await db.insert(usageHistory).values({
    id: randomUUID(),
    userId,
    action: "credits_purchased",
    amount: creditProduct.credits,
    metadata: {
      packageId: creditProduct.id,
      checkoutId: data.id,
      productId: data.product_id,
    },
    createdAt: new Date(),
  });

  console.log(`[Polar Webhook] Added ${creditProduct.credits} credits to user ${userId}`);
}
