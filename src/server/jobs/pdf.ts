import fs from "fs";
import path from "path";
import { PassThrough } from "stream";
import {
  generateHtmlFromPrompt,
  wrapHtmlDocument,
} from "~/server/ai/openrouter";
import type { ImageMode } from "~/server/jobs/temp";
import htmlToPdfToPath, { htmlToPdfToBuffer } from "~/server/jobs/htmlToPdf";
import type { GenerationStage } from "~/types/pdf";
import { env } from "~/env";
import {
  detectLanguages,
  getMultilingualFontFamily,
  containsRTL,
  containsCJK,
  containsIndic,
} from "~/server/utils/multilingualText";

// Detect common serverless platforms so we avoid PDFKit (which expects AFM files at runtime)
function isServerless() {
  return (
    process.env.PDFPROMPT_FORCE_SERVERLESS === "1" ||
    !!process.env.VERCEL ||
    !!process.env.NETLIFY ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.AWS_EXECUTION_ENV ||
    !!process.env.LAMBDA_TASK_ROOT ||
    process.env.NEXT_RUNTIME === "edge"
  );
}

// Use a variable to keep the dynamic import opaque to bundlers
const PDFKIT_MODULE = "pdfkit";

export async function generatePdfToPath(
  filePath: string,
  opts: { jobId: string; prompt?: string },
) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  // Try AI pipeline if configured
  try {
    if (env.OPENROUTER_API_KEY) {
      const htmlBody = await generateHtmlFromPrompt({
        prompt: opts.prompt ?? "",
        brandName: "Prompt‑to‑PDF",
      });
      const htmlDoc = wrapHtmlDocument(htmlBody, "Prompt‑to‑PDF Document");
      await htmlToPdfToPath(htmlDoc, filePath, {
        format: "A4",
        printBackground: true,
      });
      return; // success
    } else {
      console.warn(
        "[pdf] generatePdfToPath - OPENROUTER_API_KEY not configured, skipping AI pipeline",
      );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error(
      "[pdf] generatePdfToPath - AI pipeline failed, falling back to PDFKit:",
      {
        error: errorMessage,
        stack: errorStack,
        jobId: opts.jobId,
        hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
      },
    );
  }

  // On serverless (Netlify/Vercel/Lambda), avoid PDFKit asset lookups; use Puppeteer-based path
  if (isServerless()) {
    const multilingualFontFamily = getMultilingualFontFamily(opts.prompt ?? "");
    const detectedLanguages = detectLanguages(opts.prompt ?? "");
    const hasComplexScripts =
      containsRTL(opts.prompt ?? "") ||
      containsCJK(opts.prompt ?? "") ||
      containsIndic(opts.prompt ?? "");
    const directionStyle = hasComplexScripts
      ? "direction: auto; unicode-bidi: plaintext;"
      : "";

    const fallbackHtmlBody = `
      <main style="font-family: ${multilingualFontFamily}; padding: 40px; ${directionStyle}">
        <h1 style="text-align:center; font-size: 22px; font-feature-settings: 'liga' 1, 'kern' 1;">Generated PDF (Fallback)</h1>
        <p style="margin-top:16px; font-size: 14px; font-feature-settings: 'liga' 1, 'kern' 1;">Job ID: ${opts.jobId}</p>
        <h2 style="margin-top:16px; font-size: 14px; font-feature-settings: 'liga' 1, 'kern' 1;">Prompt:</h2>
        <pre style="white-space: pre-wrap; font-size: 12px; font-feature-settings: 'liga' 1, 'kern' 1; ${directionStyle}">${(
          opts.prompt ?? "(no prompt)"
        )
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>
        <p style="margin-top:16px; font-size: 12px; font-feature-settings: 'liga' 1, 'kern' 1;">Generated at: ${new Date().toISOString()}</p>
        ${detectedLanguages.length > 0 ? `<p style="margin-top:8px; font-size: 10px; color: #666;">Detected languages: ${detectedLanguages.join(", ")}</p>` : ""}
      </main>
    `;
    const htmlDoc = wrapHtmlDocument(
      fallbackHtmlBody,
      "Prompt‑to‑PDF Document",
    );
    await htmlToPdfToPath(htmlDoc, filePath, {
      format: "A4",
      printBackground: true,
    });
    return;
  }

  // Non-serverless fallback using Puppeteer for full Unicode (Arabic/RTL) support
  {
    const fallbackBody = `<main style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Noto Sans Arabic\", \"Noto Naskh Arabic\", sans-serif; padding: 40px;">
      <h1 style="text-align:center; font-size: 22px;">Generated PDF (Fallback)</h1>
      <p style="margin-top:16px; font-size: 14px;">Job ID: ${opts.jobId}</p>
      <h2 style="margin-top:16px; font-size: 14px;">Prompt:</h2>
      <pre style="white-space: pre-wrap; font-size: 12px;">${(
        opts.prompt ?? "(no prompt)"
      )
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>
      <p style="margin-top:16px; font-size: 12px;">Generated at: ${new Date().toISOString()}</p>
    </main>`;
    const htmlDoc = wrapHtmlDocument(fallbackBody, "Prompt-to-PDF Document");
    await htmlToPdfToPath(htmlDoc, filePath, {
      format: "A4",
      printBackground: true,
    });
    return;
  }

  // Fallback to simple PDFKit document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment
  const { default: PDFDocument } = (await import(PDFKIT_MODULE)) as any;
  return new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.pipe(stream);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(20).text("Generated PDF (Fallback)", { align: "center" });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.moveDown();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(12).text(`Job ID: ${opts.jobId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.moveDown();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(12).text("Prompt:");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(10).text(opts.prompt ?? "(no prompt)");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.moveDown();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(10).text(`Generated at: ${new Date().toISOString()}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (e) => reject(e));
  });
}

