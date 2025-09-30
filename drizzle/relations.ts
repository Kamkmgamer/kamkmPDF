import { relations } from "drizzle-orm/relations";
import { pdfpromptJob, pdfpromptFile, pdfpromptShareLink } from "./schema";

export const pdfpromptFileRelations = relations(
  pdfpromptFile,
  ({ one, many }) => ({
    pdfpromptJob: one(pdfpromptJob, {
      fields: [pdfpromptFile.jobId],
      references: [pdfpromptJob.id],
    }),
    pdfpromptShareLinks: many(pdfpromptShareLink),
  }),
);

export const pdfpromptJobRelations = relations(pdfpromptJob, ({ many }) => ({
  pdfpromptFiles: many(pdfpromptFile),
}));

export const pdfpromptShareLinkRelations = relations(
  pdfpromptShareLink,
  ({ one }) => ({
    pdfpromptFile: one(pdfpromptFile, {
      fields: [pdfpromptShareLink.fileId],
      references: [pdfpromptFile.id],
    }),
  }),
);
