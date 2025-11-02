import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "~/lib/crypto-edge";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";
import {
  saveJobTempImage,
  saveJobTempMeta,
  type ImageMode,
} from "~/server/jobs/temp";
import { env } from "~/env";
import { createTieredRateLimit } from "~/lib/rate-limit";

// Magic numbers for file type validation
const FILE_MAGIC_NUMBERS = {
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/jpeg": [0xff, 0xd8, 0xff],
} as const;

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

  if (trimmed.length > 2000) {
    return {
      isValid: false,
      sanitizedPrompt: "",
      error: "Prompt too long (max 2000 characters)",
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

function validateFileType(buffer: Buffer, expectedMimeType: string): boolean {
  const magicNumbers =
    FILE_MAGIC_NUMBERS[expectedMimeType as keyof typeof FILE_MAGIC_NUMBERS];

  if (!magicNumbers) {
    return false;
  }

  // Check if buffer starts with expected magic numbers
  for (let i = 0; i < magicNumbers.length; i++) {
    if (buffer[i] !== magicNumbers[i]) {
      return false;
    }
  }

  return true;
}

function validateImageFile(
  buffer: Buffer,
  mimeType: string,
): {
  isValid: boolean;
  error?: string;
} {
  if (!Buffer.isBuffer(buffer)) {
    return { isValid: false, error: "Invalid file buffer" };
  }

  if (!["image/png", "image/jpeg"].includes(mimeType)) {
    return { isValid: false, error: "Unsupported file type" };
  }

  if (!validateFileType(buffer, mimeType)) {
    return { isValid: false, error: "File type does not match extension" };
  }

  return { isValid: true };
}

function validateJobId(jobId: string): {
  isValid: boolean;
  error?: string;
} {
  if (!jobId || typeof jobId !== "string") {
    return {
      isValid: false,
      error: "Job ID is required and must be a string",
    };
  }

  // Basic UUID format validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(jobId)) {
    return {
      isValid: false,
      error: "Invalid job ID format",
    };
  }

  return { isValid: true };
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const auth = getAuth(req);
    const userId = auth?.userId ?? null;
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Apply tier-based rate limiting
    const rateLimitSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const rateLimitTier =
      (rateLimitSubscription[0]?.tier as SubscriptionTier) || "free";
    const tieredRateLimit = createTieredRateLimit(
      rateLimitTier as "free" | "pro" | "enterprise",
      "fileUploads",
    );

    const rateLimitResponse = await tieredRateLimit(req, async () =>
      NextResponse.next(),
    );

    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    // Parse form data
    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const mode = formData.get("mode") as "same" | "edit";
    const newPrompt = formData.get("newPrompt") as string | null;
    const imageFiles = formData.getAll("images") as File[];
    const imageMode = (formData.get("imageMode") as ImageMode) || "inline";

    if (!jobId) {
      return NextResponse.json(
        { ok: false, error: "Job ID is required" },
        { status: 400 },
      );
    }

    // Validate job ID format
    const jobIdValidation = validateJobId(jobId);
    if (!jobIdValidation.isValid) {
      return NextResponse.json(
        { ok: false, error: jobIdValidation.error },
        { status: 400 },
      );
    }

    // Get existing job
    const existingJob = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!existingJob[0] || existingJob[0]?.userId !== userId) {
      return NextResponse.json(
        { ok: false, error: "Job not found" },
        { status: 404 },
      );
    }

    // Get subscription for quota check
    const quotaSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const quotaSub = quotaSubscription[0];
    if (!quotaSub) {
      return NextResponse.json(
        { ok: false, error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Check quota
    const creditCost = mode === "edit" ? 0.5 : 1;
    const quotaTier = quotaSub.tier as SubscriptionTier;
    const tierConfig = getTierConfig(quotaTier);
    const effectivePdfCount =
      quotaSub.pdfsUsedThisMonth + (creditCost === 0.5 ? 0.5 : 1);

    // -1 means unlimited, skip quota check
    if (
      tierConfig.quotas.pdfsPerMonth !== -1 &&
      effectivePdfCount > tierConfig.quotas.pdfsPerMonth
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `You've reached your monthly limit of ${tierConfig.quotas.pdfsPerMonth} PDFs.`,
        },
        { status: 403 },
      );
    }

    // Process and save images
    if (imageFiles.length > 0) {
      // Validate and save first image (supporting single image for now)
      const file = imageFiles[0];
      if (!file) {
        return NextResponse.json(
          { ok: false, error: "No valid image file" },
          { status: 400 },
        );
      }

      const mime = file.type || "";
      if (!ACCEPTED_TYPES.has(mime)) {
        return NextResponse.json(
          { ok: false, error: "Unsupported file type. Use PNG or JPEG." },
          { status: 415 },
        );
      }

      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Image size must be less than 8MB" },
          { status: 413 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Validate file type with magic numbers
      const fileValidation = validateImageFile(buffer, mime);
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { ok: false, error: fileValidation.error },
          { status: 400 },
        );
      }

      // Create new job ID first
      const newId = randomUUID();

      // Save image to temp storage
      await saveJobTempImage(newId, buffer, mime);
      await saveJobTempMeta(newId, { mode: imageMode });

      // Build final prompt
      let finalPrompt = existingJob[0].prompt ?? "";
      if (mode === "edit" && newPrompt) {
        // Validate new prompt
        const newPromptValidation = validatePrompt(newPrompt);
        if (!newPromptValidation.isValid) {
          return NextResponse.json(
            { ok: false, error: newPromptValidation.error },
            { status: 400 },
          );
        }

        finalPrompt = `${finalPrompt}\n\n[EDIT INSTRUCTIONS]:\n${newPromptValidation.sanitizedPrompt}`;
      }

      // Create new job
      await db.insert(jobs).values({
        id: newId,
        prompt: finalPrompt,
        userId,
        status: "queued",
        generatedHtml: existingJob[0].generatedHtml,
        regenerationCount: (existingJob[0].regenerationCount ?? 0) + 1,
        parentJobId: jobId,
      });

      // Update usage
      await db
        .update(userSubscriptions)
        .set({
          pdfsUsedThisMonth: effectivePdfCount,
        })
        .where(eq(userSubscriptions.userId, userId));

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

      return NextResponse.json({
        ok: true,
        id: newId,
        creditCost,
      });
    } else {
      // No images - simple text regeneration
      const newId = randomUUID();

      let finalPrompt = existingJob[0].prompt ?? "";
      if (mode === "edit" && newPrompt) {
        // Validate new prompt
        const newPromptValidation = validatePrompt(newPrompt);
        if (!newPromptValidation.isValid) {
          return NextResponse.json(
            { ok: false, error: newPromptValidation.error },
            { status: 400 },
          );
        }

        finalPrompt = `${finalPrompt}\n\n[EDIT INSTRUCTIONS]:\n${newPromptValidation.sanitizedPrompt}`;
      }

      await db.insert(jobs).values({
        id: newId,
        prompt: finalPrompt,
        userId,
        status: "queued",
        generatedHtml: existingJob[0].generatedHtml,
        regenerationCount: (existingJob[0].regenerationCount ?? 0) + 1,
        parentJobId: jobId,
      });

      await db
        .update(userSubscriptions)
        .set({
          pdfsUsedThisMonth: effectivePdfCount,
        })
        .where(eq(userSubscriptions.userId, userId));

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

      return NextResponse.json({
        ok: true,
        id: newId,
        creditCost,
      });
    }
  } catch (error) {
    console.error("[api/jobs/regenerate-with-images] error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to regenerate PDF",
      },
      { status: 500 },
    );
  }
}
