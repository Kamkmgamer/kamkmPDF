import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { jobs } from "~/server/db/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

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
      const id = randomUUID();
      const userId = ctx.userId;
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
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const existingJob = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, input))
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

      const newId = randomUUID();
      await db.insert(jobs).values({
        id: newId,
        prompt: existingJob[0].prompt,
        userId: ctx.userId,
        status: "queued",
      });

      const created = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, newId))
        .limit(1);

      return created[0] ?? null;
    }),
});
