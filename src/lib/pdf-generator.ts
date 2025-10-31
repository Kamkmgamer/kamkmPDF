import type { Page, PaperFormat } from "puppeteer-core";
import { getBrowserPool } from "~/lib/browser-pool";
import { logger } from "~/lib/logger";
import { containsRTL, containsCJK, containsIndic } from "~/server/utils/multilingualText";

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
 * Wait for fonts to load in the page
 * Uses document.fonts.ready API and checks specific Arabic fonts
 */
async function waitForFonts(page: Page, timeout = 10000): Promise<void> {
  try {
    await page.evaluate(async (timeoutMs) => {
      const startTime = Date.now();
      
      // Wait for fonts to be ready using Font Loading API
      if (document.fonts && 'ready' in document.fonts) {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Font loading timeout')), timeoutMs)
            ),
          ]);
        } catch {
          // Fonts.ready timed out, but continue to check individual fonts
        }
      }

      // Additional check: verify Arabic fonts are loaded (if Arabic content exists)
      const arabicFonts = [
        'Noto Naskh Arabic',
        'Noto Sans Arabic',
        'Amiri',
        'Scheherazade New',
      ];

      // Poll for fonts to be loaded
      const checkFonts = async () => {
        const maxAttempts = Math.floor(timeoutMs / 200); // Check every 200ms
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          if (Date.now() - startTime > timeoutMs) {
            break;
          }

          let allFontsLoaded = true;
          for (const fontFamily of arabicFonts) {
            if (document.fonts?.check) {
              // Check if font is loaded (using a test string with Arabic characters)
              const loaded = document.fonts.check(`16px "${fontFamily}"`, 'ا');
              if (!loaded) {
                allFontsLoaded = false;
                break;
              }
            }
          }

          if (allFontsLoaded) {
            return; // All fonts loaded
          }

          // Wait before next check
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      };

      await Promise.race([
        checkFonts(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Font verification timeout')), timeoutMs)
        ),
      ]);
    }, timeout);
  } catch (error) {
    // Log warning but don't fail - fonts may still render correctly
    // The networkidle0 wait should have ensured fonts are mostly loaded
    logger.warn({ error: String(error) }, "Font loading check timed out, proceeding anyway");
  }
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

    // Detect if content contains multilingual text (Arabic, RTL, CJK, Indic)
    const hasMultilingualContent = 
      containsRTL(html) || 
      containsCJK(html) || 
      containsIndic(html);

    // Use networkidle0 for multilingual content to ensure fonts load
    // This ensures all network requests (including font files) complete
    const waitStrategy = hasMultilingualContent || options.waitForImages
      ? (["domcontentloaded", "networkidle0"] as ["domcontentloaded", "networkidle0"])
      : "domcontentloaded";

    // Optimize page loading
    await page.setContent(html, {
      waitUntil: waitStrategy,
      timeout: options.timeout ?? 30000,
    });

    // Wait for fonts to load if multilingual content is detected
    if (hasMultilingualContent) {
      await waitForFonts(page, 10000); // 10 second timeout for font loading
      // Small delay to ensure font rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }

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
