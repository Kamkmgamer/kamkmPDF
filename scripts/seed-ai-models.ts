/**
 * Seed script to populate AI models table with default agent models
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:password@localhost:5432/pdfprompt" pnpm tsx scripts/seed-ai-models.ts
 *
 * This script:
 * - Creates entries in the ai_models table for all default agent models
 * - Sets them as active and properly ordered
 * - Skips models that already exist (safe to run multiple times)
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { aiModels } from "../src/server/db/schema.js";
import { eq } from "drizzle-orm";

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

// Create direct database connection
const conn = postgres(DATABASE_URL);
const db = drizzle(conn, { schema: { aiModels } });

// Default models list
const DEFAULT_MODELS_AGENTS: string[] = [
  "openrouter/polaris-alpha",
  "minimax/minimax-m2:free",
  "qwen/qwen3-235b-a22b:free",
  "meta-llama/llama-4-maverick:free",
  "meta-llama/llama-4-scout:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "openai/gpt-oss-120b",
];

interface ModelInfo {
  modelId: string;
  name: string;
  provider: string;
  description: string;
}

// Parse model IDs to extract provider and create human-readable names
function parseModelInfo(modelId: string): ModelInfo {
  const parts = modelId.split("/");
  const provider = parts[0] ?? "unknown";
  const modelName = parts[1]?.replace(":free", "") ?? modelId;

  // Generate human-readable name
  const name = modelName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    modelId,
    name,
    provider,
    description: `${name} by ${provider}`,
  };
}

async function seedAiModels() {
  console.log("🌱 Seeding AI models...");

  try {
    // First, deactivate broken models
    const brokenModels = [
      "openai/gpt-oss-120b:free",
      "openai/gpt-oss-safeguard-120b",
      "alibaba/tongyi-deepresearch-30b-a3b:free",
    ];

    for (const modelId of brokenModels) {
      await db
        .update(aiModels)
        .set({ isActive: false })
        .where(eq(aiModels.modelId, modelId));
      console.log(`❌ Deactivated broken model: ${modelId}`);
    }
    // Insert all default models
    for (let i = 0; i < DEFAULT_MODELS_AGENTS.length; i++) {
      const modelId = DEFAULT_MODELS_AGENTS[i];
      if (!modelId) continue;

      const modelInfo = parseModelInfo(modelId);

      await db
        .insert(aiModels)
        .values({
          id: `model_${i + 1}`,
          modelId: modelInfo.modelId,
          name: modelInfo.name,
          description: modelInfo.description,
          provider: modelInfo.provider,
          isActive: true,
          isAgentModel: true,
          sortOrder: i,
        })
        .onConflictDoNothing(); // Skip if already exists

      console.log(`✓ Added model: ${modelInfo.name} (${modelInfo.modelId})`);
    }

    console.log("\n✅ AI models seeded successfully!");
    console.log(`Total models: ${DEFAULT_MODELS_AGENTS.length}`);
  } catch (error) {
    console.error("❌ Error seeding AI models:", error);
    throw error;
  }
}

// Run the seed function
seedAiModels()
  .then(async () => {
    console.log("\n🎉 Done!");
    await conn.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\n💥 Failed to seed AI models:", error);
    await conn.end();
    process.exit(1);
  });
