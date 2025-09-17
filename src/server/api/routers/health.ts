import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const healthRouter = createTRPCRouter({
  healthz: publicProcedure.query(() => "ok"),
});
