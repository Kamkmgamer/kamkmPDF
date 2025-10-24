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
    // Fetch a minimal Noto Sans Arabic WOFF2 from Google Fonts
    // This URL provides a subset optimized for web use
    const fontUrl =
      "https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.woff2";

    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
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
