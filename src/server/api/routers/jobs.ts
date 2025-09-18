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
    .input(z.object({ prompt: z.string().min(1).max(2000) }))
    .mutation(async ({ input, ctx }) => {
      const id = randomUUID();
      const userId = ctx.userId;
      await db.insert(jobs).values({ id, prompt: input.prompt, userId });
      const created = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, id))
        .limit(1);
      return created[0] ?? null;
    }),

  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const res = await db.select().from(jobs).where(eq(jobs.id, input)).limit(1);
    return res[0] ?? null;
  }),
});
