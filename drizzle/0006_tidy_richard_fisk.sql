CREATE TABLE "pdfprompt_ai_model" (
	"id" text PRIMARY KEY NOT NULL,
	"modelId" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"provider" varchar(128),
	"isActive" boolean DEFAULT true NOT NULL,
	"isAgentModel" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_ai_model_modelId_unique" UNIQUE("modelId")
);
--> statement-breakpoint
CREATE INDEX "ai_model_model_id_idx" ON "pdfprompt_ai_model" USING btree ("modelId");--> statement-breakpoint
CREATE INDEX "ai_model_is_active_idx" ON "pdfprompt_ai_model" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "ai_model_is_agent_idx" ON "pdfprompt_ai_model" USING btree ("isAgentModel");