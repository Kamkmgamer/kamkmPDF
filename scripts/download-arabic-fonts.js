#!/usr/bin/env node
/**
 * Download Arabic fonts for local embedding
 * These fonts are needed for reliable Arabic text rendering in PDFs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(__dirname, "..", "public", "fonts");

// Create fonts directory if it doesn't exist
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Font URLs - using Google Fonts API CDN
/**
 * @typedef {Object} FontConfig
 * @property {string} name
 * @property {string} url
 * @property {boolean} [extractFromCSS]
 */

/** @type {FontConfig[]} */
const fonts = [
  {
    name: "NotoNaskhArabic-Regular.ttf",
    // Google Fonts API direct download
    url: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400&display=swap",
    // We'll extract the actual font URL from the CSS
    extractFromCSS: true,
  },
  {
    name: "NotoSansArabic-Regular.ttf",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400&display=swap",
    extractFromCSS: true,
  },
  {
    name: "Amiri-Regular.ttf",
    url: "https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf",
    extractFromCSS: false,
  },
];

/**
 * @typedef {Object} FontConfig
 * @property {string} name
 * @property {string} url
 * @property {boolean} [extractFromCSS]
 */

/**
 * @param {FontConfig} font
 */
async function downloadFont(font) {
  const filePath = path.join(fontsDir, font.name);

  // Skip if already exists
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${font.name} already exists, skipping...`);
    return;
  }

  console.log(`Downloading ${font.name}...`);
  try {
    if (font.extractFromCSS) {
      // Download CSS first, then extract font URL
      const cssResponse = await fetch(font.url);
      if (!cssResponse.ok) {
        throw new Error(`CSS fetch failed: HTTP ${cssResponse.status}`);
      }
      const cssText = await cssResponse.text();

      // Extract font URL from CSS (format: url(https://fonts.gstatic.com/...))
      const urlMatch = cssText.match(/url\(([^)]+)\)/);
      if (!urlMatch || !urlMatch[1]) {
        throw new Error("Could not extract font URL from CSS");
      }

      const fontUrl = urlMatch[1].replace(/['"]/g, "");
      console.log(`  Found font URL: ${fontUrl.substring(0, 60)}...`);

      // Download the actual font file
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
        throw new Error(`Font download failed: HTTP ${fontResponse.status}`);
      }
      const buffer = await fontResponse.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(
        `✓ Downloaded ${font.name} (${(buffer.byteLength / 1024).toFixed(1)} KB)`,
      );
    } else {
      // Direct download
      const response = await fetch(font.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(
        `✓ Downloaded ${font.name} (${(buffer.byteLength / 1024).toFixed(1)} KB)`,
      );
    }
  } catch (error) {
    console.error(`✗ Failed to download ${font.name}:`, error.message);
    console.error(`  URL: ${font.url}`);
  }
}

async function main() {
  console.log("Downloading Arabic fonts to public/fonts/...\n");

  for (const font of fonts) {
    await downloadFont(font);
  }

  console.log("\nDone! Fonts are ready in public/fonts/");
  console.log("\nNote: If downloads fail, you can manually download from:");
  console.log(
    "  - Noto Naskh Arabic: https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic",
  );
  console.log(
    "  - Noto Sans Arabic: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic",
  );
  console.log("  - Amiri: https://fonts.google.com/specimen/Amiri");
}

main().catch(console.error);
