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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);


export const runtime = "nodejs";export const dynamic = "force-dynamic";

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

    // Get subscription
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const sub = subscription[0];
    if (!sub) {
      return NextResponse.json(
        { ok: false, error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Check quota
    const creditCost = mode === "edit" ? 0.5 : 1;
    const tier = sub.tier as SubscriptionTier;
    const tierConfig = getTierConfig(tier);
    const effectivePdfCount =
      sub.pdfsUsedThisMonth + (creditCost === 0.5 ? 0.5 : 1);

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

      // Create new job ID first
      const newId = randomUUID();

      // Save image to temp storage
      await saveJobTempImage(newId, buffer, mime);
      await saveJobTempMeta(newId, { mode: imageMode });

      // Build final prompt
      let finalPrompt = existingJob[0].prompt ?? "";
      if (mode === "edit" && newPrompt) {
        finalPrompt = `${finalPrompt}\n\n[EDIT INSTRUCTIONS]:\n${newPrompt}`;
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
        finalPrompt = `${finalPrompt}\n\n[EDIT INSTRUCTIONS]:\n${newPrompt}`;
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
