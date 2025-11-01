import { env } from "~/env";
import {
  detectLanguages,
  wrapMultilingualText,
  getMultilingualTextStyles,
  getMultilingualFontImports,
  getMultilingualFontFamily as _getMultilingualFontFamily,
  getLocalArabicFontFacesCss,
} from "~/server/utils/multilingualText";
import {
  getModelsForTier,
  type SubscriptionTier,
} from "~/server/subscription/tiers";
import {
  getCachedHtml,
  setCachedHtml,
  deduplicateRequest,
  generatePromptCacheKey,
  incrementCacheHit,
  incrementCacheMiss,
} from "~/lib/cache";

export interface GenerateHtmlOptions {
  prompt: string;
  model?: string;
  brandName?: string;
  tier?: SubscriptionTier;
}

const OPENROUTER_BASE =
  env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

function extractHtmlFromContent(content: string): string {
  // Normalize input: trim BOM/zero-width and normalize newlines
  const normalized = content
    .replace(/^\uFEFF/, "") // BOM
    .replace(/[\u200B\u200C\u200D\u2060]/g, "") // zero-width variants
    .replace(/\r\n|\r/g, "\n")
    .trim();

  // Try to find a fenced code block with (optional) language label
  // Supports ```html, ``` HTML, ```Html, or generic ```
  const fenceRegex = /```\s*([a-zA-Z]*)\s*\n([\s\S]*?)```/m;
  const match = fenceRegex.exec(normalized);
  if (match) {
    // Language tag extracted but not currently used (reserved for future filtering)
    const _lang = (match[1] ?? "").toLowerCase();
    let block = match[2] ?? "";
    // Some models prepend a language label line inside the block
    const lines = block.split("\n");
    const firstLine = lines[0];
    if (lines.length > 0 && firstLine && /^\s*html\s*$/i.test(firstLine)) {
      lines.shift();
      block = lines.join("\n");
    }
    // Prefer html blocks, otherwise fall back to first fenced content
    return block.trim();
  }

  // Handle single-backtick style or triple-backtick without language
  const genericFence = /```\s*\n?([\s\S]*?)```/m.exec(normalized);
  if (genericFence?.[1]) {
    let block = genericFence[1];
    const lines = block.split("\n");
    const firstLine = lines[0];
    if (lines.length > 0 && firstLine && /^\s*html\s*$/i.test(firstLine)) {
      lines.shift();
      block = lines.join("\n");
    }
    return block.trim();
  }

  // If the first non-empty line is just "HTML", drop it
  {
    const lines = normalized.split("\n");
    const firstLine = lines[0];
    if (lines.length > 0 && firstLine && /^\s*html\s*$/i.test(firstLine)) {
      return lines.slice(1).join("\n").trim();
    }
  }

  return normalized;
}

