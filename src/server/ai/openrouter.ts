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
  getModelsForTierAsync,
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

/**
 * Collects all available OpenRouter API keys from environment variables.
 * Returns an array of keys in order: OPENROUTER_API_KEY, OPENROUTER_API_KEY1-10.
 * This provides redundancy and load distribution across multiple keys.
 */
function getAvailableApiKeys(): string[] {
  const keys: string[] = [];

  // Collect all defined keys
  if (env.OPENROUTER_API_KEY) keys.push(env.OPENROUTER_API_KEY);
  if (env.OPENROUTER_API_KEY1) keys.push(env.OPENROUTER_API_KEY1);
  if (env.OPENROUTER_API_KEY2) keys.push(env.OPENROUTER_API_KEY2);
  if (env.OPENROUTER_API_KEY3) keys.push(env.OPENROUTER_API_KEY3);
  if (env.OPENROUTER_API_KEY4) keys.push(env.OPENROUTER_API_KEY4);
  if (env.OPENROUTER_API_KEY5) keys.push(env.OPENROUTER_API_KEY5);
  if (env.OPENROUTER_API_KEY6) keys.push(env.OPENROUTER_API_KEY6);
  if (env.OPENROUTER_API_KEY7) keys.push(env.OPENROUTER_API_KEY7);
  if (env.OPENROUTER_API_KEY8) keys.push(env.OPENROUTER_API_KEY8);
  if (env.OPENROUTER_API_KEY9) keys.push(env.OPENROUTER_API_KEY9);
  if (env.OPENROUTER_API_KEY10) keys.push(env.OPENROUTER_API_KEY10);

  return keys;
}

/**
 * Check if any OpenRouter API key is configured.
 * This is used to determine if AI generation is available.
 */
export function hasOpenRouterKey(): boolean {
  return getAvailableApiKeys().length > 0;
}

// Key state management for rate limiting and cooldown
interface KeyState {
  requestCount: number;
  lastResetTime: number;
  consecutiveBadRequests: number;
  cooldownUntil: number | null;
}

const keyStates = new Map<number, KeyState>();
const DAILY_REQUEST_LIMIT = 50;
const COOLDOWN_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const BAD_REQUEST_THRESHOLD = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

// Track current key index for sequential distribution
let currentKeyIndex = 0;

/**
 * Initialize or get key state
 */
function getKeyState(keyIndex: number): KeyState {
  if (!keyStates.has(keyIndex)) {
    keyStates.set(keyIndex, {
      requestCount: 0,
      lastResetTime: Date.now(),
      consecutiveBadRequests: 0,
      cooldownUntil: null,
    });
  }
  return keyStates.get(keyIndex)!;
}

/**
 * Reset daily request count if 24 hours have passed
 */
function resetDailyCountIfNeeded(state: KeyState): void {
  const now = Date.now();
  if (now - state.lastResetTime >= DAY_MS) {
    state.requestCount = 0;
    state.lastResetTime = now;
  }
}

/**
 * Check if a key is available (not in cooldown and under rate limit)
 */
function isKeyAvailable(keyIndex: number): boolean {
  const state = getKeyState(keyIndex);
  const now = Date.now();

  // Check cooldown
  if (state.cooldownUntil && now < state.cooldownUntil) {
    return false;
  }

  // Clear cooldown if expired
  if (state.cooldownUntil && now >= state.cooldownUntil) {
    state.cooldownUntil = null;
    state.consecutiveBadRequests = 0;
  }

  // Reset daily count if needed
  resetDailyCountIfNeeded(state);

  // Check rate limit
  return state.requestCount < DAILY_REQUEST_LIMIT;
}

/**
 * Record a successful request
 */
function recordSuccessfulRequest(keyIndex: number): void {
  const state = getKeyState(keyIndex);
  resetDailyCountIfNeeded(state);
  state.requestCount++;
  state.consecutiveBadRequests = 0;

  console.log(
    `[openrouter] Key #${keyIndex}: ${state.requestCount}/${DAILY_REQUEST_LIMIT} requests used today`,
  );
}

