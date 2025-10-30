CREATE TABLE "pdfprompt_blog_post" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"slug" varchar(512) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featuredImage" text,
	"author" varchar(256),
	"authorId" text,
	"status" varchar(32) DEFAULT 'published' NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"seoTitle" varchar(512),
	"seoDescription" text,
	"publishedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_blog_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "promptHash" text;--> statement-breakpoint
CREATE INDEX "blog_post_slug_idx" ON "pdfprompt_blog_post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_post_published_at_idx" ON "pdfprompt_blog_post" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "blog_post_status_idx" ON "pdfprompt_blog_post" USING btree ("status");