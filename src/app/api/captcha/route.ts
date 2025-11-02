import { type NextRequest, NextResponse } from "next/server";
import {
  createCaptcha,
  verifyCaptcha,
  isCaptchaRequired,
  recordUnauthenticatedRequest,
} from "~/lib/captcha";
import { getClientIP, recordCommonViolation } from "~/lib/ip-blocking";

export const runtime = "nodejs";

/**
 * GET /api/captcha
 * Generate a new CAPTCHA
 */
export async function GET(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Check if CAPTCHA is required
    const required = await isCaptchaRequired(clientIP);

    if (!required) {
      return NextResponse.json({
        required: false,
        message: "CAPTCHA not required at this time",
      });
    }

    // Generate new CAPTCHA
    const captcha = await createCaptcha(clientIP);

    return NextResponse.json({
      required: true,
      captcha: {
        question: captcha.question,
        captchaId: captcha.captchaId,
        expiresAt: captcha.expiresAt,
      },
    });
  } catch (error) {
    console.error("[api/captcha] error:", error);
    return NextResponse.json(
      { error: "Failed to generate CAPTCHA" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/captcha/verify
 * Verify a CAPTCHA answer
 */
export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Record unauthenticated request
    await recordUnauthenticatedRequest(clientIP);

    const body = (await req.json()) as { captchaId?: string; answer?: string };
    const { captchaId, answer } = body;

    if (!captchaId || !answer) {
      return NextResponse.json(
        { error: "CAPTCHA ID and answer are required" },
        { status: 400 },
      );
    }

    // Verify CAPTCHA
    const result = await verifyCaptcha(captchaId, answer, clientIP);

    if (result.isValid) {
      return NextResponse.json({
        success: true,
        message: "CAPTCHA verified successfully",
      });
    } else {
      // Record failed CAPTCHA attempt
      await recordCommonViolation(req, "SUSPICIOUS_REQUEST", {
        action: "captcha_verification_failed",
        captchaId,
        error: result.error,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("[api/captcha/verify] error:", error);
    return NextResponse.json(
      { error: "Failed to verify CAPTCHA" },
      { status: 500 },
    );
  }
}
