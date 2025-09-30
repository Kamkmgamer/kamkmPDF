import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { eq, and, gte, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { userSubscriptions, usageHistory } from "~/server/db/schema";
import {
  getTierConfig,
  hasExceededQuota,
  getUpgradeSuggestion,
  getUsagePercentage,
  type SubscriptionTier,
  TIER_CONFIGS,
} from "~/server/subscription/tiers";

export const subscriptionRouter = createTRPCRouter({
  /**
   * Get current user's subscription details
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Get or create subscription
    let subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    // If no subscription exists, create a starter one
    if (!subscription[0]) {
      const id = randomUUID();
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.insert(userSubscriptions).values({
        id,
        userId,
        tier: "starter",
        status: "active",
        pdfsUsedThisMonth: 0,
        storageUsedBytes: 0,
        periodStart: now,
        periodEnd,
      });

      subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);
    }

    const sub = subscription[0];
    if (!sub) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create subscription",
      });
    }

    // Get tier config
    const tierConfig = getTierConfig(sub.tier as SubscriptionTier);

    // Calculate usage percentages
    const pdfUsagePercent = getUsagePercentage(
      sub.tier as SubscriptionTier,
      sub.pdfsUsedThisMonth,
      "pdfsPerMonth",
    );

    const storageUsagePercent = getUsagePercentage(
      sub.tier as SubscriptionTier,
      sub.storageUsedBytes / (1024 * 1024 * 1024), // Convert to GB
      "storageGB",
    );

    // Get upgrade suggestion
    const upgradeSuggestion = getUpgradeSuggestion(
      sub.tier as SubscriptionTier,
      sub.pdfsUsedThisMonth,
      sub.storageUsedBytes / (1024 * 1024 * 1024),
    );

    return {
      ...sub,
      tierConfig,
      usage: {
        pdfs: {
          used: sub.pdfsUsedThisMonth,
          limit: tierConfig.quotas.pdfsPerMonth,
          percentage: pdfUsagePercent,
        },
        storage: {
          usedBytes: sub.storageUsedBytes,
          usedGB: sub.storageUsedBytes / (1024 * 1024 * 1024),
          limitGB: tierConfig.quotas.storageGB,
          percentage: storageUsagePercent,
        },
      },
      upgradeSuggestion,
    };
  }),

  /**
   * Check if user can generate a PDF (quota check)
   */
  canGeneratePdf: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (!subscription[0]) {
      // No subscription = starter tier with 0 usage
      return {
        canGenerate: true,
        reason: "",
        pdfsRemaining: 5,
      };
    }

    const sub = subscription[0];
    const tier = sub.tier as SubscriptionTier;
    const tierConfig = getTierConfig(tier);

    // Check if quota exceeded
    const exceeded = hasExceededQuota(
      tier,
      sub.pdfsUsedThisMonth,
      "pdfsPerMonth",
    );

    if (exceeded) {
      return {
        canGenerate: false,
        reason: `You've reached your monthly limit of ${tierConfig.quotas.pdfsPerMonth} PDFs. Please upgrade to continue.`,
        pdfsRemaining: 0,
      };
    }

    const remaining =
      tierConfig.quotas.pdfsPerMonth === -1
        ? -1
        : tierConfig.quotas.pdfsPerMonth - sub.pdfsUsedThisMonth;

    return {
      canGenerate: true,
      reason: "",
      pdfsRemaining: remaining,
    };
  }),

  /**
   * Increment PDF usage (called after successful generation)
   */
  incrementPdfUsage: protectedProcedure
    .input(z.object({ fileSize: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Get subscription
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      if (!subscription[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const sub = subscription[0];

      // Update usage
      await db
        .update(userSubscriptions)
        .set({
          pdfsUsedThisMonth: sub.pdfsUsedThisMonth + 1,
          storageUsedBytes: sub.storageUsedBytes + (input.fileSize ?? 0),
        })
        .where(eq(userSubscriptions.id, sub.id));

      // Log usage history
      await db.insert(usageHistory).values({
        id: randomUUID(),
        userId,
        action: "pdf_generated",
        amount: 1,
        metadata: { fileSize: input.fileSize },
      });

      return { success: true };
    }),

  /**
   * Reset monthly usage (called by cron job)
   */
  resetMonthlyUsage: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;

    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (!subscription[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription not found",
      });
    }

    const sub = subscription[0];
    const now = new Date();
    const newPeriodEnd = new Date(now);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    await db
      .update(userSubscriptions)
      .set({
        pdfsUsedThisMonth: 0,
        periodStart: now,
        periodEnd: newPeriodEnd,
      })
      .where(eq(userSubscriptions.id, sub.id));

    return { success: true };
  }),

  /**
   * Get all available tiers for comparison
   */
  getAllTiers: protectedProcedure.query(async () => {
    return Object.values(TIER_CONFIGS);
  }),

  /**
   * Get usage history for analytics
   */
  getUsageHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(30),
        action: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const history = await db
        .select()
        .from(usageHistory)
        .where(
          input.action
            ? and(
                eq(usageHistory.userId, userId),
                eq(usageHistory.action, input.action),
              )
            : eq(usageHistory.userId, userId),
        )
        .limit(input.limit)
        .orderBy(sql`${usageHistory.createdAt} DESC`);

      return history;
    }),

  /**
   * Simulate tier upgrade (for testing - in production this would integrate with payment)
   */
  upgradeTier: protectedProcedure
    .input(
      z.object({
        newTier: z.enum(["starter", "professional", "business", "enterprise"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      if (!subscription[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const sub = subscription[0];

      // Update tier
      await db
        .update(userSubscriptions)
        .set({
          tier: input.newTier,
          status: "active",
        })
        .where(eq(userSubscriptions.id, sub.id));

      // Log the upgrade
      await db.insert(usageHistory).values({
        id: randomUUID(),
        userId,
        action: "tier_upgraded",
        amount: 1,
        metadata: { oldTier: sub.tier, newTier: input.newTier },
      });

      return { success: true, newTier: input.newTier };
    }),

  /**
   * Check if user needs to reset their quota (period ended)
   */
  checkAndResetIfNeeded: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;

    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (!subscription[0]) {
      return { reset: false };
    }

    const sub = subscription[0];
    const now = new Date();

    // Check if period has ended
    if (sub.periodEnd && now > sub.periodEnd) {
      const newPeriodEnd = new Date(now);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

      await db
        .update(userSubscriptions)
        .set({
          pdfsUsedThisMonth: 0,
          periodStart: now,
          periodEnd: newPeriodEnd,
        })
        .where(eq(userSubscriptions.id, sub.id));

      return { reset: true };
    }

    return { reset: false };
  }),
});
