import { env } from "~/env";
import {
  getModelsForTier,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

export interface GenerateHtmlOptions {
  prompt: string;
  model?: string;
  brandName?: string;
  tier?: SubscriptionTier; // Add tier to determine which models to use
}

// Hardcoded prioritized list: first is primary, followed by 12 backups.
const DEFAULT_MODELS: string[] = [
  "openrouter/sonoma-dusk-alpha",
  "openrouter/sonoma-sky-alpha",
  "x-ai/grok-4-fast:free",
  "deepseek/deepseek-chat-v3.1:free",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "z-ai/glm-4.5-air:free",
  "qwen/qwen3-coder:free",
  "moonshotai/kimi-k2:free",
  "moonshotai/kimi-dev-72b:free",
  "deepseek/deepseek-r1-0528:free",
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "deepseek/deepseek-r1:free",
];
const OPENROUTER_BASE =
  env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

function extractHtmlFromContent(content: string): string {
  // If content contains a fenced html block, extract it
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

  if (hasHtmlTag) {
    // If already has HTML tag, inject watermark before closing body tag
    if (addWatermark) {
      return bodyOrDoc.replace(/<\/body>/i, `${watermarkHtml}</body>`);
    }
    return bodyOrDoc;
  }

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        :root { --text:#0f172a; --muted:#475569; --accent:#0ea5e9; }
        * { box-sizing: border-box; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; margin: 0; padding: 40px; color: var(--text); }
        h1, h2, h3 { margin: 0 0 12px; }
        h1 { font-size: 28px; }
        h2 { font-size: 20px; }
        p { margin: 0 0 10px; line-height: 1.6; color: var(--muted); }
        .container { max-width: 800px; margin: 0 auto; }
        .badge { display:inline-block; background: #e0f2fe; color:#0369a1; padding:6px 10px; border-radius:8px; font-size:12px; }
        .section { margin: 24px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
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
  tier = "starter", // Default to starter tier
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

  // Build headers defensively: only ASCII in header values
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (env.NEXT_PUBLIC_APP_URL) {
    headers["HTTP-Referer"] = String(env.NEXT_PUBLIC_APP_URL);
  }
  if (brandName) {
    const asciiOnly = brandName.replace(/[^\x00-\x7F]/g, "-");
    // Only set if after normalization it is non-empty
    if (asciiOnly.trim().length > 0) headers["X-Title"] = asciiOnly;
  }

  // Build the prioritized model list based on tier
  // If model is explicitly provided, use that; otherwise use tier-based models
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
      // try next model
      continue;
    }

    const text = await res.text().catch(() => "");
    attemptErrors.push(
      `Model ${currentModel} -> ${res.status}: ${text?.slice(0, 500)}`,
    );
    // Try next model in list
  }

  // Exhausted all models
  throw new Error(
    `OpenRouter failed after trying models in order: ${models.join(", ")}.\n` +
      attemptErrors.join("\n---\n"),
  );
}
