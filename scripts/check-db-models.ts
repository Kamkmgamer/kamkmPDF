import { db } from "../src/server/db/index.js";
import { aiModels } from "../src/server/db/schema.js";
import { eq } from "drizzle-orm";

async function checkModels() {
  try {
    const models = await db
      .select({
        modelId: aiModels.modelId,
        sortOrder: aiModels.sortOrder,
        isActive: aiModels.isActive,
      })
      .from(aiModels)
      .orderBy(aiModels.sortOrder);

    console.log("All models in database:");
    models.forEach((model, index) => {
      console.log(
        `${index + 1}. ${model.modelId} (sortOrder: ${model.sortOrder}, active: ${model.isActive})`,
      );
    });

    const activeModels = models.filter((m) => m.isActive);
    console.log("\nActive models:");
    activeModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.modelId}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkModels();
