import { pgTable, index, integer, varchar, timestamp, unique, text, real, boolean, uniqueIndex, jsonb, foreignKey, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const pdfpromptPost = pgTable("pdfprompt_post", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "pdfprompt_post_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 256 }),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	index("name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const pdfpromptCreditProduct = pgTable("pdfprompt_credit_product", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	credits: integer().notNull(),
	productId: text().notNull(),
	price: real().notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("pdfprompt_credit_product_productId_unique").on(table.productId),
]);

export const pdfpromptPolarProduct = pgTable("pdfprompt_polar_product", {
	id: text().primaryKey().notNull(),
	tier: varchar({ length: 32 }).notNull(),
	productId: text().notNull(),
	name: varchar({ length: 128 }).notNull(),
	description: text(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
	billingCycle: varchar({ length: 16 }).default('monthly').notNull(),
}, (table) => [
	uniqueIndex("tier_billing_idx").using("btree", table.tier.asc().nullsLast().op("text_ops"), table.billingCycle.asc().nullsLast().op("text_ops")),
]);

export const pdfpromptEmailPreference = pgTable("pdfprompt_email_preference", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	unsubscribedFromMarketing: boolean().default(false).notNull(),
	unsubscribedFromProduct: boolean().default(false).notNull(),
	unsubscribedAt: timestamp({ withTimezone: true, mode: 'string' }),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("pdfprompt_email_preference_userId_unique").on(table.userId),
]);

export const pdfpromptEmailCampaign = pgTable("pdfprompt_email_campaign", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	campaignType: varchar({ length: 64 }).notNull(),
	emailType: varchar({ length: 64 }).notNull(),
	scheduledFor: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	sentAt: timestamp({ withTimezone: true, mode: 'string' }),
	status: varchar({ length: 32 }).default('scheduled').notNull(),
	metadata: jsonb(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const pdfpromptEmailCampaignEvent = pgTable("pdfprompt_email_campaign_event", {
	id: text().primaryKey().notNull(),
	campaignId: text().notNull(),
	userId: text().notNull(),
	eventType: varchar({ length: 64 }).notNull(),
	eventData: jsonb(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [pdfpromptEmailCampaign.id],
			name: "pdfprompt_email_campaign_event_campaignId_pdfprompt_email_campa"
		}),
]);

export const pdfpromptReferral = pgTable("pdfprompt_referral", {
	id: text().primaryKey().notNull(),
	referrerId: text().notNull(),
	referredUserId: text().notNull(),
	referralCode: text().notNull(),
	status: varchar({ length: 32 }).default('pending').notNull(),
	completedAt: timestamp({ withTimezone: true, mode: 'string' }),
	rewardedAt: timestamp({ withTimezone: true, mode: 'string' }),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("pdfprompt_referral_referredUserId_unique").on(table.referredUserId),
]);

export const pdfpromptReferralReward = pgTable("pdfprompt_referral_reward", {
	id: text().primaryKey().notNull(),
	referralId: text().notNull(),
	userId: text().notNull(),
	creditsAwarded: integer().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.referralId],
			foreignColumns: [pdfpromptReferral.id],
			name: "pdfprompt_referral_reward_referralId_pdfprompt_referral_id_fk"
		}),
]);

export const pdfpromptFile = pgTable("pdfprompt_file", {
	id: text().primaryKey().notNull(),
	jobId: text(),
	userId: text(),
	mimeType: varchar({ length: 128 }).default('application/pdf'),
	size: integer().default(0),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	fileKey: text().notNull(),
	fileUrl: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [pdfpromptJob.id],
			name: "pdfprompt_file_jobId_pdfprompt_job_id_fk"
		}),
]);

