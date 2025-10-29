import { relations } from "drizzle-orm/relations";
import { pdfpromptEmailCampaign, pdfpromptEmailCampaignEvent, pdfpromptReferral, pdfpromptReferralReward, pdfpromptJob, pdfpromptFile, pdfpromptShareLink, pdfpromptFileVersion } from "./schema";

export const pdfpromptEmailCampaignEventRelations = relations(pdfpromptEmailCampaignEvent, ({one}) => ({
	pdfpromptEmailCampaign: one(pdfpromptEmailCampaign, {
		fields: [pdfpromptEmailCampaignEvent.campaignId],
		references: [pdfpromptEmailCampaign.id]
	}),
}));

export const pdfpromptEmailCampaignRelations = relations(pdfpromptEmailCampaign, ({many}) => ({
	pdfpromptEmailCampaignEvents: many(pdfpromptEmailCampaignEvent),
}));

export const pdfpromptReferralRewardRelations = relations(pdfpromptReferralReward, ({one}) => ({
	pdfpromptReferral: one(pdfpromptReferral, {
		fields: [pdfpromptReferralReward.referralId],
		references: [pdfpromptReferral.id]
	}),
}));

export const pdfpromptReferralRelations = relations(pdfpromptReferral, ({many}) => ({
	pdfpromptReferralRewards: many(pdfpromptReferralReward),
}));

export const pdfpromptFileRelations = relations(pdfpromptFile, ({one, many}) => ({
	pdfpromptJob: one(pdfpromptJob, {
		fields: [pdfpromptFile.jobId],
		references: [pdfpromptJob.id]
	}),
	pdfpromptShareLinks: many(pdfpromptShareLink),
	pdfpromptFileVersions: many(pdfpromptFileVersion),
}));

export const pdfpromptJobRelations = relations(pdfpromptJob, ({many}) => ({
	pdfpromptFiles: many(pdfpromptFile),
	pdfpromptFileVersions: many(pdfpromptFileVersion),
}));

export const pdfpromptShareLinkRelations = relations(pdfpromptShareLink, ({one}) => ({
	pdfpromptFile: one(pdfpromptFile, {
		fields: [pdfpromptShareLink.fileId],
		references: [pdfpromptFile.id]
	}),
}));

export const pdfpromptFileVersionRelations = relations(pdfpromptFileVersion, ({one}) => ({
	pdfpromptFile: one(pdfpromptFile, {
		fields: [pdfpromptFileVersion.fileId],
		references: [pdfpromptFile.id]
	}),
	pdfpromptJob: one(pdfpromptJob, {
		fields: [pdfpromptFileVersion.jobId],
		references: [pdfpromptJob.id]
	}),
}));