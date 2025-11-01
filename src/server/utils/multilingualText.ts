/**
 * Comprehensive multilingual text detection and handling utilities for PDF generation
 * Supports RTL languages, CJK languages, Indic scripts, and other complex writing systems
 */

/**
 * Language detection and Unicode range definitions
 */
export const LANGUAGE_RANGES = {
  // RTL Languages
  ARABIC: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  HEBREW: /[\u0590-\u05FF\uFB1D-\uFB4F]/,
  PERSIAN:
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  URDU: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  PASHTO: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  KURDISH:
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,

  // CJK Languages
  CHINESE:
    /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/,
  JAPANESE: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/,
  KOREAN: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,

  // Indic Languages
  DEVANAGARI: /[\u0900-\u097F]/,
  BENGALI: /[\u0980-\u09FF]/,
  TAMIL: /[\u0B80-\u0BFF]/,
  TELUGU: /[\u0C00-\u0C7F]/,
  GUJARATI: /[\u0A80-\u0AFF]/,
  PUNJABI: /[\u0A00-\u0A7F]/,
  MALAYALAM: /[\u0D00-\u0D7F]/,
  KANNADA: /[\u0C80-\u0CFF]/,
  ORIYA: /[\u0B00-\u0B7F]/,
  ASSAMESE: /[\u0980-\u09FF]/,

  // Other Complex Scripts
  THAI: /[\u0E00-\u0E7F]/,
  LAO: /[\u0E80-\u0EFF]/,
  MYANMAR: /[\u1000-\u109F]/,
  KHMER: /[\u1780-\u17FF]/,
  TIBETAN: /[\u0F00-\u0FFF]/,
  ETHIOPIC: /[\u1200-\u137F]/,
  ARMENIAN: /[\u0530-\u058F]/,
  GEORGIAN: /[\u10A0-\u10FF]/,
  CYRILLIC: /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]/,

  // Combined RTL detection
  RTL: /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/,

  // Combined CJK detection
  CJK: /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,

  // Combined Indic detection
  INDIC:
    /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/,
} as const;

/**
 * Language-specific font families
 */
export const LANGUAGE_FONTS = {
  ARABIC:
    '"Noto Naskh Arabic", "Noto Sans Arabic", "Amiri", "Scheherazade New", "Arabic Fallback", Arial, sans-serif',
  HEBREW:
    '"Noto Sans Hebrew", "David", "Miriam", "Arial Hebrew", Arial, sans-serif',
  PERSIAN:
    '"Noto Naskh Arabic", "Noto Sans Arabic", "Amiri", "Scheherazade New", "Arabic Fallback", Arial, sans-serif',
  URDU: '"Noto Naskh Arabic", "Noto Sans Arabic", "Amiri", "Scheherazade New", "Arabic Fallback", Arial, sans-serif',
  CHINESE:
    '"Noto Sans SC", "Noto Sans TC", "Source Han Sans SC", "Source Han Sans TC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  JAPANESE:
    '"Noto Sans JP", "Source Han Sans JP", "Hiragino Sans", "Yu Gothic", Arial, sans-serif',
  KOREAN:
    '"Noto Sans KR", "Source Han Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif',
  DEVANAGARI:
    '"Noto Sans Devanagari", "Mangal", "Arial Unicode MS", Arial, sans-serif',
  BENGALI:
    '"Noto Sans Bengali", "Vrinda", "Arial Unicode MS", Arial, sans-serif',
  TAMIL: '"Noto Sans Tamil", "Latha", "Arial Unicode MS", Arial, sans-serif',
  TELUGU:
    '"Noto Sans Telugu", "Gautami", "Arial Unicode MS", Arial, sans-serif',
  THAI: '"Noto Sans Thai", "Thonburi", "Arial Unicode MS", Arial, sans-serif',
  CYRILLIC: '"Noto Sans", "Liberation Sans", "DejaVu Sans", Arial, sans-serif',
  DEFAULT:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
} as const;

/**
 * Detects if text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  return LANGUAGE_RANGES.ARABIC.test(text);
}

/**
 * Detects if text contains Hebrew characters
 */
export function containsHebrew(text: string): boolean {
  return LANGUAGE_RANGES.HEBREW.test(text);
}

/**
 * Detects if text contains Persian characters
 */
export function containsPersian(text: string): boolean {
  return LANGUAGE_RANGES.PERSIAN.test(text);
}

/**
 * Detects if text contains Chinese characters
 */
export function containsChinese(text: string): boolean {
  return LANGUAGE_RANGES.CHINESE.test(text);
}

/**
 * Detects if text contains Japanese characters
 */
export function containsJapanese(text: string): boolean {
  return LANGUAGE_RANGES.JAPANESE.test(text);
}

