/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
// Clerk server helpers
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  req?: Request;
}) => {
  // Use Clerk to get the current user/session from the request headers if present.
  // Note: When using Next.js API handlers, pass the incoming Request to this helper via opts.req.
  let clerkUserId: string | null = null;
  try {
    // getAuth works with Next.js / Next API; it expects headers and cookies context. If this call
    // doesn't apply in your environment, it will safely return null fields.
    const auth = getAuth(opts.req as unknown as NextRequest);
    if (auth?.userId) clerkUserId = auth.userId;
  } catch {
    // ignore parsing errors; auth stays null
    clerkUserId = null;
  }

  return {
    db,
    clerkUserId,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you can get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Handle authentication errors with better messages
    if (error instanceof TRPCError) {
      if (error.code === "UNAUTHORIZED") {
        return {
          ...shape,
          message: "Please sign in to access this feature.",
          data: {
            ...shape.data,
            zodError:
              error.cause instanceof ZodError ? error.cause.flatten() : null,
          },
        };
      }
      if (error.code === "FORBIDDEN") {
        return {
          ...shape,
          message: "You don't have permission to access this resource.",
          data: {
            ...shape.data,
            zodError:
              error.cause instanceof ZodError ? error.cause.flatten() : null,
          },
        };
      }
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure middleware - requires a Clerk authenticated user
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx?.clerkUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please sign in to continue.",
    });
  }
  return next({ ctx: { ...ctx, userId: ctx.clerkUserId } });
});

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAuth);