export const pdfpromptJob = pgTable("pdfprompt_job", {
	id: text().primaryKey().notNull(),
	userId: text(),
	prompt: text(),
	status: varchar({ length: 32 }).default('queued').notNull(),
	attempts: integer().default(0).notNull(),
	resultFileId: text(),
	errorMessage: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
    progress: integer().default(0).notNull(),
    stage: varchar({ length: 64 }),
    promptHash: varchar({ length: 64 }), // For deduplication
	generatedHtml: text(),
	imageUrls: jsonb(),
	regenerationCount: integer().default(0).notNull(),
	parentJobId: text(),
}, (table) => [
	// Critical index for job queue queries (worker picks jobs by status + createdAt)
	index("pdfprompt_job_status_created_at_idx").on(
		table.status,
		table.createdAt,
	),
	// Index for deduplication queries
	index("pdfprompt_job_prompt_hash_idx").on(table.promptHash),
	// Index for job status updates
	index("pdfprompt_job_status_idx").on(table.status),
	// Index for user job lookups
	index("pdfprompt_job_user_id_idx").on(table.userId),
]);

export const pdfpromptShareLink = pgTable("pdfprompt_share_link", {
	id: text().primaryKey().notNull(),
	fileId: text(),
	token: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [pdfpromptFile.id],
			name: "pdfprompt_share_link_fileId_pdfprompt_file_id_fk"
		}),
	unique("pdfprompt_share_link_token_unique").on(table.token),
]);

export const pdfpromptUsageHistory = pgTable("pdfprompt_usage_history", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	action: varchar({ length: 64 }).notNull(),
	amount: integer().default(1).notNull(),
	metadata: jsonb(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const pdfpromptApiKey = pgTable("pdfprompt_api_key", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	name: varchar({ length: 128 }).notNull(),
	keyHash: text().notNull(),
	keyPrefix: text().notNull(),
	permissions: jsonb().default([]),
	lastUsedAt: timestamp({ withTimezone: true, mode: 'string' }),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("pdfprompt_api_key_keyHash_unique").on(table.keyHash),
]);

export const pdfpromptBrandingSetting = pgTable("pdfprompt_branding_setting", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	logoUrl: text(),
	companyName: varchar({ length: 256 }),
	primaryColor: varchar({ length: 7 }),
	secondaryColor: varchar({ length: 7 }),
	customDomain: text(),
	hidePlatformBranding: boolean().default(false).notNull(),
	footerText: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("pdfprompt_branding_setting_userId_unique").on(table.userId),
]);

export const pdfpromptTeamMember = pgTable("pdfprompt_team_member", {
	id: text().primaryKey().notNull(),
	teamOwnerId: text().notNull(),
	memberUserId: text().notNull(),
	role: varchar({ length: 32 }).default('member').notNull(),
	inviteEmail: text(),
	status: varchar({ length: 32 }).default('pending').notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const pdfpromptFileVersion = pgTable("pdfprompt_file_version", {
	id: text().primaryKey().notNull(),
	fileId: text().notNull(),
	userId: text().notNull(),
	versionNumber: integer().notNull(),
	jobId: text(),
	prompt: text(),
	fileKey: text().notNull(),
	fileUrl: text().notNull(),
	fileSize: integer().default(0),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [pdfpromptFile.id],
			name: "pdfprompt_file_version_fileId_pdfprompt_file_id_fk"
		}),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [pdfpromptJob.id],
			name: "pdfprompt_file_version_jobId_pdfprompt_job_id_fk"
		}),
]);

export const pdfpromptUserSubscription = pgTable("pdfprompt_user_subscription", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	tier: varchar({ length: 32 }).default('starter').notNull(),
	status: varchar({ length: 32 }).default('active').notNull(),
	pdfsUsedThisMonth: real().default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	storageUsedBytes: bigint({ mode: "number" }).default(0).notNull(),
	periodStart: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	periodEnd: timestamp({ withTimezone: true, mode: 'string' }),
	cancelAtPeriodEnd: boolean().default(false).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
	polarSubscriptionId: text(),
	creditsBalance: integer().default(0).notNull(),
	referralCode: text().notNull(),
}, (table) => [
	unique("pdfprompt_user_subscription_userId_unique").on(table.userId),
	unique("pdfprompt_user_subscription_referralCode_unique").on(table.referralCode),
]);

export const pdfpromptWebhook = pgTable("pdfprompt_webhook", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	url: text().notNull(),
	events: jsonb().notNull(),
	secret: text().notNull(),
	isActive: boolean().default(true).notNull(),
	lastTriggeredAt: timestamp({ withTimezone: true, mode: 'string' }),
	failureCount: integer().default(0).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
