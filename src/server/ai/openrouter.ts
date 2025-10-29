import { env } from "~/env";
import {
  detectLanguages,
  wrapMultilingualText,
  getMultilingualTextStyles,
  getMultilingualFontImports,
  getMultilingualFontFamily as _getMultilingualFontFamily,
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
  const fence = /```html\s*([\s\S]*?)```/i.exec(content);
  if (fence?.[1]) return fence[1].trim();
  const genericFence = /```\s*([\s\S]*?)```/.exec(content);
  if (genericFence?.[1]) return genericFence[1].trim();
  return content.trim();
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

  const multilingualCss = `
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
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; 
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

    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(
        /<\/head>/i,
        `<style>${multilingualCss}</style></head>`,
      );
    } else if (/<body[^>]*>/i.test(doc)) {
      doc = doc.replace(
        /<body[^>]*>/i,
        (m) => `${m}<style>${multilingualCss}</style>`,
      );
    } else {
      doc = `<style>${multilingualCss}</style>` + doc;
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
      <title>${title}</title>
      <style>
${multilingualCss}
      </style>
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
- Use semantic structure with headings, sections, and tables when appropriate.
- Inline minimal CSS suitable for printing on A4, and ensure good typography, spacing, and readability.
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
        return extractHtmlFromContent(content);
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
