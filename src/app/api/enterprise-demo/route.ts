import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { audit } from "~/lib/logger";
import { contactRateLimit } from "~/lib/rate-limit";
import EnterpriseDemoConfirmationEmail from "~/emails/EnterpriseDemoConfirmationEmail";
import type { Resend } from "resend";

let resend: Resend | null = null;

try {
  const { Resend: ResendImpl } = await import("resend");
  resend = new ResendImpl(process.env.RESEND_API_KEY);
} catch {
  // ignore import errors locally or during build
}

interface EnterpriseDemoRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  companySize: string;
  role: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  return contactRateLimit(request, async () => {
    let body: Partial<EnterpriseDemoRequest> = {};

    try {
      body = (await request.json()) as EnterpriseDemoRequest;
    } catch (error) {
      audit.error(error as Error, {
        context: "enterprise_demo_parse_error",
      });
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { firstName, lastName, email, phone, company, companySize, role, message } = body;

    if (!firstName || !lastName || !email || !company || !companySize || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!resend) {
      audit.securityEvent("resend_not_configured", {
        context: "enterprise_demo_submission",
      });
      return NextResponse.json(
        { error: "Email service not available" },
        { status: 503 },
      );
    }

    audit.userAction(null, "ENTERPRISE_DEMO_SUBMISSION", {
      email,
      company,
      companySize,
      role,
      ip:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });

    const internalHtml = `
      <h2>New Enterprise Demo Request</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone ?? "N/A"}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Company Size:</strong> ${companySize}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Message:</strong></p>
      <p>${(message ?? "").replace(/\n/g, "<br>")}</p>
    `;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
        to: process.env.CONTACT_RECEIVER_EMAIL ?? "contact@khalil.mageed.net",
        subject: `Enterprise Demo Request from ${company}`,
        html: internalHtml,
      });
    } catch (error) {
      audit.error(error as Error, {
        context: "enterprise_demo_internal_email",
        email,
        company,
      });
      return NextResponse.json(
        { error: "Failed to submit request" },
        { status: 500 },
      );
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
        to: email,
        subject: "Your Enterprise Demo Request",
        react: EnterpriseDemoConfirmationEmail({
          firstName,
          company,
        }),
      });
    } catch (error) {
      audit.error(error as Error, {
        context: "enterprise_demo_confirmation_email",
        email,
      });
      // do not fail the request if confirmation email fails
    }

    return NextResponse.json({ message: "Enterprise demo request submitted" });
  });
}
