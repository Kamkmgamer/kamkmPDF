# AI Models Database Migration

## Overview

The `modelsAgents` array has been migrated from a hardcoded array to a database-backed solution. This allows for dynamic management of AI models without code changes.

## Changes Made

### 1. Database Schema (`src/server/db/schema.ts`)

- Added new `aiModels` table with the following fields:
  - `id`: Primary key
  - `modelId`: Unique model identifier (e.g., "openai/gpt-oss-120b:free")
  - `name`: Human-readable name
  - `description`: Model description
  - `provider`: Provider name (e.g., "openai", "meta-llama")
  - `isActive`: Whether the model is currently available
  - `isAgentModel`: Whether this is an agent model
  - `sortOrder`: Display order
  - `createdAt`, `updatedAt`: Timestamps
- Added indexes for performance on `modelId`, `isActive`, and `isAgentModel`

### 2. Migration (`drizzle/0006_tidy_richard_fisk.sql`)

- Created the `pdfprompt_ai_model` table in the database
- Applied via `pnpm drizzle-kit push`

### 3. Tier Configuration (`src/server/subscription/tiers.ts`)

- Renamed `modelsAgents` to `DEFAULT_MODELS_AGENTS` (used as fallback)
- Added async function `getModelsAgents()` to fetch active models from database
- Added async function `getModelsForTierAsync()` to get models for a tier from database
- Updated all `TIER_CONFIGS` to use `DEFAULT_MODELS_AGENTS`

### 4. OpenRouter Integration (`src/server/ai/openrouter.ts`)

- Updated to use `getModelsForTierAsync()` instead of `getModelsForTier()`
- Now fetches models dynamically from the database

### 5. Seed Script (`scripts/seed-ai-models.ts`)

- Created script to populate the database with default models
- Safe to run multiple times (uses `onConflictDoNothing`)

## Migration Steps

### 1. Apply Database Migration

The migration has already been applied via:

```bash
pnpm drizzle-kit push
```

### 2. Seed the Database

Run the seed script to populate the AI models table:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/pdfprompt" pnpm tsx scripts/seed-ai-models.ts
```

Replace the DATABASE_URL with your actual database connection string.

### 3. Verify

You can verify the models were added by querying the database:

```sql
SELECT * FROM pdfprompt_ai_model ORDER BY "sortOrder";
```

## Managing AI Models

### Add a New Model

```typescript
import { db } from "~/server/db";
import { aiModels } from "~/server/db/schema";

await db.insert(aiModels).values({
  id: "model_10",
  modelId: "provider/model-name:free",
  name: "Model Name",
  description: "Description of the model",
  provider: "provider",
  isActive: true,
  isAgentModel: true,
  sortOrder: 10,
});
```

### Disable a Model

```typescript
import { db } from "~/server/db";
import { aiModels } from "~/server/db/schema";
import { eq } from "drizzle-orm";

await db
  .update(aiModels)
  .set({ isActive: false })
  .where(eq(aiModels.modelId, "provider/model-name:free"));
```

### Reorder Models

```typescript
import { db } from "~/server/db";
import { aiModels } from "~/server/db/schema";
import { eq } from "drizzle-orm";

await db
  .update(aiModels)
  .set({ sortOrder: 1 })
  .where(eq(aiModels.modelId, "provider/model-name:free"));
```

## Benefits

1. **Dynamic Management**: Add/remove/reorder models without code changes
2. **Easy A/B Testing**: Enable/disable models on the fly
3. **Better Monitoring**: Track which models are being used
4. **Flexibility**: Different models for different tiers (future enhancement)
5. **Fallback Safety**: Falls back to `DEFAULT_MODELS_AGENTS` if database query fails

## Backward Compatibility

- The `getModelsForTier()` function still exists and uses `DEFAULT_MODELS_AGENTS`
- All tier configurations have default models as fallback
- System gracefully handles database failures

## Future Enhancements

- Admin UI for managing models
- Per-tier model configuration
- Model performance tracking
- Automatic model availability testing
- Model cost tracking
