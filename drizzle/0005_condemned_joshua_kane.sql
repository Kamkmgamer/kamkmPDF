CREATE TABLE "pdfprompt_documentation_page" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"slug" varchar(512) NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar(128) NOT NULL,
	"section" varchar(128),
	"order" integer DEFAULT 0 NOT NULL,
	"parentId" text,
	"status" varchar(32) DEFAULT 'published' NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"seoTitle" varchar(512),
	"seoDescription" text,
	"author" varchar(256),
	"authorId" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_documentation_page_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "doc_page_slug_idx" ON "pdfprompt_documentation_page" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "doc_page_category_idx" ON "pdfprompt_documentation_page" USING btree ("category");--> statement-breakpoint
CREATE INDEX "doc_page_status_idx" ON "pdfprompt_documentation_page" USING btree ("status");--> statement-breakpoint
CREATE INDEX "doc_page_parent_idx" ON "pdfprompt_documentation_page" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "doc_page_order_idx" ON "pdfprompt_documentation_page" USING btree ("order");