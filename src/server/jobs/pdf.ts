import fs from "fs";
import path from "path";
import { PassThrough } from "stream";
import {
  generateHtmlFromPrompt,
  wrapHtmlDocument,
} from "~/server/ai/openrouter";
import htmlToPdfToPath, { htmlToPdfToBuffer } from "~/server/jobs/htmlToPdf";

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
    if (process.env.OPENROUTER_API_KEY) {
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
    }
  } catch (err) {
    console.warn("[pdf] AI pipeline failed, falling back to PDFKit:", err);
  }

  // On serverless (Netlify/Vercel/Lambda), avoid PDFKit asset lookups; use Puppeteer-based path
  if (isServerless()) {
    const fallbackHtmlBody = `
      <main style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 40px;">
        <h1 style="text-align:center; font-size: 22px;">Generated PDF (Fallback)</h1>
        <p style="margin-top:16px; font-size: 14px;">Job ID: ${opts.jobId}</p>
        <h2 style="margin-top:16px; font-size: 14px;">Prompt:</h2>
        <pre style="white-space: pre-wrap; font-size: 12px;">${(
          opts.prompt ?? "(no prompt)"
        )
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>
        <p style="margin-top:16px; font-size: 12px;">Generated at: ${new Date().toISOString()}</p>
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

export async function generatePdfBuffer(opts: {
  jobId: string;
  prompt?: string;
}): Promise<Buffer> {
  // Try AI pipeline if configured
  try {
    if (process.env.OPENROUTER_API_KEY) {
      const htmlBody = await generateHtmlFromPrompt({
        prompt: opts.prompt ?? "",
        brandName: "Prompt‑to‑PDF",
      });
      const htmlDoc = wrapHtmlDocument(htmlBody, "Prompt‑to‑PDF Document");
      const buf = await htmlToPdfToBuffer(htmlDoc, {
        format: "A4",
        printBackground: true,
      });
      return buf; // success
    }
  } catch (err) {
    console.warn("[pdf] AI pipeline failed, falling back to PDFKit:", err);
  }

  // On serverless (Netlify/Vercel/Lambda), avoid PDFKit asset lookups; use Puppeteer-based path
  if (isServerless()) {
    const fallbackHtmlBody = `
      <main style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 40px;">
        <h1 style="text-align:center; font-size: 22px;">Generated PDF (Fallback)</h1>
        <p style="margin-top:16px; font-size: 14px;">Job ID: ${opts.jobId}</p>
        <h2 style="margin-top:16px; font-size: 14px;">Prompt:</h2>
        <pre style="white-space: pre-wrap; font-size: 12px;">${(
          opts.prompt ?? "(no prompt)"
        )
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>
        <p style="margin-top:16px; font-size: 12px;">Generated at: ${new Date().toISOString()}</p>
      </main>
    `;
    const htmlDoc = wrapHtmlDocument(
      fallbackHtmlBody,
      "Prompt‑to‑PDF Document",
    );
    const buf = await htmlToPdfToBuffer(htmlDoc, {
      format: "A4",
      printBackground: true,
    });
    return buf;
  }

  // Fallback to simple PDFKit document to Buffer
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
  });
}

export default generatePdfToPath;
