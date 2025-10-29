import type { Page, PaperFormat } from "puppeteer-core";
import { getBrowserPool } from "~/lib/browser-pool";
import { logger } from "~/lib/logger";

export interface OptimizedPdfOptions {
  format?: PaperFormat;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  waitForImages?: boolean;
  timeout?: number;
}

export interface PdfGenerationResult {
  buffer: Buffer;
  metadata: {
    pageCount: number;
    generationTime: number;
    browserId: string;
  };
}

// Concurrency control for PDF generation
const MAX_PDF_CONCURRENCY = parseInt(process.env.MAX_PDF_CONCURRENCY ?? "8", 10);
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
  activePdfTasks--;
  const next = waitQueue.shift();
  if (next) next();
}

/**
 * Generate PDF from HTML using optimized browser pool
 */
export async function generatePdfFromHtml(
  html: string,
  options: OptimizedPdfOptions = {}
): Promise<PdfGenerationResult> {
  const startTime = Date.now();
  await acquirePdfSlot();

  let page: Page | null = null;
  let browserId = "unknown";

  try {
    const browserPool = getBrowserPool();
    await browserPool.getBrowser(); // Warm up the browser
    page = await browserPool.getPage();

    // Get browser ID for tracking
    const stats = browserPool.getStats();
    const browserInstance = stats.browsers.find(b => b.pageCount > 0);
    browserId = browserInstance?.id ?? "unknown";

    // Optimize page loading
    await page.setContent(html, {
      waitUntil: options.waitForImages ? ["domcontentloaded", "networkidle0"] : "domcontentloaded",
      timeout: options.timeout ?? 30000,
    });

    // Set media type for consistent rendering
    await page.emulateMediaType("screen");

    // Generate PDF with optimized settings
    const pdfBuffer = (await page.pdf({
      format: options.format ?? "A4",
      printBackground: options.printBackground ?? true,
      margin: {
        top: options.margin?.top ?? "20mm",
        right: options.margin?.right ?? "15mm",
        bottom: options.margin?.bottom ?? "20mm",
        left: options.margin?.left ?? "15mm",
      },
      // Optimize PDF generation
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      // Performance optimizations
      timeout: options.timeout ?? 30000,
    })) as Buffer;

    const generationTime = Date.now() - startTime;
    
    logger.info({
      browserId,
      generationTime,
      pdfSize: pdfBuffer.length,
      concurrency: activePdfTasks,
    }, "PDF generated successfully");

    return {
      buffer: pdfBuffer,
      metadata: {
        pageCount: 1, // Could be enhanced to detect actual page count
        generationTime,
        browserId,
      },
    };

  } catch (error) {
    logger.error({
      error: String(error),
      browserId,
      generationTime: Date.now() - startTime,
    }, "PDF generation failed");

    throw error;
  } finally {
    if (page) {
      const browserPool = getBrowserPool();
      await browserPool.closePage(page);
    }
    releasePdfSlot();
  }
}

/**
 * Generate PDF from HTML and save to file path
 */
export async function generatePdfToFile(
  html: string,
  filePath: string,
  options: OptimizedPdfOptions = {}
): Promise<void> {
  const fs = await import("fs");
  const path = await import("path");
  
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  const result = await generatePdfFromHtml(html, options);
  await fs.promises.writeFile(filePath, result.buffer);
}

/**
 * Pre-warm browser pool for faster cold starts
 */
export async function preWarmBrowserPool(): Promise<void> {
  try {
    const browserPool = getBrowserPool();
    await browserPool.getBrowser(); // Warm up the browser
    
    // Create a test page to ensure browser is ready
    const page = await browserPool.getPage();
    await page.setContent("<html><body>Test</body></html>");
    await browserPool.closePage(page);
    
    logger.info("Browser pool pre-warmed successfully");
  } catch (error) {
    logger.warn({ error: String(error) }, "Failed to pre-warm browser pool");
  }
}

/**
 * Get browser pool statistics
 */
export function getBrowserPoolStats() {
  const browserPool = getBrowserPool();
  return {
    ...browserPool.getStats(),
    activePdfTasks,
    waitQueueLength: waitQueue.length,
  };
}

/**
 * Cleanup browser pool (useful for testing or graceful shutdown)
 */
export async function cleanupBrowserPool(): Promise<void> {
  const browserPool = getBrowserPool();
  await browserPool.destroy();
}
