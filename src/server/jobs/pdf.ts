import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export async function generatePdfToPath(
  filePath: string,
  opts: { jobId: string; prompt?: string },
) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Generated PDF", { align: "center" });
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
