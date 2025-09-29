import { type NextRequest, NextResponse } from "next/server";
import ThankYouEmail from "../../../emails/ThankYouEmail";
import { audit } from "../../../lib/logger";
import { contactRateLimit } from "../../../lib/rate-limit";
import type { Resend } from "resend";

let resend: Resend | null = null;

try {
  const { Resend: ResendImpl } = await import("resend");
  resend = new ResendImpl(process.env.RESEND_API_KEY);
} catch {
  // Ignore import errors during build
}

interface ContactFormBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  return contactRateLimit(request, async () => {
    let body: Partial<ContactFormBody> = {};
    try {
      body = (await request.json()) as ContactFormBody;
      const { name, email, subject, message } = body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 },
        );
      }

      // Validate email format
      const emailRegex = /^[^S@]+@[^S@]+\.[^S@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }

      if (!resend) {
        return NextResponse.json(
          { error: "Email service not available" },
          { status: 503 },
        );
      }

      audit.userAction(null, "CONTACT_FORM_SUBMISSION", {
        email,
        subject,
        ip:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      });

      // Send contact email to internal team
      let contactEmailResponse;
      try {
        contactEmailResponse = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com", // Use your verified domain
          to: process.env.CONTACT_RECEIVER_EMAIL ?? "contact@khalil.mageed.net",
          subject: `New Contact Form Submission: ${subject}`,
          html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
        });
      } catch (error) {
        audit.error(error as Error, {
          context: "sending_contact_email",
          email,
          subject,
        });
        return NextResponse.json(
          { error: "Failed to send contact email" },
          { status: 500 },
        );
      }

      // Send thank you email to sender
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com", // Use your verified domain
          to: email,
          subject: "Thank you for contacting us!",
          react: ThankYouEmail({ name }),
        });
      } catch (error) {
        audit.error(error as Error, {
          context: "sending_thank_you_email",
          email,
          name,
        });
        // Don't fail the whole request if thank you email fails
      }

      // Check for errors in the email responses
      const hasContactError = contactEmailResponse?.error != null; // Check for null or undefined

      if (hasContactError) {
        audit.error(new Error("Contact email failed"), {
          context: "contact_email_response_error",
          email,
          subject,
          error: contactEmailResponse?.error,
        });
        return NextResponse.json(
          { error: "Failed to send contact email" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { message: "Emails sent successfully" },
        { status: 200 },
      );
    } catch (error) {
      audit.error(error as Error, {
        context: "contact_form_processing",
        email: body?.email,
        subject: body?.subject,
      });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
