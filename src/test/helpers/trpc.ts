/**
 * tRPC Test Helpers
 *
 * Utilities for testing tRPC routers and procedures.
 */

import { createCaller } from "~/server/api/root";
import { db } from "~/server/db";

/**
 * Create a tRPC caller for testing
 * This allows testing tRPC procedures without HTTP
 */
export function createTestCaller(ctx: { clerkUserId?: string | null }) {
  return createCaller({
    db,
    clerkUserId: ctx.clerkUserId ?? null,
    headers: new Headers(),
  });
}

// Re-export createCaller for direct use
export { createCaller };
