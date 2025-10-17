import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import {
  getTierConfig,
  hasExceededQuota,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

export const jobsRouter = createTRPCRouter({
  listRecent: publicProcedure
    .input(z.object({ limit: z.number().optional().default(20) }))
    .query(async ({ input }) => {
      const res = await db
        .select()
        .from(jobs)
        .limit(input.limit)
        .orderBy(desc(jobs.createdAt));
      return res;
    }),

  create: protectedProcedure
    .input(z.object({ prompt: z.string().min(1).max(8000) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;

      // Check subscription and quota
      let subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      // Create subscription if doesn't exist
      if (!subscription[0]) {
        const subId = randomUUID();
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.insert(userSubscriptions).values({
          id: subId,
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
          message: "Failed to get subscription",
        });
      }

      // Check if user has exceeded quota
      const tier = sub.tier as SubscriptionTier;
      const tierConfig = getTierConfig(tier);
      const exceeded = hasExceededQuota(
        tier,
        sub.pdfsUsedThisMonth,
        "pdfsPerMonth",
      );

      if (exceeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You've reached your monthly limit of ${tierConfig.quotas.pdfsPerMonth} PDFs. Please upgrade your plan to continue.`,
        });
      }

      // Create the job
      const id = randomUUID();
      await db.insert(jobs).values({ id, prompt: input.prompt, userId });
      const created = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, id))
        .limit(1);

      // Best-effort ping the worker drain route so processing starts ASAP on Vercel
      try {
        const base = env.NEXT_PUBLIC_APP_URL;
        // Ensure no duplicate slashes
        const url = new URL("/api/worker/drain", base).toString();
        // Fire-and-forget; do not await
        const headers: Record<string, string> = {};
        if (process.env.PDFPROMPT_WORKER_SECRET) {
          headers["x-worker-secret"] = process.env.PDFPROMPT_WORKER_SECRET;
        }
        void fetch(url, { headers }).catch(() => undefined);
      } catch {
        // ignore
      }
      return created[0] ?? null;
    }),

  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const res = await db.select().from(jobs).where(eq(jobs.id, input)).limit(1);

    if (!res[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job not found",
      });
    }

    // Check if user owns the job
    if (res[0].userId !== ctx.userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this job",
      });
    }

    return res[0];
  }),

  recreate: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        mode: z.enum(["same", "edit"]),
        newPrompt: z.string().optional(),
        imageUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingJob = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, input.jobId))
        .limit(1);

      if (!existingJob[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (existingJob[0].userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to recreate this job",
        });
      }

      // Get user subscription
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, ctx.userId))
        .limit(1);

      const sub = subscription[0];
      if (!sub) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Subscription not found",
        });
      }

      // Determine credit cost
      const creditCost = input.mode === "edit" ? 0.5 : 1;
      const tier = sub.tier as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      // Check quota (treat 0.5 credit as half a PDF)
      const effectivePdfCount =
        sub.pdfsUsedThisMonth + (creditCost === 0.5 ? 0.5 : 1);
      // -1 means unlimited, skip quota check
      if (
        tierConfig.quotas.pdfsPerMonth !== -1 &&
        effectivePdfCount > tierConfig.quotas.pdfsPerMonth
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You've reached your monthly limit of ${tierConfig.quotas.pdfsPerMonth} PDFs. Please upgrade your plan to continue.`,
        });
      }

      // Build the new prompt
      let finalPrompt = existingJob[0].prompt ?? "";
      if (input.mode === "edit" && input.newPrompt) {
        finalPrompt = `${finalPrompt}\n\n[EDIT INSTRUCTIONS]:\n${input.newPrompt}`;
      }

      // Create new job
      const newId = randomUUID();
      await db.insert(jobs).values({
        id: newId,
        prompt: finalPrompt,
        userId: ctx.userId,
        status: "queued",
        generatedHtml: existingJob[0].generatedHtml, // Pass base HTML
        imageUrls:
          input.imageUrls as unknown as typeof jobs.$inferInsert.imageUrls,
        regenerationCount: (existingJob[0].regenerationCount ?? 0) + 1,
        parentJobId: input.jobId,
      });

      // Update usage (increment by credit cost as fraction)
      await db
        .update(userSubscriptions)
        .set({
          pdfsUsedThisMonth: effectivePdfCount,
        })
        .where(eq(userSubscriptions.userId, ctx.userId));

      // Trigger worker
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

      const created = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, newId))
        .limit(1);

      return created[0] ?? null;
    }),
});
