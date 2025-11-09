import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { aiModels } from "../src/server/db/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const conn = postgres(DATABASE_URL);
const db = drizzle(conn, { schema: { aiModels } });

// Parse model IDs to extract provider and create human-readable names
function parseModelInfo(modelId: string) {
  const parts = modelId.split("/");
  const provider = parts[0] ?? "unknown";
  const modelName = parts[1]?.replace(":free", "") ?? modelId;

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

async function addMissingModels() {
  console.log("🔍 Checking for missing models...");

  const missingModels = [
    { id: "model_1", modelId: "openrouter/polaris-alpha", sortOrder: 0 },
    { id: "model_2", modelId: "minimax/minimax-m2:free", sortOrder: 1 },
  ];

  for (const model of missingModels) {
    const modelInfo = parseModelInfo(model.modelId);

    await db
      .insert(aiModels)
      .values({
        id: model.id,
        modelId: modelInfo.modelId,
        name: modelInfo.name,
        description: modelInfo.description,
        provider: modelInfo.provider,
        isActive: true,
        isAgentModel: true,
        sortOrder: model.sortOrder,
      })
      .onConflictDoNothing();

    console.log(
      `✓ Ensured model exists: ${modelInfo.name} (${modelInfo.modelId})`,
    );
  }

  console.log("✅ Missing models added!");
}

addMissingModels()
  .then(async () => {
    await conn.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Error:", error);
    await conn.end();
    process.exit(1);
  });