export function wrapHtmlDocument(
  bodyOrDoc: string,
  title = "Generated Document",
  addWatermark = false,
): string {
  const hasHtmlTag = /<html[\s\S]*?>[\s\S]*<\/html>/i.test(bodyOrDoc);

  const watermarkHtml = addWatermark
    ? `<div style="position: fixed; bottom: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #64748b; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        Generated with <strong style="color: #0ea5e9;">KamkmPDF</strong> • <a href="${env.NEXT_PUBLIC_APP_URL ?? "https://kamkmpdf.com"}/pricing" style="color: #0ea5e9; text-decoration: none;">Upgrade to remove</a>
      </div>`
    : "";

  // Import Arabic-capable fonts from Google Fonts for reliable rendering in Puppeteer
  // Comprehensive multilingual font imports
  const multilingualFontImports = getMultilingualFontImports();
  const localArabicFontsBase64 = getLocalArabicFontFacesCss({ base64: true });

  // Font loading script to ensure fonts are ready before PDF generation
  const fontLoadingScript = `
    <script>
      (function() {
        // Mark fonts as ready when document.fonts.ready resolves
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function() {
            window.__fontsReady = true;
          }).catch(function() {
            window.__fontsReady = true; // Set anyway after timeout
          });
        } else {
          window.__fontsReady = true; // No font API, assume ready
        }
      })();
    </script>
  `;

  const multilingualCss = `
        ${localArabicFontsBase64}
        ${multilingualFontImports}
        :root { 
          --text: #0f172a; 
          --muted: #475569; 
          --accent: #0ea5e9;
        }
        * { box-sizing: border-box; }
        html { 
          direction: auto; 
          font-feature-settings: "liga" 1, "kern" 1;
          text-rendering: optimizeLegibility;
        }
        body { 
          font-family: ${_getMultilingualFontFamily(bodyOrDoc)}; 
          margin: 0; 
          padding: 40px; 
          color: var(--text);
          font-feature-settings: "liga" 1, "kern" 1;
          text-rendering: optimizeLegibility;
        }
        ${getMultilingualTextStyles()}
        h1, h2, h3 { 
          margin: 0 0 12px; 
          font-feature-settings: "liga" 1, "kern" 1;
        }
        h1 { font-size: 28px; }
        h2 { font-size: 20px; }
        p { 
          margin: 0 0 10px; 
          line-height: 1.6; 
          color: var(--muted);
          font-feature-settings: "liga" 1, "kern" 1;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .badge { 
          display: inline-block; 
          background: #e0f2fe; 
          color: #0369a1; 
          padding: 6px 10px; 
          border-radius: 8px; 
          font-size: 12px; 
        }
        .section { margin: 24px 0; }
        table { 
          border-collapse: collapse; 
          width: 100%; 
        }
        th, td { 
          border: 1px solid #e2e8f0; 
          padding: 8px; 
          text-align: left; 
        }
        /* Print-specific styles for better PDF rendering */
        @media print {
          body { 
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
  `;

  if (hasHtmlTag) {
    let doc = bodyOrDoc;

    // Enhanced multilingual text handling
    const detectedLanguages = detectLanguages(doc);
    if (detectedLanguages.length > 0) {
      doc = wrapMultilingualText(doc);
    }

    doc = doc.replace(/<html(?![^>]*\bdir=)/i, '<html dir="auto"');

    // Add preconnect links for faster font loading
    const preconnectLinks = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    `;

    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(
        /<\/head>/i,
        `${preconnectLinks}<style>${multilingualCss}</style>${fontLoadingScript}</head>`,
      );
    } else if (/<head[^>]*>/i.test(doc)) {
      doc = doc.replace(
        /<head[^>]*>/i,
        (m) =>
          `${m}${preconnectLinks}<style>${multilingualCss}</style>${fontLoadingScript}`,
      );
    } else if (/<body[^>]*>/i.test(doc)) {
      doc = doc.replace(
        /<body[^>]*>/i,
        (m) =>
          `${preconnectLinks}<style>${multilingualCss}</style>${fontLoadingScript}${m}`,
      );
    } else {
      doc =
        `${preconnectLinks}<style>${multilingualCss}</style>${fontLoadingScript}` +
        doc;
    }

    if (addWatermark) {
      doc = doc.replace(/<\/body>/i, `${watermarkHtml}</body>`);
    }
    return doc;
  }

  return `<!doctype html>
  <html lang="en" dir="auto">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <title>${title}</title>
      <style>
${multilingualCss}
      </style>
      ${fontLoadingScript}
    </head>
    <body>
      <div class="container">${bodyOrDoc}</div>
      ${watermarkHtml}
    </body>
  </html>`;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateHtmlFromPrompt({
  prompt,
  model,
  brandName,
  tier = "starter",
}: GenerateHtmlOptions): Promise<string> {
  // Check cache first
  const cachedHtml = await getCachedHtml(prompt, tier);
  if (cachedHtml) {
    incrementCacheHit();
    return cachedHtml;
  }

  incrementCacheMiss();

  // Use deduplication to prevent duplicate in-flight requests
  const cacheKey = generatePromptCacheKey(prompt, tier);
  return deduplicateRequest(cacheKey, async () => {
    const html = await generateHtmlFromOpenRouter({
      prompt,
      model,
      brandName,
      tier,
    });

    // Cache the result for future use
    await setCachedHtml(prompt, tier, html, 7); // Cache for 7 days

    return html;
  });
}

async function generateHtmlFromOpenRouter({
  prompt,
  model,
  brandName,
  tier = "starter",
}: GenerateHtmlOptions): Promise<string> {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const system = `You are an expert document designer. Given a user's prompt, produce a clean, professional, print-ready HTML document. 
- Output only HTML (no Markdown), preferably a full <html> document or just a body that can be wrapped. 
- **CRITICAL: Preserve ALL text from the user's prompt exactly as written, including any Arabic, Hebrew, Chinese, Japanese, Korean, or other multilingual characters. Do NOT translate, transliterate, or omit any text.**
- Use semantic structure with headings, sections, and tables when appropriate.
- For multilingual text (especially RTL languages like Arabic and Hebrew), use appropriate HTML attributes like dir="rtl" or dir="auto" on elements containing that text.
- Inline minimal CSS suitable for printing on A4, and ensure good typography, spacing, and readability.
- Use font-family declarations that include multilingual font stacks for proper rendering of non-Latin scripts.
- Avoid external resources; embed all styling inline.`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (env.NEXT_PUBLIC_APP_URL) {
    headers["HTTP-Referer"] = String(env.NEXT_PUBLIC_APP_URL);
  }
  if (brandName) {
    const asciiOnly = brandName.replace(/[^\x00-\x7F]/g, "-");
    if (asciiOnly.trim().length > 0) headers["X-Title"] = asciiOnly;
  }

  const models: string[] = model
    ? model
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : getModelsForTier(tier);

  const attemptErrors: string[] = [];
  for (const currentModel of models) {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: currentModel,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as OpenRouterResponse;
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      if (content && content.trim().length > 0) {
        const extractedHtml = extractHtmlFromContent(content);

        // Log if Arabic text is missing from generated HTML
        const promptHasArabic =
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
            prompt,
          );
        const htmlHasArabic =
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
            extractedHtml,
          );

        if (promptHasArabic && !htmlHasArabic) {
          console.warn(
            `[openrouter] Arabic text detected in prompt but missing from generated HTML`,
            {
              model: currentModel,
              promptLength: prompt.length,
              htmlLength: extractedHtml.length,
              promptPreview: prompt.substring(0, 100),
            },
          );
        }

        return extractedHtml;
      }
      attemptErrors.push(`Model ${currentModel} -> ok but empty content`);
      continue;
    }

    const text = await res.text().catch(() => "");
    const errorDetails = text?.slice(0, 500) ?? "No error details";
    console.error(`[openrouter] Model ${currentModel} failed:`, {
      status: res.status,
      statusText: res.statusText,
      error: errorDetails,
      promptLength: prompt.length,
      tier,
    });
    attemptErrors.push(
      `Model ${currentModel} -> ${res.status}: ${errorDetails}`,
    );
    continue;
  }

  const finalError = new Error(
    `OpenRouter failed after trying models in order: ${models.join(", ")}.\n` +
      attemptErrors.join("\n---\n"),
  );
  console.error("[openrouter] All models failed:", {
    models,
    errors: attemptErrors,
    promptLength: prompt.length,
    tier,
    hasApiKey: !!apiKey,
  });
  throw finalError;
}
