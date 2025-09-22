import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import {
  generateHtmlFromPrompt,
  wrapHtmlDocument,
} from "~/server/ai/openrouter";
import htmlToPdfToPath, { htmlToPdfToBuffer } from "~/server/jobs/htmlToPdf";

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

  // Fallback to simple PDFKit document
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Generated PDF (Fallback)", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Job ID: ${opts.jobId}`);
    doc.moveDown();
    doc.fontSize(12).text("Prompt:");
    doc.fontSize(10).text(opts.prompt ?? "(no prompt)");
    doc.moveDown();
    doc.fontSize(10).text(`Generated at: ${new Date().toISOString()}`);

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

  // Fallback to simple PDFKit document to Buffer
  return await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const pt = new PassThrough();
    const chunks: Buffer[] = [];
    pt.on("data", (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    pt.on("end", () => resolve(Buffer.concat(chunks)));
    pt.on("error", (e) => reject(e));

    doc.pipe(pt);

    doc.fontSize(20).text("Generated PDF (Fallback)", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Job ID: ${opts.jobId}`);
    doc.moveDown();
    doc.fontSize(12).text("Prompt:");
    doc.fontSize(10).text(opts.prompt ?? "(no prompt)");
    doc.moveDown();
    doc.fontSize(10).text(`Generated at: ${new Date().toISOString()}`);

    doc.end();
  });
}

export default generatePdfToPath;
