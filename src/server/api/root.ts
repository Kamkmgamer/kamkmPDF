import { healthRouter } from "~/server/api/routers/health";
import { jobsRouter } from "~/server/api/routers/jobs";
import { filesRouter } from "~/server/api/routers/files";
import { subscriptionRouter } from "~/server/api/routers/subscription";
import { versionsRouter } from "~/server/api/routers/versions";
import { apiKeysRouter } from "~/server/api/routers/apiKeys";
import { teamsRouter } from "~/server/api/routers/teams";
import { brandingRouter } from "~/server/api/routers/branding";
import { webhooksRouter } from "~/server/api/routers/webhooks";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { bulkRouter } from "~/server/api/routers/bulk";
import { referralRouter } from "~/server/api/routers/referrals";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  jobs: jobsRouter,
  files: filesRouter,
  subscription: subscriptionRouter,
  versions: versionsRouter,
  apiKeys: apiKeysRouter,
  teams: teamsRouter,
  branding: brandingRouter,
  webhooks: webhooksRouter,
  analytics: analyticsRouter,
  bulk: bulkRouter,
  referrals: referralRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