/**
 * Record a bad request (400 status)
 */
function recordBadRequest(keyIndex: number): void {
  const state = getKeyState(keyIndex);
  resetDailyCountIfNeeded(state);
  state.requestCount++;
  state.consecutiveBadRequests++;

  console.warn(
    `[openrouter] Key #${keyIndex}: Bad request ${state.consecutiveBadRequests}/${BAD_REQUEST_THRESHOLD} (${state.requestCount}/${DAILY_REQUEST_LIMIT} requests used today)`,
  );

  // Apply cooldown if threshold reached
  if (state.consecutiveBadRequests >= BAD_REQUEST_THRESHOLD) {
    state.cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    console.warn(
      `[openrouter] Key #${keyIndex}: Entering 60-minute cooldown after ${BAD_REQUEST_THRESHOLD} consecutive bad requests`,
    );
  }
}

/**
 * Record other types of requests (rate limits, auth errors, etc.)
 */
function recordOtherRequest(keyIndex: number): void {
  const state = getKeyState(keyIndex);
  resetDailyCountIfNeeded(state);
  state.requestCount++;
  // Don't increment consecutive bad requests for non-400 errors

  console.log(
    `[openrouter] Key #${keyIndex}: ${state.requestCount}/${DAILY_REQUEST_LIMIT} requests used today`,
  );
}

/**
 * Gets the next available API key using sequential distribution.
 * Respects rate limits and cooldowns.
 */
