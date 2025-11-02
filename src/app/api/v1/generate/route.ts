import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import { randomUUID } from "~/lib/crypto-edge";
import { eq } from "drizzle-orm";
import {
  verifyApiKey,
  hasPermission,
  API_PERMISSIONS,
} from "~/server/api/middleware/apiKeyAuth";
import {
  getTierConfig,
  hasExceededQuota,
  type SubscriptionTier,
} from "~/server/subscription/tiers";
import { env } from "~/env";
import { createTieredRateLimit } from "~/lib/rate-limit";
import { checkIPBlocking, recordCommonViolation } from "~/lib/ip-blocking";

// Prompt injection patterns to detect and block
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all)\s+(instructions?|prompts?)/i,
  /forget\s+(everything|all\s+instructions?)/i,
  /disregard\s+(previous|all)\s+(instructions?|prompts?)/i,
  /you\s+are\s+now\s+(a|an)\s+(\w+\s+)?(assistant|ai|bot|model)/i,
  /act\s+as\s+(a|an)\s+(\w+\s+)?(assistant|ai|bot|model)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /instead\s+of/i,
  /do\s+not\s+(follow|use|listen\s+to)/i,
  /override\s+(your|the)\s+(instructions?|programming|rules)/i,
  /jailbreak/i,
  /dan\s+\d+/i,
  /developer\s+mode/i,
  /evil\s+mode/i,
];

// XSS patterns for HTML sanitization
const XSS_PATTERNS = [
  /<script[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

function sanitizePrompt(prompt: string): string {
  if (typeof prompt !== "string") return "";

  let sanitized = prompt;

  // Remove XSS patterns
  XSS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, "");

  return sanitized;
}

function detectPromptInjection(prompt: string): boolean {
  if (typeof prompt !== "string") return false;

  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(prompt));
}

function validatePrompt(prompt: string): {
  isValid: boolean;
  sanitizedPrompt: string;
  error?: string;
} {
  if (!prompt || typeof prompt !== "string") {
    return {
      isValid: false,
      sanitizedPrompt: "",
      error: "Prompt is required and must be a string",
    };
  }

  const trimmed = prompt.trim();

  if (trimmed.length < 1) {
    return {
      isValid: false,
      sanitizedPrompt: "",
      error: "Prompt cannot be empty",
    };
  }

  if (trimmed.length > 32000) {
    return {
      isValid: false,
      sanitizedPrompt: "",
      error: "Prompt too long (max 32000 characters)",
    };
  }

  const sanitized = sanitizePrompt(trimmed);

  if (detectPromptInjection(sanitized)) {
    return {
      isValid: false,
      sanitizedPrompt: "",
      error: "Prompt contains potentially harmful content",
    };
  }

  return {
    isValid: true,
    sanitizedPrompt: sanitized,
  };
}

function validateApiKey(apiKey: string): {
  isValid: boolean;
  error?: string;
} {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      isValid: false,
      error: "API key is required and must be a string",
    };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(apiKey)) {
    return {
      isValid: false,
      error: "Invalid API key format",
    };
  }

  return { isValid: true };
}

export const runtime = "nodejs";

/**
 * POST /api/v1/generate
 * Generate a PDF using API key authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check IP blocking first
    const ipCheck = await checkIPBlocking(req);
    if (ipCheck.isBlocked) {
      return NextResponse.json(
        { error: "Access blocked due to security violations" },
        { status: 403 },
      );
    }
    // Get API key from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      await recordCommonViolation(req, "INVALID_API_KEY", {
        endpoint: "/api/v1/generate",
      });
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // Validate API key format
    const apiKeyValidation = validateApiKey(apiKey);
    if (!apiKeyValidation.isValid) {
      await recordCommonViolation(req, "INVALID_API_KEY", {
        endpoint: "/api/v1/generate",
        apiKeyFormat: apiKey.substring(0, 12) + "...",
      });
      return NextResponse.json(
        { error: apiKeyValidation.error },
        { status: 401 },
      );
    }

    // Verify API key
    const { userId, permissions } = await verifyApiKey(apiKey);

    // Apply tier-based rate limiting
    const rateLimitSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const rateLimitTier =
      (rateLimitSubscription[0]?.tier as SubscriptionTier) ?? "free";
    const tieredRateLimit = createTieredRateLimit(
      rateLimitTier as "free" | "pro" | "enterprise",
      "pdfGeneration",
    );

    const rateLimitResponse = await tieredRateLimit(req, async () =>
      NextResponse.next(),
    );

    if (rateLimitResponse.status === 429) {
      await recordCommonViolation(req, "RATE_LIMIT_EXCEEDED", {
        endpoint: "/api/v1/generate",
        userId,
      });
      return rateLimitResponse;
    }

    // Check permission
    if (!hasPermission(permissions, API_PERMISSIONS.PDF_CREATE)) {
      await recordCommonViolation(req, "FORBIDDEN_ACCESS", {
        endpoint: "/api/v1/generate",
        userId,
        requiredPermission: API_PERMISSIONS.PDF_CREATE,
        permissions,
      });
      return NextResponse.json(
        { error: "API key does not have pdf:create permission" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = (await req.json()) as Record<string, unknown>;
    const { prompt } = body as { prompt?: string };

    // Validate and sanitize prompt
    const promptValidation = validatePrompt(prompt ?? "");
    if (!promptValidation.isValid) {
      await recordCommonViolation(req, "MALICIOUS_PAYLOAD", {
        endpoint: "/api/v1/generate",
        userId,
        error: promptValidation.error,
        promptLength: prompt?.length ?? 0,
      });
      return NextResponse.json(
        { error: promptValidation.error },
        { status: 400 },
      );
    }

    const sanitizedPrompt = promptValidation.sanitizedPrompt;

    // Check subscription and quota
    const quotaSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (!quotaSubscription[0]) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const quotaSub = quotaSubscription[0];
    const quotaTier = quotaSub.tier as SubscriptionTier;
    const tierConfig = getTierConfig(quotaTier);

    // Check quota
    const exceeded = hasExceededQuota(
      quotaTier,
      quotaSub.pdfsUsedThisMonth,
      "pdfsPerMonth",
    );

    if (exceeded) {
      return NextResponse.json(
        {
          error: `Monthly quota exceeded. Limit: ${tierConfig.quotas.pdfsPerMonth} PDFs`,
        },
        { status: 429 },
      );
    }

    // Create job
    const id = randomUUID();
    await db.insert(jobs).values({
      id,
      prompt: sanitizedPrompt,
      userId,
      status: "queued",
    });

    // Trigger worker processing
    try {
      if (process.env.NETLIFY) {
        // Direct function call on Netlify - more reliable than external HTTP
        const { drain } = await import("~/server/jobs/worker");
        void drain({ maxJobs: 1 }).catch(() => undefined); // Process one job immediately
      } else {
        // Use HTTP fetch for other platforms
        const base = env.NEXT_PUBLIC_APP_URL;
        const url = new URL("/api/worker/drain", base).toString();
        const headers: Record<string, string> = {};
        if (process.env.PDFPROMPT_WORKER_SECRET) {
          headers["x-worker-secret"] = process.env.PDFPROMPT_WORKER_SECRET;
        }
        void fetch(url, {
          headers,
          signal: AbortSignal.timeout(5000),
        }).catch(() => undefined);
      }
    } catch {
      // ignore - jobs will be processed by scheduled functions or next request
    }

    // Return job details
    return NextResponse.json(
      {
        id,
        status: "queued",
        message: "PDF generation job created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
