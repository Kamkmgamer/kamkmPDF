import type { PaperFormat } from "puppeteer-core";
import { generatePdfFromHtml, generatePdfToFile } from "~/lib/pdf-generator";

// Legacy compatibility - redirect to optimized implementation
export default async function htmlToPdfToPath(
  html: string,
  filePath: string,
  opts: HtmlToPdfOptions = {},
): Promise<void> {
  await generatePdfToFile(html, filePath, {
    format: opts.format,
    printBackground: opts.printBackground,
    margin: opts.margin,
  });
}

export async function htmlToPdfToBuffer(
  html: string,
  opts: HtmlToPdfOptions = {},
): Promise<Buffer> {
  const result = await generatePdfFromHtml(html, {
    format: opts.format,
    printBackground: opts.printBackground,
    margin: opts.margin,
  });
  return result.buffer;
}

export interface HtmlToPdfOptions {
  format?: PaperFormat;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}