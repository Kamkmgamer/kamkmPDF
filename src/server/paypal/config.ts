/**
 * PayPal Configuration
 * Handles PayPal SDK initialization and configuration
 */

import { env } from "~/env";

export const paypalConfig = {
  clientId: env.PAYPAL_CLIENT_ID,
  clientSecret: env.PAYPAL_CLIENT_SECRET,
  mode: env.PAYPAL_MODE,
  webhookId: env.PAYPAL_WEBHOOK_ID,
  plans: {
    professional: env.PAYPAL_PLAN_ID_PROFESSIONAL,
    business: env.PAYPAL_PLAN_ID_BUSINESS,
    enterprise: env.PAYPAL_PLAN_ID_ENTERPRISE,
  },
} as const;

/**
 * Get PayPal API base URL based on mode
 */
export function getPayPalApiUrl(): string {
  return paypalConfig.mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/**
 * Get PayPal plan ID for a subscription tier
 */
export function getPlanIdForTier(
  tier: "professional" | "business" | "enterprise",
): string | undefined {
  return paypalConfig.plans[tier];
}

/**
 * Map PayPal plan ID back to tier
 */
export function getTierFromPlanId(
  planId: string,
): "professional" | "business" | "enterprise" | null {
  const plans = paypalConfig.plans;

  if (planId === plans.professional) return "professional";
  if (planId === plans.business) return "business";
  if (planId === plans.enterprise) return "enterprise";

  return null;
}

/**
 * Get PayPal access token for API requests
 */
export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`,
  ).toString("base64");

  const response = await fetch(`${getPayPalApiUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get PayPal access token: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}
