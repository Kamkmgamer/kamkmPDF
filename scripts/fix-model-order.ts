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

// New model order
const NEW_MODELS_ORDER = [
  "openrouter/polaris-alpha",
  "minimax/minimax-m2:free",
  "qwen/qwen3-235b-a22b:free",
  "meta-llama/llama-4-maverick:free",
  "meta-llama/llama-4-scout:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free",
  "openai/gpt-oss-120b",
];

async function fixModelOrder() {
  console.log("🔧 Fixing AI model order...");

  try {
    // First, deactivate broken models
    const brokenModels = [
      "openai/gpt-oss-120b:free",
      "openai/gpt-oss-safeguard-120b",
    ];

    for (const modelId of brokenModels) {
      await db
        .update(aiModels)
        .set({ isActive: false })
        .where(eq(aiModels.modelId, modelId));
      console.log(`❌ Deactivated broken model: ${modelId}`);
    }

    // Update sortOrder for all models in the new order
    for (let i = 0; i < NEW_MODELS_ORDER.length; i++) {
      const modelId = NEW_MODELS_ORDER[i];

      await db
        .update(aiModels)
        .set({
          sortOrder: i,
          isActive: true,
        })
        .where(eq(aiModels.modelId, modelId));

      console.log(`📝 Updated sortOrder for ${modelId} to ${i}`);
    }

    console.log("\n✅ Model order fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing model order:", error);
    throw error;
  }
}

// Run the fix function
fixModelOrder()
  .then(async () => {
    console.log("\n🎉 Done!");
    await conn.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\n💥 Failed to fix model order:", error);
    await conn.end();
    process.exit(1);
  });
