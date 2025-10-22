/**
 * Email Campaign Service
 * Handles automated email funnels for user engagement and conversion
 */

import { db } from "../db";
import { emailCampaigns, emailCampaignEvents, emailPreferences } from "../db/schema";
import { eq, and, lte } from "drizzle-orm";
import { Resend } from "resend";
import { nanoid } from "nanoid";
import WelcomeEmail from "~/emails/WelcomeEmail";
import QuotaReminderEmail from "~/emails/QuotaReminderEmail";
import ClassicOfferEmail from "~/emails/ClassicOfferEmail";
import CancellationEmail from "~/emails/CancellationEmail";
import WinbackClassicEmail from "~/emails/WinbackClassicEmail";
import FinalWinbackEmail from "~/emails/FinalWinbackEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export type CampaignType = "free_user_funnel" | "churned_user_funnel";
export type EmailType = 
  | "welcome" 
  | "quota_reminder" 
  | "classic_offer" 
  | "cancellation" 
  | "winback" 
  | "final_winback";

interface ScheduleEmailParams {
  userId: string;
  userEmail: string;
  userName: string;
  campaignType: CampaignType;
  emailType: EmailType;
  daysDelay: number;
  metadata?: {
    pdfsUsed?: number;
    pdfsRemaining?: number;
    previousTier?: string;
    endDate?: string;
  };
}

/**
 * Schedule an email to be sent after a delay
 */
export async function scheduleEmail(params: ScheduleEmailParams) {
  const { userId, campaignType, emailType, daysDelay, metadata } = params;

  // Check if user has unsubscribed
  const prefs = await db.query.emailPreferences.findFirst({
    where: eq(emailPreferences.userId, userId),
  });

  if (prefs?.unsubscribedFromMarketing) {
    console.log(`User ${userId} has unsubscribed from marketing emails`);
    return null;
  }

  // Calculate scheduled time
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + daysDelay);

  // Create campaign record
  const campaign = await db.insert(emailCampaigns).values({
    id: nanoid(),
    userId,
    campaignType,
    emailType,
    scheduledFor,
    status: "scheduled",
    metadata: metadata ?? {},
  }).returning();

  return campaign[0];
}

/**
 * Schedule the complete free user funnel
 */
export async function scheduleFreeUserFunnel(
  userId: string,
  userEmail: string,
  userName: string,
  pdfsRemaining = 3
) {
  // Day 0: Welcome email
  await scheduleEmail({
    userId,
    userEmail,
    userName,
    campaignType: "free_user_funnel",
    emailType: "welcome",
    daysDelay: 0,
    metadata: { pdfsRemaining },
  });

  // Day 3: Quota reminder
  await scheduleEmail({
    userId,
    userEmail,
    userName,
    campaignType: "free_user_funnel",
    emailType: "quota_reminder",
    daysDelay: 3,
    metadata: { pdfsUsed: 0, pdfsRemaining },
  });

  // Day 7: Classic offer
  await scheduleEmail({
    userId,
    userEmail,
    userName,
    campaignType: "free_user_funnel",
    emailType: "classic_offer",
    daysDelay: 7,
    metadata: { pdfsUsed: 0 },
  });
}

/**
 * Schedule the churned user winback funnel
 */
export async function scheduleChurnedUserFunnel(
  userId: string,
  userEmail: string,
  userName: string,
  previousTier: string,
  subscriptionEndDate: string
) {
  // Day 0: Cancellation confirmation
  await scheduleEmail({
    userId,
    userEmail,
    userName,
    campaignType: "churned_user_funnel",
    emailType: "cancellation",
    daysDelay: 0,
    metadata: { previousTier, endDate: subscriptionEndDate },
  });

  // Day 3: Winback with Classic offer
  await scheduleEmail({
    userId,
    userEmail,
    userName,
    campaignType: "churned_user_funnel",
    emailType: "winback",
    daysDelay: 3,
    metadata: { previousTier },
  });

  // Day 7: Final winback reminder
  await scheduleEmail({
    userId,
    userEmail,
    userName,
    campaignType: "churned_user_funnel",
    emailType: "final_winback",
    daysDelay: 7,
  });
}

/**
 * Process and send scheduled emails
 * This should be called by a cron job every hour
 */
export async function processPendingEmails() {
  const now = new Date();

  // Get all scheduled emails that are due
  const pendingCampaigns = await db.query.emailCampaigns.findMany({
    where: and(
      eq(emailCampaigns.status, "scheduled"),
      lte(emailCampaigns.scheduledFor, now)
    ),
  });

  console.log(`Processing ${pendingCampaigns.length} pending email campaigns`);

  for (const campaign of pendingCampaigns) {
    try {
      await sendCampaignEmail(campaign);
    } catch (error) {
      console.error(`Failed to send campaign ${campaign.id}:`, error);
      
      // Mark as failed
      await db.update(emailCampaigns)
        .set({ status: "failed" })
        .where(eq(emailCampaigns.id, campaign.id));
    }
  }
}

