/**
 * Email Campaign Triggers
 * Functions to trigger email campaigns based on user actions
 */

import { scheduleFreeUserFunnel as _scheduleFreeUserFunnel, scheduleChurnedUserFunnel, cancelUserCampaigns, scheduleEmail } from "./campaign-service";
import { sendWelcomeEmail } from "./send-email";
import { db } from "../db";
import { userSubscriptions } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Trigger when a new user signs up
 * Called from Clerk webhook or signup flow
 */
export async function onUserSignup(
  userId: string,
  userEmail: string,
  userName: string
) {
  try {
    // Send immediate welcome email
    await sendWelcomeEmail({
      toEmail: userEmail,
      userName,
      pdfsRemaining: 3,
    });
    
    console.log(`✅ Sent immediate welcome email to ${userEmail}`);

    // Schedule follow-up emails (Day 3: Quota reminder, Day 7: Classic offer)
    await scheduleEmail({
      userId,
      userEmail,
      userName,
      campaignType: "free_user_funnel",
      emailType: "quota_reminder",
      daysDelay: 3,
      metadata: { pdfsUsed: 0, pdfsRemaining: 3 },
    });

    await scheduleEmail({
      userId,
      userEmail,
      userName,
      campaignType: "free_user_funnel",
      emailType: "classic_offer",
      daysDelay: 7,
      metadata: { pdfsUsed: 0 },
    });
    
    console.log(`✅ Scheduled follow-up email funnel for ${userId}`);
  } catch (error) {
    console.error("Failed to send welcome email or schedule funnel:", error);
    // Don't throw - we don't want to block user registration if emails fail
  }
}

/**
 * Trigger when a user upgrades to a paid plan
 * Cancel any pending free user funnel emails
 */
export async function onUserUpgrade(
  userId: string,
  tier: string
) {
  try {
    // Cancel all pending free user funnel emails
    await cancelUserCampaigns(userId, "free_user_funnel");
    
    console.log(`Cancelled free user funnel for ${userId} (upgraded to ${tier})`);
  } catch (error) {
    console.error("Failed to cancel free user campaigns:", error);
  }
}

/**
 * Trigger when a user cancels their subscription
 * Schedule the churned user winback funnel
 */
export async function onSubscriptionCancelled(
  userId: string,
  userEmail: string,
  userName: string,
  tier: string,
  subscriptionEndDate: Date
) {
  try {
    // Don't send winback emails for free tier
    if (tier === "starter" || tier === "free") {
      return;
    }

    // Format end date
    const endDateStr = subscriptionEndDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Schedule the churned user funnel
    await scheduleChurnedUserFunnel(
      userId,
      userEmail,
      userName,
      tier,
      endDateStr
    );
    
    console.log(`Scheduled churned user funnel for ${userId} (cancelled ${tier})`);
  } catch (error) {
    console.error("Failed to schedule churned user funnel:", error);
  }
}

/**
 * Trigger when a user reactivates their subscription
 * Cancel any pending winback emails
 */
export async function onSubscriptionReactivated(
  userId: string,
  tier: string
) {
  try {
    // Cancel all pending churned user funnel emails
    await cancelUserCampaigns(userId, "churned_user_funnel");
    
    console.log(`Cancelled churned user funnel for ${userId} (reactivated to ${tier})`);
  } catch (error) {
    console.error("Failed to cancel churned user campaigns:", error);
  }
}

/**
 * Trigger when a user reaches 80% of their quota
 * Can be called from the job creation endpoint
 */
export async function onQuotaWarning(
  userId: string,
  userEmail: string,
  userName: string,
  pdfsUsed: number,
  pdfsRemaining: number,
  pdfsTotal: number
) {
  try {
    // Only send for free tier users
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
    });

    if (subscription?.tier !== "starter") {
      return;
    }

    // Check if we already sent a quota reminder recently (within 7 days)
    // This prevents spamming users with reminders
    // TODO: Add check for recent quota reminder emails

    // For now, this would be manually triggered or part of the free user funnel
    console.log(`Quota warning for ${userId}: ${pdfsUsed}/${pdfsTotal} used`);
  } catch (error) {
    console.error("Failed to handle quota warning:", error);
  }
}
