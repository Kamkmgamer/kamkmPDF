import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import {
  generateHtmlFromPrompt,
  wrapHtmlDocument,
} from "~/server/ai/openrouter";
import htmlToPdfToPath from "~/server/jobs/htmlToPdf";

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

export default generatePdfToPath;
