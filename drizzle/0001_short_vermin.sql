CREATE TABLE "pdfprompt_share_link" (
	"id" text PRIMARY KEY NOT NULL,
	"fileId" text,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pdfprompt_share_link_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "pdfprompt_share_link" ADD CONSTRAINT "pdfprompt_share_link_fileId_pdfprompt_file_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."pdfprompt_file"("id") ON DELETE no action ON UPDATE no action;