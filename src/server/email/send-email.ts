/**
 * Direct Email Sending Service
 * Send emails immediately via Resend
 */

import { Resend } from "resend";
import WelcomeEmail from "~/emails/WelcomeEmail";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "noreply@khalil.mageed.net";

interface SendWelcomeEmailParams {
  toEmail: string;
  userName: string;
  pdfsRemaining?: number;
}

/**
 * Send welcome email immediately
 */
export async function sendWelcomeEmail({
  toEmail,
  userName,
  pdfsRemaining = 3,
}: SendWelcomeEmailParams) {
  try {
    console.log(`[Email] Sending welcome email to ${toEmail}`);

    const { data, error } = await resend.emails.send({
      from: `KamkmPDF <${FROM_EMAIL}>`,
      to: toEmail,
      subject: "Welcome to KamkmPDF! 🎉",
      react: WelcomeEmail({
        name: userName,
        pdfsRemaining,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    console.log(`[Email] Successfully sent welcome email to ${toEmail}`, data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    throw error;
  }
}

/**
 * Send any React Email component
 */
export async function sendEmail({
  to,
  subject,
  react,
  from,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: from ?? `KamkmPDF <${FROM_EMAIL}>`,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("[Email] Failed to send email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log(`[Email] Successfully sent email to ${to}`, data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    throw error;
  }
}
