import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  usageHistory,
  jobs,
  files,
  userSubscriptions,
} from "~/server/db/schema";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

export const analyticsRouter = createTRPCRouter({
  /**
   * Get usage analytics overview
   */
  getOverview: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has analytics access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.analytics) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Analytics dashboard is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      const startDate =
        input.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate ?? new Date();

      // Get total PDFs created
      const totalPdfs = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(
          and(
            eq(jobs.userId, userId),
            gte(jobs.createdAt, startDate),
            lte(jobs.createdAt, endDate),
          ),
        );

      // Get completed PDFs
      const completedPdfs = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(
          and(
            eq(jobs.userId, userId),
            eq(jobs.status, "completed"),
            gte(jobs.createdAt, startDate),
            lte(jobs.createdAt, endDate),
          ),
        );

      // Get failed PDFs
      const failedPdfs = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(
          and(
            eq(jobs.userId, userId),
            eq(jobs.status, "failed"),
            gte(jobs.createdAt, startDate),
            lte(jobs.createdAt, endDate),
          ),
        );

      // Get total storage used
      const storageUsed = await db
        .select({ total: sql<number>`COALESCE(SUM(${files.size}), 0)::int` })
        .from(files)
        .where(eq(files.userId, userId));

      // Get average processing time
      const avgProcessingTime = await db
        .select({
          avg: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${jobs.updatedAt} - ${jobs.createdAt}))), 0)::float`,
        })
        .from(jobs)
        .where(
          and(
            eq(jobs.userId, userId),
            eq(jobs.status, "completed"),
            gte(jobs.createdAt, startDate),
            lte(jobs.createdAt, endDate),
          ),
        );

      return {
        totalPdfs: totalPdfs[0]?.count ?? 0,
        completedPdfs: completedPdfs[0]?.count ?? 0,
        failedPdfs: failedPdfs[0]?.count ?? 0,
        successRate:
          totalPdfs[0]?.count && totalPdfs[0].count > 0
            ? ((completedPdfs[0]?.count ?? 0) / totalPdfs[0].count) * 100
            : 0,
        storageUsedBytes: storageUsed[0]?.total ?? 0,
        avgProcessingTimeSeconds: avgProcessingTime[0]?.avg ?? 0,
      };
    }),

  /**
   * Get PDF generation trends over time
   */
  getTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        interval: z.enum(["day", "week", "month"]).default("day"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has analytics access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.analytics) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Analytics dashboard is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      const startDate =
        input.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate ?? new Date();

      // Get daily/weekly/monthly aggregates
      const intervalFormat =
        input.interval === "day"
          ? "YYYY-MM-DD"
          : input.interval === "week"
            ? "YYYY-IW"
            : "YYYY-MM";

      const trends = await db
        .select({
          period: sql<string>`TO_CHAR(${jobs.createdAt}, ${intervalFormat})`,
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) FILTER (WHERE ${jobs.status} = 'completed')::int`,
          failed: sql<number>`count(*) FILTER (WHERE ${jobs.status} = 'failed')::int`,
        })
        .from(jobs)
        .where(
          and(
            eq(jobs.userId, userId),
            gte(jobs.createdAt, startDate),
            lte(jobs.createdAt, endDate),
          ),
        )
        .groupBy(sql`TO_CHAR(${jobs.createdAt}, ${intervalFormat})`)
        .orderBy(sql`TO_CHAR(${jobs.createdAt}, ${intervalFormat})`);

      return trends;
    }),

  /**
   * Get most used prompts/templates
   */
  getTopPrompts: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has analytics access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.analytics) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Analytics dashboard is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      // Get most common prompts (first 100 chars as identifier)
      const topPrompts = await db
        .select({
          promptPreview: sql<string>`LEFT(${jobs.prompt}, 100)`,
          count: sql<number>`count(*)::int`,
          avgProcessingTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${jobs.updatedAt} - ${jobs.createdAt})))::float`,
        })
        .from(jobs)
        .where(and(eq(jobs.userId, userId), eq(jobs.status, "completed")))
        .groupBy(sql`LEFT(${jobs.prompt}, 100)`)
        .orderBy(desc(sql`count(*)`))
        .limit(input.limit);

      return topPrompts;
    }),

  /**
   * Get usage by action type
   */
  getUsageByAction: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has analytics access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.analytics) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Analytics dashboard is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      const startDate =
        input.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate ?? new Date();

      const usageByAction = await db
        .select({
          action: usageHistory.action,
          count: sql<number>`count(*)::int`,
          totalAmount: sql<number>`SUM(${usageHistory.amount})::int`,
        })
        .from(usageHistory)
        .where(
          and(
            eq(usageHistory.userId, userId),
            gte(usageHistory.createdAt, startDate),
            lte(usageHistory.createdAt, endDate),
          ),
        )
        .groupBy(usageHistory.action)
        .orderBy(desc(sql`count(*)`));

      return usageByAction;
    }),

  /**
   * Export analytics data as CSV
   */
  exportData: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        type: z.enum(["jobs", "usage", "all"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has analytics access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.analytics) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Analytics dashboard is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      const startDate =
        input.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate ?? new Date();

      let data: unknown[] = [];

      if (input.type === "jobs" || input.type === "all") {
        const jobsData = await db
          .select()
          .from(jobs)
          .where(
            and(
              eq(jobs.userId, userId),
              gte(jobs.createdAt, startDate),
              lte(jobs.createdAt, endDate),
            ),
          )
          .orderBy(desc(jobs.createdAt));

        data = [...data, ...jobsData];
      }

      if (input.type === "usage" || input.type === "all") {
        const usageData = await db
          .select()
          .from(usageHistory)
          .where(
            and(
              eq(usageHistory.userId, userId),
              gte(usageHistory.createdAt, startDate),
              lte(usageHistory.createdAt, endDate),
            ),
          )
          .orderBy(desc(usageHistory.createdAt));

        data = [...data, ...usageData];
      }

      return { data, format: "json" }; // Frontend can convert to CSV
    }),
});
