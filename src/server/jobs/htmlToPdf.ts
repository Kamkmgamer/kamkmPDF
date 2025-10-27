import fs from "fs";
import path from "path";
import type { Browser, PaperFormat, Page } from "puppeteer-core";

// --- Concurrency control / shared browser pool ---------------------------------
// Maximum number of simultaneous PDF generation tasks that can run within a single
// Node.js process. Tune via env var but default to 8 which comfortably fits within
// a 256-512 MB serverless function memory allotment.
const MAX_PDF_CONCURRENCY = parseInt(
  process.env.MAX_PDF_CONCURRENCY ?? "8",
  10,
);
let activePdfTasks = 0;
const waitQueue: Array<() => void> = [];

async function acquirePdfSlot(): Promise<void> {
  if (activePdfTasks < MAX_PDF_CONCURRENCY) {
    activePdfTasks++;
    return;
  }
  await new Promise<void>((resolve) => waitQueue.push(resolve));
  activePdfTasks++;
}

function releasePdfSlot(): void {
  activePdfTasks = Math.max(0, activePdfTasks - 1);
  const next = waitQueue.shift();
  if (next) next();
}

// Holds a shared browser instance per process. Re-using the browser avoids the
// expensive launch cost for every job and drastically lowers memory usage when
// many PDF jobs are queued concurrently.
let sharedBrowserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  sharedBrowserPromise ??= launchBrowser().catch((error) => {
    sharedBrowserPromise = null;
    throw error;
  });
  return sharedBrowserPromise;
}

// --------------------------------------------------------------------------------

export interface HtmlToPdfOptions {
  format?: PaperFormat;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  printBackground?: boolean;
}

// Wrapper around browser launch so it can be reused
async function launchBrowser(): Promise<Browser> {
  // Treat common serverless platforms (Vercel, Netlify, AWS Lambda) the same
  const isServerless =
    !!process.env.VERCEL ||
    !!process.env.NETLIFY ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
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

    // Enhanced args for Arabic text support
    const arabicSupportArgs = [
      ...chromium.args,
      "--font-render-hinting=medium",
      "--disable-font-subpixel-positioning",
      "--enable-font-antialiasing",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-plugins",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--mute-audio",
      "--no-zygote",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-client-side-phishing-detection",
      "--disable-default-apps",
      "--disable-hang-monitor",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-sync",
      "--disable-web-resources",
      "--metrics-recording-only",
      "--no-first-run",
      "--safebrowsing-disable-auto-update",
      "--enable-automation",
      "--password-store=basic",
      "--use-mock-keychain",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=VizDisplayCompositor",
    ];

    return puppeteer.launch({
      args: arabicSupportArgs,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || undefined,
      headless: normalizedHeadless,
    });
  }

  // Local/Non-serverless: try puppeteer; fallback to puppeteer-core + system Chrome
  try {
    const { default: puppeteer } = await import("puppeteer");
    return puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=medium",
      ],
    });
  } catch {
    const [{ default: puppeteer }, { default: chromium }] = await Promise.all([
      import("puppeteer-core"),
      import("@sparticuz/chromium"),
    ]);
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ??
      (await chromium.executablePath());
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || undefined,
      headless: true,
    });
  }
}

/* -------------------------------------------------------------------------
 * Main public API
 * ----------------------------------------------------------------------*/

export default async function htmlToPdfToPath(
  html: string,
  filePath: string,
  opts: HtmlToPdfOptions = {},
): Promise<void> {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  await acquirePdfSlot();

  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

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
    if (page) await page.close();
    releasePdfSlot();
  }
}

export async function htmlToPdfToBuffer(
  html: string,
  opts: HtmlToPdfOptions = {},
): Promise<Buffer> {
  await acquirePdfSlot();

  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });
    await page.emulateMediaType("screen");

    const pdfBuffer = (await page.pdf({
      format: opts.format ?? "A4",
      printBackground: opts.printBackground ?? true,
      margin: {
        top: opts.margin?.top ?? "20mm",
        right: opts.margin?.right ?? "15mm",
        bottom: opts.margin?.bottom ?? "20mm",
        left: opts.margin?.left ?? "15mm",
      },
    })) as Buffer;

    return pdfBuffer;
  } finally {
    if (page) await page.close();
    releasePdfSlot();
  }
}
