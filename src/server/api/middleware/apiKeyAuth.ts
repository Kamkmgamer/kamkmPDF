import { TRPCError } from "@trpc/server";
import { createHashSync } from "~/lib/crypto-edge";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { apiKeys } from "~/server/db/schema";

/**
 * Verify API key and return user ID
 */
export async function verifyApiKey(key: string): Promise<{
  userId: string;
  permissions: string[];
}> {
  if (!key?.startsWith("sk_live_")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid API key format",
    });
  }

  // Hash the provided key
  const keyHash = createHashSync("sha256", key);

  // Look up the key in the database
  const apiKey = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
    .limit(1);

  if (!apiKey[0]) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or inactive API key",
    });
  }

  // Check if key is expired
  if (apiKey[0].expiresAt && new Date() > apiKey[0].expiresAt) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "API key has expired",
    });
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey[0].id));

  return {
    userId: apiKey[0].userId,
    permissions: apiKey[0].permissions ?? [],
  };
}

/**
 * Check if API key has specific permission
 */
export function hasPermission(
  permissions: string[],
  required: string,
): boolean {
  return permissions.includes(required) || permissions.includes("*");
}
