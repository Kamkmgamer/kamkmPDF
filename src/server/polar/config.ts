/**
 * Polar.sh SDK Configuration
 * Uses official @polar-sh/sdk for API interactions
 */

import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { db } from "~/server/db";
import { polarProducts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Polar SDK Client
 * Configured for sandbox or production based on access token
 */
export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN ?? "",
  server: "sandbox", // Change to "production" when ready
});

export const polarConfig = {
  webhookSecret: env.POLAR_WEBHOOK_SECRET ?? "",
} as const;

/**
 * Get Polar product ID for a subscription tier from database
 */
export async function getProductIdForTier(
  tier: "professional" | "classic" | "business" | "enterprise",
): Promise<string | null> {
  const product = await db
    .select()
    .from(polarProducts)
    .where(eq(polarProducts.tier, tier))
    .limit(1);

  return product[0]?.productId ?? null;
}

/**
 * Map Polar product ID back to tier from database
 */
export async function getTierFromProductId(
  productId: string,
): Promise<"professional" | "classic" | "business" | "enterprise" | null> {
  const product = await db
    .select()
    .from(polarProducts)
    .where(eq(polarProducts.productId, productId))
    .limit(1);

  return (product[0]?.tier as
    | "professional"
    | "classic"
    | "business"
    | "enterprise"
    | null) ?? null;
}

/**
 * Get authorization headers for Polar API requests
 * Note: When using the SDK, headers are handled automatically
 */
export function getPolarHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN ?? ""}`,
    "Content-Type": "application/json",
  };
}
