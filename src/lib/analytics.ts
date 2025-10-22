/**
 * Analytics Tracking Utilities
 * Track conversion events for email campaigns and pricing
 */

// Google Analytics 4 event tracking
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && "gtag" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    (window as any).gtag("event", eventName, eventParams);
  }
}

// Email campaign conversion tracking
export function trackEmailConversion(
  campaignType: "free_user_funnel" | "churned_user_funnel",
  emailType: string,
  tier: string,
  revenue?: number
) {
  trackEvent("email_conversion", {
    campaign_type: campaignType,
    email_type: emailType,
    tier,
    value: revenue ?? 0,
    currency: "USD",
  });
}

// Pricing page events
export function trackPricingView() {
  trackEvent("view_pricing_page");
}

export function trackUpgradeClick(tier: string, source = "pricing_page") {
  trackEvent("upgrade_click", {
    tier,
    source,
  });
}

export function trackUpgradeSuccess(tier: string, revenue: number, billingCycle: "monthly" | "yearly") {
  trackEvent("purchase", {
    tier,
    value: revenue,
    currency: "USD",
    billing_cycle: billingCycle,
  });
}

// Free tier events
export function trackFreeSignup() {
  trackEvent("sign_up", {
    method: "email",
    tier: "free",
  });
}

export function trackQuotaReached(tier: string, pdfsUsed: number) {
  trackEvent("quota_reached", {
    tier,
    pdfs_used: pdfsUsed,
  });
}

// Churn events
export function trackCancellation(tier: string, reason?: string) {
  trackEvent("subscription_cancelled", {
    tier,
    cancellation_reason: reason ?? "not_specified",
  });
}

export function trackReactivation(tier: string, previousTier: string) {
  trackEvent("subscription_reactivated", {
    tier,
    previous_tier: previousTier,
  });
}

// Email engagement tracking
export function trackEmailOpen(campaignId: string, emailType: string) {
  trackEvent("email_opened", {
    campaign_id: campaignId,
    email_type: emailType,
  });
}

export function trackEmailClick(campaignId: string, emailType: string, link: string) {
  trackEvent("email_clicked", {
    campaign_id: campaignId,
    email_type: emailType,
    link,
  });
}

// Classic plan specific tracking
export function trackClassicOfferView(source: "email" | "other") {
  trackEvent("classic_offer_viewed", {
    source,
  });
}

export function trackClassicOfferConversion(offerType: "exclusive" | "winback" | "final") {
  trackEvent("classic_offer_conversion", {
    offer_type: offerType,
    tier: "classic",
    value: 5,
    currency: "USD",
  });
}

// Dashboard for conversion rates
export interface ConversionMetrics {
  freeSignups: number;
  proUpgrades: number;
  classicUpgrades: number;
  businessUpgrades: number;
  churnedUsers: number;
  reactivations: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailConversions: number;
}

// Helper to calculate conversion rates
export function calculateConversionRate(conversions: number, total: number): number {
  if (total === 0) return 0;
  return (conversions / total) * 100;
}
