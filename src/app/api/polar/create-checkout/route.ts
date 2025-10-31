/**
 * Polar Checkout Route
 * Uses official @polar-sh/nextjs SDK for checkout creation
 */

import { Checkout } from "@polar-sh/nextjs";
import { env } from "~/env";

export const runtime = "edge";

export const GET = Checkout({
  accessToken: env.POLAR_ACCESS_TOKEN!,
  successUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/subscription/success?checkout_id={CHECKOUT_ID}`,
  server: "production", // Use "sandbox" for development, "production" for live
});
