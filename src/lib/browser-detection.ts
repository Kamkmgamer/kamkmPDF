/**
 * Browser detection utilities for PDF generation compatibility
 */

export interface BrowserInfo {
  name: "chrome" | "firefox" | "safari" | "edge" | "opera" | "unknown";
  version: string;
  supportsPrintToPDF: boolean;
  supportsWebFonts: boolean;
  recommendClientSide: boolean;
  notes?: string;
}

export function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      name: "unknown",
      version: "0",
      supportsPrintToPDF: false,
      supportsWebFonts: false,
      recommendClientSide: false,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const vendor = navigator.vendor?.toLowerCase() ?? "";

  // Edge (Chromium-based)
  if (userAgent.includes("edg/")) {
    const match = /edg\/([\d.]+)/.exec(userAgent);
    const version = match?.[1] ?? "0";
    return {
      name: "edge",
      version,
      supportsPrintToPDF: true,
      supportsWebFonts: true,
      recommendClientSide: true,
      notes: "Chromium-based Edge has excellent PDF support",
    };
  }

  // Chrome
  if (userAgent.includes("chrome") && vendor.includes("google")) {
    const match = /chrome\/([\d.]+)/.exec(userAgent);
    const version = match?.[1] ?? "0";
    return {
      name: "chrome",
      version,
      supportsPrintToPDF: true,
      supportsWebFonts: true,
      recommendClientSide: true,
      notes: "Chrome has excellent native PDF generation",
    };
  }

  // Firefox
  if (userAgent.includes("firefox")) {
    const match = /firefox\/([\d.]+)/.exec(userAgent);
    const version = match?.[1] ?? "0";
    return {
      name: "firefox",
      version,
      supportsPrintToPDF: true,
      supportsWebFonts: true,
      recommendClientSide: true,
      notes: "Firefox has built-in PDF.js with excellent font support",
    };
  }

  // Safari
  if (userAgent.includes("safari") && vendor.includes("apple")) {
    const match = /version\/([\d.]+)/.exec(userAgent);
    const version = match?.[1] ?? "0";
    const majorVersion = parseInt(version.split(".")[0] ?? "0", 10);
    
    return {
      name: "safari",
      version,
      supportsPrintToPDF: true,
      supportsWebFonts: majorVersion >= 11, // Safari 11+ has good web font support
      recommendClientSide: majorVersion >= 11,
      notes: majorVersion >= 11 
        ? "Safari has excellent print-to-PDF with web font support"
        : "Older Safari versions may have limited web font support in print",
    };
  }

  // Opera
  if (userAgent.includes("opr/") || userAgent.includes("opera")) {
    const match = /(?:opr|opera)\/([\d.]+)/.exec(userAgent);
    const version = match?.[1] ?? "0";
    return {
      name: "opera",
      version,
      supportsPrintToPDF: true,
      supportsWebFonts: true,
      recommendClientSide: true,
      notes: "Chromium-based Opera has excellent PDF support",
    };
  }

  // Unknown browser - be conservative
  return {
    name: "unknown",
    version: "0",
    supportsPrintToPDF: true, // Most modern browsers support print
    supportsWebFonts: true,
    recommendClientSide: false, // Use server-side for unknown browsers
    notes: "Unknown browser - server-side generation recommended",
  };
}

/**
 * Check if the current browser supports client-side PDF generation
 */
export function supportsClientSidePDF(): boolean {
  if (typeof window === "undefined") return false;
  
  const browser = detectBrowser();
  return browser.supportsPrintToPDF && browser.supportsWebFonts;
}

/**
 * Get a user-friendly message about PDF generation support
 */
export function getPDFSupportMessage(): string {
  const browser = detectBrowser();
  
  if (browser.recommendClientSide) {
    return `${capitalize(browser.name)} supports instant PDF generation in your browser!`;
  }
  
  if (browser.supportsPrintToPDF) {
    return `${capitalize(browser.name)} supports PDF generation, but server-side may provide better quality.`;
  }
  
  return "Your browser may have limited PDF support. Server-side generation is recommended.";
}

/**
 * Get recommended PDF generation method for current browser
 */
export function getRecommendedMethod(): "client" | "server" | "hybrid" {
  const browser = detectBrowser();
  
  if (browser.recommendClientSide) {
    return "client";
  }
  
  if (browser.supportsPrintToPDF) {
    return "hybrid";
  }
  
  return "server";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Browser-specific print CSS optimizations
 */
export function getBrowserSpecificPrintCSS(): string {
  const browser = detectBrowser();
  
  let css = `
    @page {
      margin: 20mm 15mm;
      size: A4;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      line-height: 1.4;
    }
  `;
  
  // Firefox-specific optimizations
  if (browser.name === "firefox") {
    css += `
      /* Firefox print optimizations */
      @media print {
        body {
          -moz-osx-font-smoothing: grayscale;
        }
      }
    `;
  }
  
  // Safari-specific optimizations
  if (browser.name === "safari") {
    css += `
      /* Safari print optimizations */
      @media print {
        body {
          -webkit-font-smoothing: antialiased;
        }
        /* Ensure web fonts load in Safari print */
        @font-face {
          font-display: block;
        }
      }
    `;
  }
  
  return css;
}
