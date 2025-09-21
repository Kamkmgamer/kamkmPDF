import fs from "fs";
import path from "path";
import type { Browser, PaperFormat } from "puppeteer-core";

export interface HtmlToPdfOptions {
  format?: PaperFormat;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  printBackground?: boolean;
}

export default async function htmlToPdfToPath(
  html: string,
  filePath: string,
  opts: HtmlToPdfOptions = {},
) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  // Launch browser depending on environment
  let browser: Browser | null = null;
  if (process.env.VERCEL) {
    // Vercel/Serverless: use puppeteer-core + @sparticuz/chromium
    const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);
    const executablePath = await chromium.executablePath();
    const normalizedHeadless: boolean | "shell" =
      typeof chromium.headless === "string"
        ? chromium.headless === "shell"
          ? "shell"
          : true
        : (chromium.headless ?? true);
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || undefined,
      headless: normalizedHeadless,
    });
  } else {
    // Local/Non-serverless: try puppeteer; fallback to puppeteer-core + system Chrome
    try {
      const { default: puppeteer } = await import("puppeteer");
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--font-render-hinting=medium",
        ],
      });
    } catch {
      const [{ default: puppeteer }, { default: chromium }] = await Promise.all(
        [import("puppeteer-core"), import("@sparticuz/chromium")],
      );
      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ??
        (await chromium.executablePath());
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath || undefined,
        headless: true,
      });
    }
  }
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });
    await page.emulateMediaType("screen");

    await page.pdf({
      path: filePath,
      format: opts.format ?? "A4",
      printBackground: opts.printBackground ?? true,
      margin: {
        top: opts.margin?.top ?? "20mm",
        right: opts.margin?.right ?? "15mm",
        bottom: opts.margin?.bottom ?? "20mm",
        left: opts.margin?.left ?? "15mm",
      },
    });
  } finally {
    if (browser) await browser.close();
  }
}
