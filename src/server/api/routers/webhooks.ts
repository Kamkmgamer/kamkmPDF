import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID, createHash } from "crypto";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { webhooks, userSubscriptions } from "~/server/db/schema";
import type { SubscriptionTier } from "~/server/subscription/tiers";

const AVAILABLE_EVENTS = [
  "pdf.created",
  "pdf.completed",
  "pdf.failed",
  "subscription.updated",
  "subscription.cancelled",
  "team.member_added",
  "team.member_removed",
] as const;

export const webhooksRouter = createTRPCRouter({
  /**
   * List all webhooks for the user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Check if user has webhook access (Enterprise only)
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;

    if (tier !== "enterprise") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Webhooks are only available on Enterprise plans.",
      });
    }

    const userWebhooks = await db
      .select({
        id: webhooks.id,
        url: webhooks.url,
        events: webhooks.events,
        isActive: webhooks.isActive,
        lastTriggeredAt: webhooks.lastTriggeredAt,
        failureCount: webhooks.failureCount,
        createdAt: webhooks.createdAt,
      })
      .from(webhooks)
      .where(eq(webhooks.userId, userId));

    return userWebhooks;
  }),

  /**
   * Create a new webhook
   */
  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.enum(AVAILABLE_EVENTS)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has webhook access (Enterprise only)
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;

      if (tier !== "enterprise") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Webhooks are only available on Enterprise plans.",
        });
      }

      // Generate webhook secret
      const secret = randomUUID() + randomUUID();

      // Create webhook
      const id = randomUUID();
      await db.insert(webhooks).values({
        id,
        userId,
        url: input.url,
        events: input.events as unknown as typeof webhooks.$inferInsert.events,
        secret,
        isActive: true,
        failureCount: 0,
      });

      return {
        id,
        secret, // Return secret only once
        url: input.url,
        events: input.events,
      };
    }),

  /**
   * Update a webhook
   */
  update: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.enum(AVAILABLE_EVENTS)).min(1).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existing = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.webhookId), eq(webhooks.userId, userId)),
        )
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      const updates: Partial<typeof webhooks.$inferInsert> = {};
      if (input.url) updates.url = input.url;
      if (input.events)
        updates.events =
          input.events as unknown as typeof webhooks.$inferInsert.events;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db
        .update(webhooks)
        .set(updates)
        .where(eq(webhooks.id, input.webhookId));

      return { success: true };
    }),

  /**
   * Delete a webhook
   */
  delete: protectedProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existing = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.webhookId), eq(webhooks.userId, userId)),
        )
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      await db.delete(webhooks).where(eq(webhooks.id, input.webhookId));

      return { success: true };
    }),

  /**
   * Test a webhook by sending a test event
   */
  test: protectedProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const webhook = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.webhookId), eq(webhooks.userId, userId)),
        )
        .limit(1);

      if (!webhook[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      // Create test payload
      const payload = {
        event: "webhook.test",
        timestamp: new Date().toISOString(),
        data: {
          message: "This is a test webhook event",
        },
      };

      // Create signature
      const signature = createHash("sha256")
        .update(JSON.stringify(payload) + webhook[0].secret)
        .digest("hex");

      try {
        const response = await fetch(webhook[0].url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return { success: true, status: response.status };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get available webhook events
   */
  getAvailableEvents: protectedProcedure.query(() => {
    return AVAILABLE_EVENTS.map((event) => ({
      name: event,
      description: getEventDescription(event),
    }));
  }),
});

function getEventDescription(event: string): string {
  const descriptions: Record<string, string> = {
    "pdf.created": "Triggered when a new PDF generation job is created",
    "pdf.completed": "Triggered when a PDF generation is completed",
    "pdf.failed": "Triggered when a PDF generation fails",
    "subscription.updated": "Triggered when a subscription is updated",
    "subscription.cancelled": "Triggered when a subscription is cancelled",
    "team.member_added": "Triggered when a team member is added",
    "team.member_removed": "Triggered when a team member is removed",
  };
  return descriptions[event] ?? "";
}
