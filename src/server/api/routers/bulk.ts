import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import {
  getTierConfig,
  hasExceededQuota,
  type SubscriptionTier,
} from "~/server/subscription/tiers";
import { env } from "~/env";

export const bulkRouter = createTRPCRouter({
  /**
   * Create bulk PDF generation jobs from CSV data
   */
  createBulk: protectedProcedure
    .input(
      z.object({
        prompts: z.array(
          z.object({
            prompt: z.string().min(1).max(8000),
            metadata: z.record(z.unknown()).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has bulk generation access
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
      const tier = sub.tier as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.bulkGeneration) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Bulk generation is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      // Check quota for all PDFs
      const totalNeeded = sub.pdfsUsedThisMonth + input.prompts.length;
      const exceeded = hasExceededQuota(tier, totalNeeded, "pdfsPerMonth");

      if (exceeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You need ${input.prompts.length} PDFs but only have ${tierConfig.quotas.pdfsPerMonth === -1 ? "unlimited" : tierConfig.quotas.pdfsPerMonth - sub.pdfsUsedThisMonth} remaining. Please upgrade your plan.`,
        });
      }

      // Create jobs for each prompt
      const jobIds: string[] = [];
      for (const item of input.prompts) {
        const id = randomUUID();
        await db.insert(jobs).values({
          id,
          prompt: item.prompt,
          userId,
          status: "queued",
        });
        jobIds.push(id);
      }

      // Trigger worker for all jobs
      try {
        const base = env.NEXT_PUBLIC_APP_URL;
        const url = new URL("/api/worker/drain", base).toString();
        const headers: Record<string, string> = {};
        if (process.env.PDFPROMPT_WORKER_SECRET) {
          headers["x-worker-secret"] = process.env.PDFPROMPT_WORKER_SECRET;
        }
        void fetch(url, { headers }).catch(() => undefined);
      } catch {
        // ignore
      }

      return {
        success: true,
        jobIds,
        count: jobIds.length,
      };
    }),

  /**
   * Get status of bulk jobs
   */
  getBulkStatus: protectedProcedure
    .input(z.object({ jobIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const jobStatuses = await Promise.all(
        input.jobIds.map(async (jobId) => {
          const job = await db
            .select()
            .from(jobs)
            .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
            .limit(1);

          return job[0]
            ? {
                id: job[0].id,
                status: job[0].status,
                progress: job[0].progress,
                resultFileId: job[0].resultFileId,
              }
            : null;
        }),
      );

      const completed = jobStatuses.filter(
        (j) => j?.status === "completed",
      ).length;
      const failed = jobStatuses.filter((j) => j?.status === "failed").length;
      const processing = jobStatuses.filter(
        (j) => j?.status === "processing" || j?.status === "queued",
      ).length;

      return {
        jobs: jobStatuses.filter((j) => j !== null),
        summary: {
          total: input.jobIds.length,
          completed,
          failed,
          processing,
        },
      };
    }),

  /**
   * Parse CSV data for bulk generation
   */
  parseCSV: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .mutation(async ({ input }) => {
      // Simple CSV parser - in production, use a proper CSV library
      const lines = input.csvContent.split("\n").filter((line) => line.trim());
      if (lines.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CSV file is empty",
        });
      }

      // First line is header
      const headers = lines[0]!.split(",").map((h) => h.trim());

      // Check if there's a "prompt" column
      const promptIndex = headers.findIndex(
        (h) => h.toLowerCase() === "prompt" || h.toLowerCase() === "text",
      );

      if (promptIndex === -1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: 'CSV must have a "prompt" or "text" column',
        });
      }

      // Parse data rows
      const prompts = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const prompt = values[promptIndex] ?? "";

        // Create metadata from other columns
        const metadata: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (index !== promptIndex && values[index]) {
            metadata[header] = values[index]!;
          }
        });

        return {
          prompt,
          metadata,
        };
      });

      return {
        prompts: prompts.filter((p) => p.prompt),
        count: prompts.filter((p) => p.prompt).length,
      };
    }),

  /**
   * Get bulk generation history
   */
  getBulkHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has bulk generation access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.bulkGeneration) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bulk generation is not available on your plan.",
        });
      }

      // Get recent jobs
      const recentJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.userId, userId))
        .orderBy(desc(jobs.createdAt))
        .limit(input.limit);

      return recentJobs;
    }),
});
