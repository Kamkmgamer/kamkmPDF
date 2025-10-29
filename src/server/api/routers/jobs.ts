import { z } from "zod";
import { randomUUID } from "crypto";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import {
  checkForDuplicateJob,
  storePromptHash,
  generatePromptHash,
} from "~/lib/deduplication";
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

  create: publicProcedure
    .input(z.object({ prompt: z.string().min(1).max(32000) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.clerkUserId ?? null;

      // For authenticated users, check subscription and quota
      if (userId) {
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
          
          // Generate referral code
          const hash = userId.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
          }, 0);
          const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
          const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
          const referralCode = `REF${code}${timestamp}`;

          await db.insert(userSubscriptions).values({
            id: subId,
            userId,
            tier: "starter",
            status: "active",
            pdfsUsedThisMonth: 0,
            storageUsedBytes: 0,
            referralCode,
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
      }
      // For unauthenticated users (guests), skip quota checks and allow PDF generation

      // Check for duplicate jobs before creating a new one
      const deduplicationResult = await checkForDuplicateJob(input.prompt, {
        userId,
        windowMinutes: 5, // Consider jobs from last 5 minutes
      });

      if (deduplicationResult.isDuplicate && deduplicationResult.existingJobId) {
        // Return the existing job instead of creating a new one
        const existingJob = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, deduplicationResult.existingJobId))
          .limit(1);

        if (existingJob[0]) {
          return existingJob[0];
        }
      }

      // Create the job
      const id = randomUUID();
      const promptHash = generatePromptHash(input.prompt, { userId: userId ?? undefined });
      
      await db.insert(jobs).values({ 
        id, 
        prompt: input.prompt, 
        userId,
        promptHash,
      });
      
      // Store the prompt hash for future deduplication
      await storePromptHash(id, promptHash);
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

  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const res = await db.select().from(jobs).where(eq(jobs.id, input)).limit(1);

    if (!res[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job not found",
      });
    }

    // For authenticated users, check if they own the job
    // For unauthenticated users, allow access to jobs with null userId
    if (ctx.clerkUserId && res[0].userId !== ctx.clerkUserId) {
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

      // Check for duplicate jobs before creating a new one
      const deduplicationResult = await checkForDuplicateJob(finalPrompt, {
        userId: ctx.userId,
        windowMinutes: 5,
      });

      if (deduplicationResult.isDuplicate && deduplicationResult.existingJobId) {
        // Return the existing job instead of creating a new one
        const existingDuplicateJob = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, deduplicationResult.existingJobId))
          .limit(1);

        if (existingDuplicateJob[0]) {
          return existingDuplicateJob[0];
        }
      }

      // Create new job
      const newId = randomUUID();
      const promptHash = generatePromptHash(finalPrompt, { userId: ctx.userId ?? undefined });
      
      await db.insert(jobs).values({
        id: newId,
        prompt: finalPrompt,
        userId: ctx.userId,
        status: "queued",
        promptHash,
        generatedHtml: existingJob[0].generatedHtml, // Pass base HTML
        imageUrls:
          input.imageUrls as unknown as typeof jobs.$inferInsert.imageUrls,
        regenerationCount: (existingJob[0].regenerationCount ?? 0) + 1,
        parentJobId: input.jobId,
      });

      // Store the prompt hash for future deduplication
      await storePromptHash(newId, promptHash);

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
