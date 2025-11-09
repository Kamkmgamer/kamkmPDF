import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { aiModels } from "../src/server/db/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const conn = postgres(DATABASE_URL);
const db = drizzle(conn, { schema: { aiModels } });

async function deactivateModel() {
  console.log("🗑️ Deactivating Alibaba model...");

  await db
    .update(aiModels)
    .set({ isActive: false })
    .where(eq(aiModels.modelId, "alibaba/tongyi-deepresearch-30b-a3b:free"));

  console.log("✅ Alibaba model deactivated!");
}

deactivateModel()
  .then(async () => {
    await conn.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Error:", error);
    await conn.end();
    process.exit(1);
  });
