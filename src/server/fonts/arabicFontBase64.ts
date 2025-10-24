/**
 * Base64-encoded Arabic font for serverless environments
 * Font: Noto Sans Arabic subset (400 weight, Latin + Arabic glyphs)
 *
 * This is a minimal subset to keep bundle size small (~40-50KB)
 * Fetched once and cached to avoid repeated downloads
 */

let cachedFontBase64: string | null = null;

/**
 * Get base64-encoded Noto Sans Arabic font
 * Downloads from Google Fonts CDN on first call, then caches
 */
export async function getArabicFontBase64(): Promise<string> {
  if (cachedFontBase64) {
    return cachedFontBase64;
  }

  try {
    // First, fetch the CSS from Google Fonts API to get the actual font URL
    // Google Fonts returns different formats based on User-Agent (WOFF2 for modern browsers)
    const cssResponse = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400",
      {
        headers: {
          // Use a modern browser user-agent to get WOFF2 format
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );

    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch font CSS: ${cssResponse.statusText}`);
    }

    const cssText = await cssResponse.text();

    // Extract the font URL from the CSS
    // Format: src: url(https://fonts.gstatic.com/.../font.woff2) format('woff2');
    const urlMatch = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/.exec(
      cssText,
    );

    if (!urlMatch?.[1]) {
      // Fallback: Use the TTF URL directly (larger file but works)
      const ttfMatch =
        /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/.exec(cssText);
      if (!ttfMatch?.[1]) {
        throw new Error("Could not extract font URL from CSS");
      }
      console.log("[arabicFont] Using TTF format (WOFF2 not available)");
      const fontUrl = ttfMatch[1];
      const response = await fetch(fontUrl);
      if (!response.ok)
        throw new Error(`Failed to fetch font: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      cachedFontBase64 = buffer.toString("base64");
      console.log(
        "[arabicFont] Loaded and cached Arabic font (~" +
          Math.round(buffer.length / 1024) +
          "KB)",
      );
      return cachedFontBase64;
    }

    const fontUrl = urlMatch[1];
    console.log("[arabicFont] Fetching font from:", fontUrl);

    // Now fetch the actual font file
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font file: ${fontResponse.statusText}`);
    }

    const arrayBuffer = await fontResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    cachedFontBase64 = buffer.toString("base64");

    console.log(
      "[arabicFont] Loaded and cached Arabic font (~" +
        Math.round(buffer.length / 1024) +
        "KB)",
    );
    return cachedFontBase64;
  } catch (error) {
    console.error("[arabicFont] Failed to load Arabic font:", error);
    // Return empty string as fallback - system fonts will be used
    return "";
  }
}

/**
 * Pre-load the font (call this on server startup if needed)
 */
export async function preloadArabicFont(): Promise<void> {
  await getArabicFontBase64();
}