/**
 * Detects if text contains Korean characters
 */
export function containsKorean(text: string): boolean {
  return LANGUAGE_RANGES.KOREAN.test(text);
}

/**
 * Detects if text contains CJK characters (Chinese, Japanese, Korean)
 */
export function containsCJK(text: string): boolean {
  return LANGUAGE_RANGES.CJK.test(text);
}

/**
 * Detects if text contains Indic script characters
 */
export function containsIndic(text: string): boolean {
  return LANGUAGE_RANGES.INDIC.test(text);
}

/**
 * Detects if text contains RTL (Right-to-Left) characters
 */
export function containsRTL(text: string): boolean {
  return LANGUAGE_RANGES.RTL.test(text);
}

/**
 * Detects all languages present in the text
 */
export function detectLanguages(text: string): string[] {
  const languages: string[] = [];

  if (containsArabic(text)) languages.push("arabic");
  if (containsHebrew(text)) languages.push("hebrew");
  if (containsPersian(text)) languages.push("persian");
  if (containsChinese(text)) languages.push("chinese");
  if (containsJapanese(text)) languages.push("japanese");
  if (containsKorean(text)) languages.push("korean");
  if (containsIndic(text)) languages.push("indic");

  return languages;
}

/**
 * Gets the appropriate font family for detected languages
 */
export function getMultilingualFontFamily(text: string): string {
  const languages = detectLanguages(text);
  const fonts: string[] = [];

  // Add fonts for detected languages
  if (languages.includes("arabic") || languages.includes("persian")) {
    fonts.push(LANGUAGE_FONTS.ARABIC);
  }
  if (languages.includes("hebrew")) {
    fonts.push(LANGUAGE_FONTS.HEBREW);
  }
  if (languages.includes("chinese")) {
    fonts.push(LANGUAGE_FONTS.CHINESE);
  }
  if (languages.includes("japanese")) {
    fonts.push(LANGUAGE_FONTS.JAPANESE);
  }
  if (languages.includes("korean")) {
    fonts.push(LANGUAGE_FONTS.KOREAN);
  }
  if (languages.includes("indic")) {
    fonts.push(LANGUAGE_FONTS.DEVANAGARI);
  }

  // Add default fonts
  fonts.push(LANGUAGE_FONTS.DEFAULT);

  return fonts.join(", ");
}

/**
 * Wraps multilingual text with appropriate HTML attributes for proper rendering
 */
export function wrapMultilingualText(html: string): string {
  let processedHtml = html;

  // Handle RTL languages
  if (containsRTL(processedHtml)) {
    // Add lang and dir attributes to html tag
    processedHtml = processedHtml.replace(
      /<html(?![^>]*\bdir=)/i,
      '<html dir="auto"',
    );
    processedHtml = processedHtml.replace(
      /<html(?![^>]*\blang=)/i,
      '<html lang="auto"',
    );

    // Wrap RTL text segments
    processedHtml = processedHtml.replace(
      /([\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF][^<]*)/g,
      '<span dir="rtl" class="rtl-text">$1</span>',
    );
  }

  // Handle CJK languages
  if (containsCJK(processedHtml)) {
    processedHtml = processedHtml.replace(
      /([\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F][^<]*)/g,
      '<span class="cjk-text">$1</span>',
    );
  }

  // Handle Indic scripts
  if (containsIndic(processedHtml)) {
    processedHtml = processedHtml.replace(
      /([\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F][^<]*)/g,
      '<span class="indic-text">$1</span>',
    );
  }

  return processedHtml;
}

/**
 * Gets CSS styles for multilingual text rendering
 */
export function getMultilingualTextStyles(): string {
  return `
    /* RTL text support */
    .rtl-text, [dir="rtl"], [lang="ar"], [lang="he"], [lang="fa"], [lang="ur"] {
      direction: rtl;
      unicode-bidi: plaintext;
      text-align: right;
    }
    
    /* CJK text support */
    .cjk-text {
      font-feature-settings: "liga" 1, "kern" 1;
      line-height: 1.8;
    }
    
    /* Indic text support */
    .indic-text {
      font-feature-settings: "liga" 1, "kern" 1;
      line-height: 1.6;
    }
    
    /* Auto direction handling */
    [dir="auto"] {
      unicode-bidi: plaintext;
    }
    
    /* Mixed content handling */
    .mixed-content {
      unicode-bidi: plaintext;
    }
  `;
}

/**
 * Returns @font-face CSS for local Arabic fonts.
 * If base64 is true, embeds the font files directly to avoid any network fetches.
 * Silently falls back to empty string if files are missing.
 */