function getNextApiKey(keys: string[]): { key: string; index: number } | null {
  if (keys.length === 0) {
    throw new Error("No OpenRouter API keys configured");
  }

  // Try to find an available key starting from current index
  const startIndex = currentKeyIndex;
  let attempts = 0;

  while (attempts < keys.length) {
    const index = currentKeyIndex % keys.length;
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    attempts++;

    if (isKeyAvailable(index)) {
      return { key: keys[index]!, index };
    }

    const state = getKeyState(index);
    if (state.cooldownUntil && Date.now() < state.cooldownUntil) {
      const remainingMinutes = Math.ceil(
        (state.cooldownUntil - Date.now()) / (60 * 1000),
      );
      console.log(
        `[openrouter] Key #${index}: In cooldown for ${remainingMinutes} more minutes`,
      );
    } else if (state.requestCount >= DAILY_REQUEST_LIMIT) {
      console.log(
        `[openrouter] Key #${index}: Daily limit reached (${state.requestCount}/${DAILY_REQUEST_LIMIT})`,
      );
    }
  }

  // No available keys
  return null;
}

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
        Generated with <strong style="color: #0ea5e9;">KamkmPDF</strong> • <a href="${env.NEXT_PUBLIC_APP_URL ?? "https://KamkmPDF.com"}/pricing" style="color: #0ea5e9; text-decoration: none;">Upgrade to remove</a>
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
  const apiKeys = getAvailableApiKeys();
  if (apiKeys.length === 0) {
    throw new Error("No OpenRouter API keys configured");
  }

  const system = `You are an expert document designer. Given a user's prompt, produce a clean, professional, print-ready HTML document. 
- Output only HTML (no Markdown), preferably a full <html> document or just a body that can be wrapped. 
- **CRITICAL: Preserve ALL text from the user's prompt exactly as written, including any Arabic, Hebrew, Chinese, Japanese, Korean, or other multilingual characters. Do NOT translate, transliterate, or omit any text.**
- Use semantic structure with headings, sections, and tables when appropriate.
- For multilingual text (especially RTL languages like Arabic and Hebrew), use appropriate HTML attributes like dir="rtl" or dir="auto" on elements containing that text.
- Inline minimal CSS suitable for printing on A4, and ensure good typography, spacing, and readability.
- Use font-family declarations that include multilingual font stacks for proper rendering of non-Latin scripts.
- Avoid external resources; embed all styling inline.`;

  const models: string[] = model
    ? model
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : await getModelsForTierAsync(tier);

  const attemptErrors: string[] = [];

  // Try each model with key rotation
  for (const currentModel of models) {
    // For each model, try all available keys before giving up
    const triedKeys = new Set<number>();

    for (let keyAttempt = 0; keyAttempt < apiKeys.length; keyAttempt++) {
      const keyResult = getNextApiKey(apiKeys);

      // No available keys
      if (!keyResult) {
        console.error(
          `[openrouter] No available API keys for model ${currentModel} (all keys are rate-limited or in cooldown)`,
        );
        attemptErrors.push(
          `Model ${currentModel} -> No available API keys (rate limits or cooldowns)`,
        );
        break;
      }

      const { key: apiKey, index: keyIndex } = keyResult;

      // Skip if we've already tried this key for this model
      if (triedKeys.has(keyIndex)) {
        continue;
      }
      triedKeys.add(keyIndex);

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

      try {
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

            // Record successful request
            recordSuccessfulRequest(keyIndex);

            // Log successful generation with key info
            console.log(
              `[openrouter] Success with model ${currentModel} using key #${keyIndex}`,
            );

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
                  keyIndex,
                  promptLength: prompt.length,
                  htmlLength: extractedHtml.length,
                  promptPreview: prompt.substring(0, 100),
                },
              );
            }

            return extractedHtml;
          }
          attemptErrors.push(
            `Model ${currentModel} (key #${keyIndex}) -> ok but empty content`,
          );
          // Don't try other keys for empty content - it's a model issue, not key issue
          break;
        }

        // Check if error is key-related (rate limit, auth error) or model-related
        const text = await res.text().catch(() => "");
        const errorDetails = text?.slice(0, 500) ?? "No error details";
        const isBadRequest = res.status === 400;
        const isKeyError =
          res.status === 401 || res.status === 429 || res.status === 403;

        // Record the request based on error type
        if (isBadRequest) {
          recordBadRequest(keyIndex);
        } else {
          recordOtherRequest(keyIndex);
        }

        console.error(
          `[openrouter] Model ${currentModel} failed with key #${keyIndex}:`,
          {
            status: res.status,
            statusText: res.statusText,
            error: errorDetails,
            promptLength: prompt.length,
            tier,
            isKeyError,
            isBadRequest,
            willRetryWithAnotherKey:
              (isKeyError || isBadRequest) && keyAttempt < apiKeys.length - 1,
          },
        );

        attemptErrors.push(
          `Model ${currentModel} (key #${keyIndex}) -> ${res.status}: ${errorDetails}`,
        );

        // If it's a key-related error or bad request and we have more keys, try the next one
        if ((isKeyError || isBadRequest) && keyAttempt < apiKeys.length - 1) {
          console.log(
            `[openrouter] Retrying model ${currentModel} with different key...`,
          );
          continue;
        }

        // If it's not a key error or we've tried all keys, move to next model
        break;
      } catch (fetchError) {
        const errorMsg =
          fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error(
          `[openrouter] Network error with model ${currentModel} and key #${keyIndex}:`,
          errorMsg,
        );
        attemptErrors.push(
          `Model ${currentModel} (key #${keyIndex}) -> Network error: ${errorMsg}`,
        );

        // Try next key on network errors
        if (keyAttempt < apiKeys.length - 1) {
          console.log(
            `[openrouter] Retrying model ${currentModel} with different key after network error...`,
          );
          continue;
        }
        break;
      }
    }
  }

  const finalError = new Error(
    `OpenRouter failed after trying models in order: ${models.join(", ")} with ${apiKeys.length} API key(s).\n` +
      attemptErrors.join("\n---\n"),
  );
  console.error("[openrouter] All models and keys exhausted:", {
    models,
    numKeys: apiKeys.length,
    errors: attemptErrors,
    promptLength: prompt.length,
    tier,
  });
  throw finalError;
}