function buildImageDataUrl(img: { mime: string; dataBase64: string }) {
  const safeMime =
    img.mime === "image/png" || img.mime === "image/jpeg"
      ? img.mime
      : "image/png";
  return `data:${safeMime};base64,${img.dataBase64}`;
}

function injectImageIntoHtmlBody(
  bodyHtml: string,
  image: { dataUrl: string; mode: ImageMode },
): string {
  const imgCover = `
    <figure style="margin:0 0 20px 0;">
      <img src="${image.dataUrl}" alt="Cover Image" style="display:block;width:100%;height:auto;object-fit:cover;border-radius:8px;" />
    </figure>
  `;
  const imgInline = `
    <figure style="margin:0 0 12px 0;text-align:center;">
      <img src="${image.dataUrl}" alt="Image" style="max-width:100%;height:auto;border-radius:6px;" />
    </figure>
  `;
  const imgHtml = image.mode === "cover" ? imgCover : imgInline;
  // Prepend image to body content for simplicity and clean layout
  return `${imgHtml}${bodyHtml}`;
}

export async function generatePdfBuffer(opts: {
  jobId: string;
  prompt?: string;
  tier?:
    | "starter"
    | "classic"
    | "professional"
    | "pro_plus"
    | "business"
    | "enterprise";
  addWatermark?: boolean;
  image?: { path: string; mime: string; mode: ImageMode } | null;
  onStage?: (stage: GenerationStage, progress: number) => void | Promise<void>;
}): Promise<Buffer> {
  // Try AI pipeline if configured
  console.log("[pdf] generatePdfBuffer - Checking OpenRouter configuration:", {
    hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
    jobId: opts.jobId,
    tier: opts.tier,
    promptLength: opts.prompt?.length ?? 0,
  });

  try {
    const wantsBypass = env.PDFPROMPT_BYPASS_AI_FOR_RTL === "1";
    const hasRtl = containsRTL(opts.prompt ?? "");
    if (wantsBypass && hasRtl) {
      await opts.onStage?.("Formatting PDF", 40);
      const body = `
        <section dir="auto" style="white-space: pre-wrap; font-size: 14px;">
          ${(opts.prompt ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </section>
      `;
      const htmlDoc = wrapHtmlDocument(
        body,
        "Prompt‑to‑PDF Document",
        opts.addWatermark ?? false,
      );
      const buf = await htmlToPdfToBuffer(htmlDoc, {
        format: "A4",
        printBackground: true,
      });
      return buf;
    }

    if (env.OPENROUTER_API_KEY) {
      console.log(
        "[pdf] generatePdfBuffer - Calling OpenRouter for job",
        opts.jobId,
      );
      await opts.onStage?.("Analyzing your request", 15);
      const htmlBodyRaw = await generateHtmlFromPrompt({
        prompt: opts.prompt ?? "",
        brandName: "Prompt‑to‑PDF",
        tier: opts.tier,
      });
      await opts.onStage?.("Generating content", 40);

      // Check if Arabic text was lost during HTML generation
      const promptHasArabic =
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
          opts.prompt ?? "",
        );
      const htmlHasArabic =
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
          htmlBodyRaw,
        );

      let body = htmlBodyRaw;

      if (promptHasArabic && !htmlHasArabic) {
        console.warn(
          `[pdf] Arabic text in prompt but missing from AI-generated HTML. Appending missing Arabic text.`,
          {
            jobId: opts.jobId,
            promptLength: (opts.prompt ?? "").length,
            htmlLength: htmlBodyRaw.length,
          },
        );
        // If Arabic text is missing, we'll append it to ensure it's included
        // This is a safety measure to ensure Arabic content is never lost
        const arabicTextInPrompt = (opts.prompt ?? "").match(
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g,
        );
        if (arabicTextInPrompt && arabicTextInPrompt.length > 0) {
          const missingArabicSection = `<section dir="rtl" lang="ar" style="margin-top: 20px; padding: 20px; border-top: 2px solid #e2e8f0;">
            <h2 style="font-size: 18px; margin-bottom: 12px;">النص الأصلي:</h2>
            <p style="font-size: 14px; line-height: 1.8; font-family: 'Noto Naskh Arabic', 'Noto Sans Arabic', Arial, sans-serif;">
              ${arabicTextInPrompt.join(" ")}
            </p>
          </section>`;
          // Append Arabic text if it's missing
          if (/<\/body>/i.test(body)) {
            body = body.replace(/<\/body>/i, `${missingArabicSection}</body>`);
          } else if (/<\/html>/i.test(body)) {
            body = body.replace(/<\/html>/i, `${missingArabicSection}</html>`);
          } else {
            body = body + missingArabicSection;
          }
        }
      }
      // If an image was provided, inline it as data URL at top, letting CSS handle sizing
      if (
        opts.image?.path &&
        (opts.image.mime === "image/png" || opts.image.mime === "image/jpeg")
      ) {
        const fs = await import("fs");
        try {
          const buf = await fs.promises.readFile(opts.image.path);
          const dataUrl = buildImageDataUrl({
            mime: opts.image.mime,
            dataBase64: buf.toString("base64"),
          });
          body = injectImageIntoHtmlBody(body, {
            dataUrl,
            mode: opts.image.mode,
          });
        } catch {
          // ignore image read failures; continue without image
        }
      }
      const htmlDoc = wrapHtmlDocument(
        body,
        "Prompt‑to‑PDF Document",
        opts.addWatermark ?? false,
      );
      await opts.onStage?.("Formatting PDF", 70);
      const buf = await htmlToPdfToBuffer(htmlDoc, {
        format: "A4",
        printBackground: true,
      });
      return buf; // success
    } else {
      console.warn(
        "[pdf] generatePdfBuffer - OPENROUTER_API_KEY not configured, skipping AI pipeline",
        {
          jobId: opts.jobId,
          tier: opts.tier,
        },
      );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error(
      "[pdf] generatePdfBuffer - AI pipeline failed, falling back to PDFKit:",
      {
        error: errorMessage,
        stack: errorStack,
        jobId: opts.jobId,
        hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
        tier: opts.tier,
      },
    );
  }

  // On serverless (Netlify/Vercel/Lambda), avoid PDFKit asset lookups; use Puppeteer-based path
  if (isServerless()) {
    await opts.onStage?.("Analyzing your request", 10);
    const multilingualFontFamily = getMultilingualFontFamily(opts.prompt ?? "");
    const detectedLanguages = detectLanguages(opts.prompt ?? "");
    const hasComplexScripts =
      containsRTL(opts.prompt ?? "") ||
      containsCJK(opts.prompt ?? "") ||
      containsIndic(opts.prompt ?? "");
    const directionStyle = hasComplexScripts
      ? "direction: auto; unicode-bidi: plaintext;"
      : "";

    let fallbackHtmlBody = `
      <main style="font-family: ${multilingualFontFamily}; padding: 40px; ${directionStyle}">
        <h1 style="text-align:center; font-size: 22px; font-feature-settings: 'liga' 1, 'kern' 1;">Generated PDF (Fallback)</h1>
        <p style="margin-top:16px; font-size: 14px; font-feature-settings: 'liga' 1, 'kern' 1;">Job ID: ${opts.jobId}</p>
        <h2 style="margin-top:16px; font-size: 14px; font-feature-settings: 'liga' 1, 'kern' 1;">Prompt:</h2>
        <pre style="white-space: pre-wrap; font-size: 12px; font-feature-settings: 'liga' 1, 'kern' 1; ${directionStyle}">${(
          opts.prompt ?? "(no prompt)"
        )
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>
        <p style="margin-top:16px; font-size: 12px; font-feature-settings: 'liga' 1, 'kern' 1;">Generated at: ${new Date().toISOString()}</p>
        ${detectedLanguages.length > 0 ? `<p style="margin-top:8px; font-size: 10px; color: #666;">Detected languages: ${detectedLanguages.join(", ")}</p>` : ""}
      </main>
    `;
    await opts.onStage?.("Generating content", 35);
    if (
      opts.image?.path &&
      (opts.image.mime === "image/png" || opts.image.mime === "image/jpeg")
    ) {
      const fs = await import("fs");
      try {
        const buf = await fs.promises.readFile(opts.image.path);
        const dataUrl = buildImageDataUrl({
          mime: opts.image.mime,
          dataBase64: buf.toString("base64"),
        });
        const imgHtml =
          opts.image.mode === "cover"
            ? `<figure style="margin:0 0 20px 0;"><img src="${dataUrl}" alt="Cover Image" style="display:block;width:100%;height:auto;object-fit:cover;border-radius:8px;" /></figure>`
            : `<figure style="margin:0 0 12px 0;text-align:center;"><img src="${dataUrl}" alt="Image" style="max-width:100%;height:auto;border-radius:6px;" /></figure>`;
        // Inject image before the first heading inside <main>
        fallbackHtmlBody = fallbackHtmlBody.replace("<h1", `${imgHtml}<h1`);
      } catch {
        // ignore
      }
    }
    const htmlDoc = wrapHtmlDocument(
      fallbackHtmlBody,
      "Prompt‑to‑PDF Document",
    );
    await opts.onStage?.("Formatting PDF", 70);
    const buf = await htmlToPdfToBuffer(htmlDoc, {
      format: "A4",
      printBackground: true,
    });
    return buf;
  }

  // Final fallback: use Puppeteer HTML path even on non-serverless environments so we always support multilingual text
  {
    await opts.onStage?.("Analyzing your request", 10);
    const multilingualFontFamily = getMultilingualFontFamily(opts.prompt ?? "");
    const detectedLanguages = detectLanguages(opts.prompt ?? "");
    const hasComplexScripts =
      containsRTL(opts.prompt ?? "") ||
      containsCJK(opts.prompt ?? "") ||
      containsIndic(opts.prompt ?? "");
    const directionStyle = hasComplexScripts
      ? "direction: auto; unicode-bidi: plaintext;"
      : "";

    const fallbackBody = `<main style="font-family: ${multilingualFontFamily}; padding: 40px; ${directionStyle}">
      <h1 style="text-align:center; font-size: 22px; font-feature-settings: 'liga' 1, 'kern' 1;">Generated PDF (Fallback)</h1>
      <p style="margin-top:16px; font-size: 14px; font-feature-settings: 'liga' 1, 'kern' 1;">Job ID: ${opts.jobId}</p>
      <h2 style="margin-top:16px; font-size: 14px; font-feature-settings: 'liga' 1, 'kern' 1;">Prompt:</h2>
      <pre style="white-space: pre-wrap; font-size: 12px; font-feature-settings: 'liga' 1, 'kern' 1; ${directionStyle}">${(
        opts.prompt ?? "(no prompt)"
      )
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>
      <p style="margin-top:16px; font-size: 12px; font-feature-settings: 'liga' 1, 'kern' 1;">Generated at: ${new Date().toISOString()}</p>
      ${detectedLanguages.length > 0 ? `<p style="margin-top:8px; font-size: 10px; color: #666;">Detected languages: ${detectedLanguages.join(", ")}</p>` : ""}
    </main>`;
    const htmlDoc = wrapHtmlDocument(fallbackBody, "Prompt-to-PDF Document");
    await opts.onStage?.("Formatting PDF", 70);
    const buf = await htmlToPdfToBuffer(htmlDoc, {
      format: "A4",
      printBackground: true,
    });
    return buf;
  }

  /*
  // Fallback to simple PDFKit document to Buffer*/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment
  const { default: PDFDocument } = (await import(PDFKIT_MODULE)) as any;
  return await new Promise<Buffer>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const pt = new PassThrough();
    const chunks: Buffer[] = [];
    pt.on("data", (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    pt.on("end", () => resolve(Buffer.concat(chunks)));
    pt.on("error", (e) => reject(e));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.pipe(pt);

    void (async () => {
      try {
        await opts.onStage?.("Generating content", 35);
      } catch {}
    })();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(20).text("Generated PDF (Fallback)", { align: "center" });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.moveDown();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(12).text(`Job ID: ${opts.jobId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.moveDown();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(12).text("Prompt:");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(10).text(opts.prompt ?? "(no prompt)");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.moveDown();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    doc.fontSize(10).text(`Generated at: ${new Date().toISOString()}`);

    // Draw optional image with automatic scaling to fit within page margins
    (async () => {
      try {
        if (opts.image?.path) {
          const fs = await import("fs");
          const exists = await fs.promises
            .stat(opts.image.path)
            .then((s) => s.isFile())
            .catch(() => false);
          if (exists) {
            // Calculate max box
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const pageWidth = doc.page.width;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const pageHeight = doc.page.height;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const marginLeft = doc.page.margins.left;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const marginRight = doc.page.margins.right;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const marginTop = doc.page.margins.top;
            const maxWidth = pageWidth - marginLeft - marginRight;
            const maxHeight =
              opts.image.mode === "cover" ? pageHeight - marginTop - 200 : 300; // cover: big hero, inline: modest height
            // PDFKit can accept width/height to scale maintaining aspect
            // Place image at current y
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            doc.moveDown();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            doc.image(opts.image.path, {
              fit: [maxWidth, maxHeight],
              align: "center",
              valign: "top",
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            doc.moveDown();
          }
        }
        await opts.onStage?.("Formatting PDF", 70);
      } catch {
        // ignore image draw errors
      }
      // finalize after trying image
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      doc.end();
    })().catch(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        doc.end();
      } catch {}
    });
  });
}

export default generatePdfToPath;