export function getLocalArabicFontFacesCss(
  options: { base64?: boolean } = {},
): string {
  const { base64 = false } = options;
  try {
    if (base64) {
      // Inline from public/fonts when available
      // Use sync reads to keep API simple and deterministic for serverless environments
      // Note: This is intentionally synchronous for serverless compatibility
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs") as {
        existsSync: (path: string) => boolean;
        readFileSync: (path: string) => Buffer;
      };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path") as {
        join: (...paths: string[]) => string;
      };

      const readBase64 = (name: string): string => {
        // Try multiple possible paths for Netlify/serverless compatibility
        const possiblePaths: string[] = [
          // Standard Next.js build output (local dev)
          path.join(process.cwd(), "public", "fonts", name),
          // Netlify serverless function context (fonts included via netlify.toml)
          path.join(process.cwd(), "..", "public", "fonts", name),
          // Alternative Netlify path
          path.join("/var/task", "public", "fonts", name),
        ];

        for (const p of possiblePaths) {
          try {
            if (fs.existsSync(p)) {
              const data = fs.readFileSync(p);
              return `url(data:font/ttf;base64,${data.toString("base64")}) format('truetype')`;
            }
          } catch {
            // Continue to next path
          }
        }
        // Return empty - will fall back to URL-based fonts or Google Fonts
        return "";
      };

      const naskh = readBase64("NotoNaskhArabic-Regular.ttf");
      const sans = readBase64("NotoSansArabic-Regular.ttf");
      const amiri = readBase64("Amiri-Regular.ttf");

      const blocks: string[] = [];
      if (naskh) {
        blocks.push(
          `@font-face{font-family:'Noto Naskh Arabic';src:${naskh};font-display:block;unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF;}`,
        );
      }
      if (sans) {
        blocks.push(
          `@font-face{font-family:'Noto Sans Arabic';src:${sans};font-display:block;unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF;}`,
        );
      }
      if (amiri) {
        blocks.push(
          `@font-face{font-family:'Amiri';src:${amiri};font-display:block;unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF;}`,
        );
      }
      return blocks.join("\n");
    }

    // URL-based fallback pointing to public/fonts (works on Netlify via CDN)
    // On Netlify, public/ files are served via CDN, so these URLs will work
    return `
      @font-face { font-family: 'Noto Naskh Arabic'; src: url('/fonts/NotoNaskhArabic-Regular.ttf') format('truetype'); font-display: block; unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }
      @font-face { font-family: 'Noto Sans Arabic'; src: url('/fonts/NotoSansArabic-Regular.ttf') format('truetype'); font-display: block; unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }
      @font-face { font-family: 'Amiri'; src: url('/fonts/Amiri-Regular.ttf') format('truetype'); font-display: block; unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF; }
    `;
  } catch {
    return "";
  }
}

/**
 * Gets the appropriate font family for Arabic text (legacy function for backward compatibility)
 */
export function getArabicFontFamily(): string {
  return LANGUAGE_FONTS.ARABIC;
}

/**
 * Gets comprehensive font imports for all supported languages
 * Uses display=block for critical Arabic fonts to ensure proper rendering before PDF generation
 */
export function getMultilingualFontImports(): string {
  return `
    /* Local font faces if available */
    @font-face { font-family: 'Noto Naskh Arabic'; src: url('/fonts/NotoNaskhArabic-Regular.ttf') format('truetype'); font-display: block; }
    @font-face { font-family: 'Noto Sans Arabic'; src: url('/fonts/NotoSansArabic-Regular.ttf') format('truetype'); font-display: block; }
    @font-face { font-family: 'Amiri'; src: url('/fonts/Amiri-Regular.ttf') format('truetype'); font-display: block; }
    
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=block');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=block');
    
    @font-face {
      font-family: 'Arabic Fallback';
      src: local('Arial Unicode MS'), local('Tahoma'), local('Lucida Grande');
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
    }
    
    @font-face {
      font-family: 'Hebrew Fallback';
      src: local('Arial Unicode MS'), local('Tahoma'), local('Lucida Grande');
      unicode-range: U+0590-05FF, U+FB1D-FB4F;
    }
    
    @font-face {
      font-family: 'CJK Fallback';
      src: local('Arial Unicode MS'), local('Tahoma'), local('Lucida Grande');
      unicode-range: U+4E00-9FFF, U+3400-4DBF, U+3040-309F, U+30A0-30FF, U+AC00-D7AF;
    }
    
    @font-face {
      font-family: 'Indic Fallback';
      src: local('Arial Unicode MS'), local('Tahoma'), local('Lucida Grande');
      unicode-range: U+0900-097F, U+0980-09FF, U+0A00-0A7F, U+0A80-0AFF, U+0B00-0B7F, U+0B80-0BFF, U+0C00-0C7F, U+0C80-0CFF, U+0D00-0D7F;
    }
  `;
}
