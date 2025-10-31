import type { Browser, Page } from "puppeteer-core";
import { logger } from "~/lib/logger";

// Browser pool configuration
const BROWSER_POOL_SIZE = parseInt(process.env.BROWSER_POOL_SIZE ?? "3", 10);
const BROWSER_IDLE_TIMEOUT = parseInt(
  process.env.BROWSER_IDLE_TIMEOUT ?? "300000",
  10,
); // 5 minutes
const PAGE_IDLE_TIMEOUT = parseInt(
  process.env.PAGE_IDLE_TIMEOUT ?? "60000",
  10,
); // 1 minute

interface BrowserInstance {
  browser: Browser;
  lastUsed: number;
  pageCount: number;
  isHealthy: boolean;
}

interface PageInstance {
  page: Page;
  browserId: string;
  createdAt: number;
}

class BrowserPool {
  private browsers = new Map<string, BrowserInstance>();
  private pages = new Map<string, PageInstance>();
  private browserCounter = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    // Clean up idle browsers and pages every 30 seconds
    this.cleanupInterval = setInterval(() => {
      void this.cleanup();
    }, 30000);
  }

  private async cleanup() {
    const now = Date.now();

    // Clean up idle pages
    for (const [pageId, pageInstance] of this.pages.entries()) {
      if (now - pageInstance.createdAt > PAGE_IDLE_TIMEOUT) {
        try {
          await pageInstance.page.close();
          this.pages.delete(pageId);

          // Update browser page count
          const browserInstance = this.browsers.get(pageInstance.browserId);
          if (browserInstance) {
            browserInstance.pageCount = Math.max(
              0,
              browserInstance.pageCount - 1,
            );
          }
        } catch (error) {
          logger.warn(
            { error: String(error), pageId },
            "Failed to cleanup idle page",
          );
        }
      }
    }

    // Clean up idle browsers
    for (const [browserId, browserInstance] of this.browsers.entries()) {
      if (
        browserInstance.pageCount === 0 &&
        now - browserInstance.lastUsed > BROWSER_IDLE_TIMEOUT
      ) {
        try {
          await browserInstance.browser.close();
          this.browsers.delete(browserId);
          logger.info({ browserId }, "Cleaned up idle browser");
        } catch (error) {
          logger.warn(
            { error: String(error), browserId },
            "Failed to cleanup idle browser",
          );
        }
      }
    }
  }

  async getBrowser(): Promise<Browser> {
    // Try to reuse an existing healthy browser
    for (const [_browserId, browserInstance] of this.browsers.entries()) {
      if (browserInstance.isHealthy && browserInstance.pageCount < 10) {
        browserInstance.lastUsed = Date.now();
        return browserInstance.browser;
      }
    }

    // Create new browser if pool not full
    if (this.browsers.size < BROWSER_POOL_SIZE) {
      return this.createBrowser();
    }

    // Wait for a browser to become available
    return this.waitForBrowser();
  }

  private async createBrowser(): Promise<Browser> {
    const browserId = `browser-${++this.browserCounter}`;

    try {
      const browser = await this.launchOptimizedBrowser();

      this.browsers.set(browserId, {
        browser,
        lastUsed: Date.now(),
        pageCount: 0,
        isHealthy: true,
      });

      logger.info(
        { browserId, poolSize: this.browsers.size },
        "Created new browser instance",
      );
      return browser;
    } catch (error) {
      logger.error(
        { error: String(error), browserId },
        "Failed to create browser",
      );
      throw error;
    }
  }

  private async waitForBrowser(): Promise<Browser> {
    // Wait up to 10 seconds for a browser to become available
    const startTime = Date.now();
    const timeout = 10000;

    while (Date.now() - startTime < timeout) {
      for (const [_browserId, browserInstance] of this.browsers.entries()) {
        if (browserInstance.isHealthy && browserInstance.pageCount < 10) {
          browserInstance.lastUsed = Date.now();
          return browserInstance.browser;
        }
      }

      // Wait 100ms before checking again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error("Timeout waiting for available browser");
  }

  private async launchOptimizedBrowser(): Promise<Browser> {
    const isServerless =
      !!process.env.VERCEL ||
      !!process.env.NETLIFY ||
      !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isServerless) {
      return this.launchServerlessBrowser();
    } else {
      return this.launchLocalBrowser();
    }
  }

  private async launchServerlessBrowser(): Promise<Browser> {
    const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);

    const executablePath = await chromium.executablePath();

    // Optimized Chrome arguments for serverless
    const optimizedArgs = [
      ...chromium.args,
      // Essential args for serverless
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
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
      "--disable-background-networking",
      "--disable-client-side-phishing-detection",
      "--disable-hang-monitor",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-web-resources",
      "--metrics-recording-only",
      "--safebrowsing-disable-auto-update",
      "--enable-automation",
      "--password-store=basic",
      "--use-mock-keychain",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=VizDisplayCompositor",
      // Font rendering optimizations
      "--font-render-hinting=medium",
      "--disable-font-subpixel-positioning",
      "--enable-font-antialiasing",
      // Memory optimizations
      "--max_old_space_size=512",
      "--memory-pressure-off",
      // Performance optimizations
      "--enable-features=NetworkService,NetworkServiceLogging",
      "--disable-features=VizDisplayCompositor",
    ];

    const normalizedHeadless: boolean | "shell" =
      typeof chromium.headless === "string"
        ? chromium.headless === "shell"
          ? "shell"
          : true
        : (chromium.headless ?? true);

    return puppeteer.launch({
      executablePath,
      args: optimizedArgs,
      defaultViewport: chromium.defaultViewport,
      headless: normalizedHeadless,
      // Optimize for serverless
      protocolTimeout: 60000,
      timeout: 30000,
    });
  }

  private async launchLocalBrowser(): Promise<Browser> {
    try {
      const { default: puppeteer } = await import("puppeteer");
      return puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--font-render-hinting=medium",
          "--disable-font-subpixel-positioning",
          "--enable-font-antialiasing",
          "--memory-pressure-off",
        ],
        protocolTimeout: 60000,
        timeout: 30000,
      });
    } catch {
      // Fallback to puppeteer-core + system Chrome
      const [{ default: puppeteer }, { default: chromium }] = await Promise.all(
        [import("puppeteer-core"), import("@sparticuz/chromium")],
      );

      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ??
        (await chromium.executablePath());

      return puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath || undefined,
        headless: true,
        protocolTimeout: 60000,
        timeout: 30000,
      });
    }
  }

  async getPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    // Optimize page settings
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
    await page.setCacheEnabled(false); // Disable cache for consistent results
    await page.setJavaScriptEnabled(true);

    // Set timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    const pageId = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const browserId =
      Array.from(this.browsers.entries()).find(
        ([_, instance]) => instance.browser === browser,
      )?.[0] ?? "unknown";

    this.pages.set(pageId, {
      page,
      browserId,
      createdAt: Date.now(),
    });

    // Update browser page count
    const browserInstance = this.browsers.get(browserId);
    if (browserInstance) {
      browserInstance.pageCount++;
    }

    return page;
  }

  async closePage(page: Page): Promise<void> {
    try {
      await page.close();

      // Find and remove page from tracking
      for (const [pageId, pageInstance] of this.pages.entries()) {
        if (pageInstance.page === page) {
          this.pages.delete(pageId);

          // Update browser page count
          const browserInstance = this.browsers.get(pageInstance.browserId);
          if (browserInstance) {
            browserInstance.pageCount = Math.max(
              0,
              browserInstance.pageCount - 1,
            );
          }
          break;
        }
      }
    } catch (error) {
      logger.warn({ error: String(error) }, "Failed to close page");
    }
  }

  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close all pages
    for (const [pageId, pageInstance] of this.pages.entries()) {
      try {
        await pageInstance.page.close();
      } catch (error) {
        logger.warn(
          { error: String(error), pageId },
          "Failed to close page during destroy",
        );
      }
    }
    this.pages.clear();

    // Close all browsers
    for (const [browserId, browserInstance] of this.browsers.entries()) {
      try {
        await browserInstance.browser.close();
      } catch (error) {
        logger.warn(
          { error: String(error), browserId },
          "Failed to close browser during destroy",
        );
      }
    }
    this.browsers.clear();

    logger.info("Browser pool destroyed");
  }

  getStats() {
    return {
      browserCount: this.browsers.size,
      pageCount: this.pages.size,
      browsers: Array.from(this.browsers.entries()).map(([id, instance]) => ({
        id,
        pageCount: instance.pageCount,
        lastUsed: instance.lastUsed,
        isHealthy: instance.isHealthy,
      })),
    };
  }
}

// Global browser pool instance
let browserPool: BrowserPool | null = null;

export function getBrowserPool(): BrowserPool {
  browserPool ??= new BrowserPool();
  return browserPool;
}

// Graceful shutdown (Node.js only - not available in Edge Runtime)
// Use a function to delay evaluation and avoid static analysis issues
(function setupGracefulShutdown() {
  try {
    // Check if we're in Node.js environment
    const proc = typeof process !== "undefined" ? process : null;
    if (!proc || typeof proc.on !== "function") {
      return; // Edge Runtime - skip
    }

    if (typeof proc.exit !== "function") {
      return; // No exit function available
    }

    // Bind exit to process to avoid unbound method warning
    const exit = proc.exit.bind(proc);

    proc.on("SIGINT", () => {
      if (browserPool) {
        void browserPool.destroy().then(() => {
          exit(0);
        });
      } else {
        exit(0);
      }
    });

    proc.on("SIGTERM", () => {
      if (browserPool) {
        void browserPool.destroy().then(() => {
          exit(0);
        });
      } else {
        exit(0);
      }
    });
  } catch {
    // Ignore errors in Edge Runtime
  }
})();

export { BrowserPool };
