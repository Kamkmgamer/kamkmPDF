/**
 * PayPal API Client
 * Handles PayPal subscription creation and management
 */

import {
  getPayPalAccessToken,
  getPayPalApiUrl,
  getPlanIdForTier,
} from "./config";
import type { SubscriptionTier } from "../subscription/tiers";

export interface CreateSubscriptionParams {
  planId: string;
  userId: string;
  userEmail: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  start_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(
  params: CreateSubscriptionParams,
): Promise<PayPalSubscription> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v1/billing/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: params.planId,
        custom_id: params.userId, // Store user ID for webhook processing
        application_context: {
          brand_name: "KamkmPDF",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
        subscriber: {
          email_address: params.userEmail,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal subscription: ${error}`);
  }

  return (await response.json()) as PayPalSubscription;
}

/**
 * Get subscription details from PayPal
 */
export async function getPayPalSubscription(
  subscriptionId: string,
): Promise<PayPalSubscription> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get PayPal subscription: ${response.statusText}`,
    );
  }

  return (await response.json()) as PayPalSubscription;
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason?: string,
): Promise<void> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason ?? "Customer requested cancellation",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to cancel PayPal subscription: ${response.statusText}`,
    );
  }
}

/**
 * Get approval URL from subscription response
 */
export function getApprovalUrl(
  subscription: PayPalSubscription,
): string | null {
  const approvalLink = subscription.links.find(
    (link) => link.rel === "approve",
  );
  return approvalLink?.href ?? null;
}

/**
 * Create subscription for a tier
 */
export async function createSubscriptionForTier(
  tier: Exclude<SubscriptionTier, "starter">,
  userId: string,
  userEmail: string,
  baseUrl: string,
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const planId = getPlanIdForTier(tier);

  if (!planId) {
    throw new Error(`No PayPal plan configured for tier: ${tier}`);
  }

  const subscription = await createPayPalSubscription({
    planId,
    userId,
    userEmail,
    returnUrl: `${baseUrl}/dashboard/subscription/success`,
    cancelUrl: `${baseUrl}/pricing`,
  });

  const approvalUrl = getApprovalUrl(subscription);

  if (!approvalUrl) {
    throw new Error("No approval URL returned from PayPal");
  }

  return {
    subscriptionId: subscription.id,
    approvalUrl,
  };
}
