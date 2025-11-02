import { NextResponse } from "next/server";
import { randomUUID } from "~/lib/crypto-edge";
import {
  checkForDuplicateJobWithImage,
  checkForDuplicateJob,
  storePromptHash,
  generatePromptHash,
} from "~/lib/deduplication";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { jobs } from "~/server/db/schema";
import { env } from "~/env";
import {
  saveJobTempImage,
  saveJobTempMeta,
  type ImageMode,
} from "~/server/jobs/temp";
import { jobCreationRateLimit } from "~/lib/rate-limit";

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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);

// Use Node.js runtime for worker operations (requires fs, path, stream, etc.)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await jobCreationRateLimit(
      req as unknown as NextRequest,
      async () => NextResponse.next(),
    );

    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const auth = getAuth(req as unknown as NextRequest);
    const userId = auth?.userId ?? null;
    // Allow both authenticated and unauthenticated users

    const ct = req.headers.get("content-type") ?? "";
    if (!ct.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Expected multipart/form-data" },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const promptValue = form.get("prompt");

    // Validate and sanitize prompt
    const promptRaw = typeof promptValue === "string" ? promptValue : "";
    const promptValidation = validatePrompt(promptRaw);

    if (!promptValidation.isValid) {
      return NextResponse.json(
        { ok: false, error: promptValidation.error },
        { status: 400 },
      );
    }

    const prompt = promptValidation.sanitizedPrompt;

    const modeValue = form.get("mode");
    const modeInput = typeof modeValue === "string" ? modeValue : "inline";
    const modeInputLower = modeInput.toLowerCase();
    const mode: ImageMode = modeInputLower === "cover" ? "cover" : "inline";

    const maybeFile = form.get("image");
    let file: File | null = null;
    let fileBuf: Buffer | null = null;
    let fileMime: string | null = null;
    if (maybeFile && maybeFile instanceof File) {
      file = maybeFile;
      const mime = file.type || "";
      if (!ACCEPTED_TYPES.has(mime)) {
        return NextResponse.json(
          { ok: false, error: "Unsupported file type. Use PNG or JPEG." },
          { status: 415 },
        );
      }
      const size = file.size ?? 0;
      if (size <= 0 || size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { ok: false, error: "File too large. Max 8MB." },
          { status: 413 },
        );
      }
      const ab = await file.arrayBuffer();
      const buf = Buffer.from(ab);

      // Validate file type with magic numbers
      const fileValidation = validateImageFile(buf, mime);
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { ok: false, error: fileValidation.error },
          { status: 400 },
        );
      }

      const dims = getImageSize(buf, mime);
      if (!dims) {
        return NextResponse.json(
          { ok: false, error: "Unable to read image dimensions." },
          { status: 400 },
        );
      }
      const { width, height } = dims;
      if (width < 16 || height < 16) {
        return NextResponse.json(
          { ok: false, error: "Image too small (min 16x16)." },
          { status: 400 },
        );
      }
      if (width > 20000 || height > 20000) {
        return NextResponse.json(
          { ok: false, error: "Image dimensions too large." },
          { status: 400 },
        );
      }
      fileBuf = buf;
      fileMime = mime;
    }

    // Check for duplicate jobs before creating a new one
    let deduplicationResult;
    if (fileBuf) {
      // Include image data in deduplication check
      deduplicationResult = await checkForDuplicateJobWithImage(
        prompt,
        fileBuf,
        {
          userId,
          windowMinutes: 5,
        },
      );
    } else {
      // Text-only deduplication
      deduplicationResult = await checkForDuplicateJob(prompt, {
        userId,
        windowMinutes: 5,
      });
    }

    if (deduplicationResult.isDuplicate && deduplicationResult.existingJobId) {
      // Return the existing job instead of creating a new one
      return NextResponse.json({
        ok: true,
        jobId: deduplicationResult.existingJobId,
        message: "Job already exists for this prompt",
      });
    }

    const id = randomUUID();
    const promptHash = generatePromptHash(prompt, {
      userId: userId ?? undefined,
      includeImage: !!fileBuf,
    });

    await db.insert(jobs).values({
      id,
      prompt,
      userId,
      promptHash,
    });

    // Store the prompt hash for future deduplication
    await storePromptHash(id, promptHash);

    if (file && fileBuf && fileMime) {
      await saveJobTempImage(id, fileBuf, fileMime);
      await saveJobTempMeta(id, { mode });
    }

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

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[api/jobs/create-with-image] error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

// Minimal dimension parsing for PNG and JPEG
function getImageSize(
  buf: Buffer,
  mime: string,
): { width: number; height: number } | null {
  try {
    if (mime === "image/png") return getPngSize(buf);
    if (mime === "image/jpeg") return getJpegSize(buf);
    return null;
  } catch {
    return null;
  }
}

function getPngSize(buf: Buffer): { width: number; height: number } {
  if (buf.length < 24) throw new Error("png too small");
  const isPng =
    buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a;
  if (!isPng) throw new Error("not png");
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

function getJpegSize(buf: Buffer): { width: number; height: number } {
  if (buf.length < 4) throw new Error("jpeg too small");
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error("not jpeg");
  let i = 2;
  const len = buf.length;
  while (i + 1 < len) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    while (i < len && buf[i] === 0xff) i++;
    if (i >= len) break;
    const markerByte = buf.at(i);
    if (markerByte === undefined) break;
    const marker: number = markerByte;
    i++;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) continue;
    if (i + 1 >= len) break;
    const segLen = buf.readUInt16BE(i);
    i += 2;
    if (segLen < 2 || i + segLen - 2 > len) break;
    const isSOF =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSOF) {
      if (segLen < 7) break;
      const height = buf.readUInt16BE(i + 1);
      const width = buf.readUInt16BE(i + 3);
      return { width, height };
    }
    i += segLen - 2;
  }
  throw new Error("no sof");
}