/**
 * Send a campaign email
 */
async function sendCampaignEmail(campaign: typeof emailCampaigns.$inferSelect) {
  // Get user info (in production, fetch from Clerk or your user system)
  // For now, we'll use placeholder data
  const userName = "User"; // TODO: Fetch from Clerk
  const userEmail = "user@example.com"; // TODO: Fetch from Clerk

  // Check if user has unsubscribed
  const prefs = await db.query.emailPreferences.findFirst({
    where: eq(emailPreferences.userId, campaign.userId),
  });

  if (prefs?.unsubscribedFromMarketing) {
    await db.update(emailCampaigns)
      .set({ status: "cancelled" })
      .where(eq(emailCampaigns.id, campaign.id));
    return;
  }

  // Select email template based on type
  let emailComponent;
  let subject = "";

  switch (campaign.emailType) {
    case "welcome":
      emailComponent = WelcomeEmail({
        name: userName,
        pdfsRemaining: campaign.metadata?.pdfsRemaining ?? 3,
      });
      subject = "Welcome to kamkmPDF! 🎉";
      break;

    case "quota_reminder":
      emailComponent = QuotaReminderEmail({
        name: userName,
        pdfsUsed: campaign.metadata?.pdfsUsed ?? 2,
        pdfsRemaining: campaign.metadata?.pdfsRemaining ?? 1,
        pdfsTotal: 3,
      });
      subject = "You're almost out of PDFs! 📊";
      break;

    case "classic_offer":
      emailComponent = ClassicOfferEmail({
        name: userName,
        pdfsUsed: campaign.metadata?.pdfsUsed ?? 3,
      });
      subject = "🎁 Exclusive offer: Unlimited PDFs for just $5/month!";
      break;

    case "cancellation":
      emailComponent = CancellationEmail({
        name: userName,
        tier: campaign.metadata?.previousTier ?? "Professional",
        endDate: campaign.metadata?.endDate ?? "soon",
      });
      subject = "We're sorry to see you go 😢";
      break;

    case "winback":
      emailComponent = WinbackClassicEmail({
        name: userName,
        previousTier: campaign.metadata?.previousTier ?? "Professional",
      });
      subject = "We miss you! Come back with our exclusive $5/month offer 💙";
      break;

    case "final_winback":
      emailComponent = FinalWinbackEmail({
        name: userName,
      });
      subject = "⏰ Last chance: Your exclusive $5/month offer expires soon!";
      break;

    default:
      throw new Error(`Unknown email type: ${campaign.emailType}`);
  }

  // Send email via Resend
  const { error } = await resend.emails.send({
    from: "kamkmPDF <noreply@kamkmpdf.com>",
    to: userEmail,
    subject,
    react: emailComponent,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  // Mark as sent
  await db.update(emailCampaigns)
    .set({ 
      status: "sent",
      sentAt: new Date(),
    })
    .where(eq(emailCampaigns.id, campaign.id));

  // Track sent event
  await db.insert(emailCampaignEvents).values({
    id: nanoid(),
    campaignId: campaign.id,
    userId: campaign.userId,
    eventType: "sent",
  });

  console.log(`Sent ${campaign.emailType} email to user ${campaign.userId}`);
}

/**
 * Track email campaign event (open, click, conversion)
 */
export async function trackCampaignEvent(
  campaignId: string,
  userId: string,
  eventType: "opened" | "clicked" | "converted" | "unsubscribed",
  eventData?: { link?: string; tier?: string; revenue?: number }
) {
  await db.insert(emailCampaignEvents).values({
    id: nanoid(),
    campaignId,
    userId,
    eventType,
    eventData: eventData ?? {},
  });
}

/**
 * Cancel all pending campaigns for a user
 */
export async function cancelUserCampaigns(userId: string, campaignType?: CampaignType) {
  const where = campaignType
    ? and(
        eq(emailCampaigns.userId, userId),
        eq(emailCampaigns.campaignType, campaignType),
        eq(emailCampaigns.status, "scheduled")
      )
    : and(
        eq(emailCampaigns.userId, userId),
        eq(emailCampaigns.status, "scheduled")
      );

  await db.update(emailCampaigns)
    .set({ status: "cancelled" })
    .where(where);
}

/**
 * Unsubscribe user from marketing emails
 */
export async function unsubscribeUser(userId: string) {
  // Check if preference exists
  const existing = await db.query.emailPreferences.findFirst({
    where: eq(emailPreferences.userId, userId),
  });

  if (existing) {
    await db.update(emailPreferences)
      .set({ 
        unsubscribedFromMarketing: true,
        unsubscribedAt: new Date(),
      })
      .where(eq(emailPreferences.id, existing.id));
  } else {
    await db.insert(emailPreferences).values({
      id: nanoid(),
      userId,
      unsubscribedFromMarketing: true,
      unsubscribedAt: new Date(),
    });
  }

  // Cancel all pending campaigns
  await cancelUserCampaigns(userId);
}
