import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { documentationPages } from "~/server/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export const documentationRouter = createTRPCRouter({
  // Get all published documentation pages
  getAll: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          section: z.string().optional(),
          tag: z.string().optional(),
          limit: z.number().min(1).max(200).optional().default(100),
        })
        .optional()
        .default({ limit: 100 }),
    )
    .query(async ({ input }) => {
      const { category, section, tag, limit } = input;

      const conditions = [eq(documentationPages.status, "published")];

      if (category) {
        conditions.push(eq(documentationPages.category, category));
      }

      if (section) {
        conditions.push(eq(documentationPages.section, section));
      }

      if (tag) {
        conditions.push(
          sql`${documentationPages.tags} @> ${JSON.stringify([tag])}`,
        );
      }

      const pages = await db
        .select()
        .from(documentationPages)
        .where(and(...conditions))
        .orderBy(
          asc(documentationPages.category),
          asc(documentationPages.section),
          asc(documentationPages.order),
          asc(documentationPages.title),
        )
        .limit(limit);

      return pages;
    }),

  // Get documentation by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await db
        .select()
        .from(documentationPages)
        .where(
          and(
            eq(documentationPages.slug, input.slug),
            eq(documentationPages.status, "published"),
          ),
        )
        .limit(1);

      if (page.length === 0) {
        return null;
      }

      return page[0];
    }),

  // Get pages by category
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const pages = await db
        .select()
        .from(documentationPages)
        .where(
          and(
            eq(documentationPages.category, input.category),
            eq(documentationPages.status, "published"),
          ),
        )
        .orderBy(
          asc(documentationPages.section),
          asc(documentationPages.order),
          asc(documentationPages.title),
        );

      return pages;
    }),

  // Get all categories
  getCategories: publicProcedure.query(async () => {
    const pages = await db
      .select({
        category: documentationPages.category,
        section: documentationPages.section,
      })
      .from(documentationPages)
      .where(eq(documentationPages.status, "published"));

    const categoryMap = new Map<string, Set<string>>();
    for (const page of pages) {
      if (!categoryMap.has(page.category)) {
        categoryMap.set(page.category, new Set());
      }
      if (page.section) {
        categoryMap.get(page.category)!.add(page.section);
      }
    }

    return Array.from(categoryMap.entries()).map(([category, sections]) => ({
      category,
      sections: Array.from(sections).sort(),
      count: pages.filter((p) => p.category === category).length,
    }));
  }),

  // Get related pages (same category or shared tags)
  getRelated: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        limit: z.number().min(1).max(10).optional().default(5),
      }),
    )
    .query(async ({ input }) => {
      const currentPage = await db
        .select()
        .from(documentationPages)
        .where(
          and(
            eq(documentationPages.slug, input.slug),
            eq(documentationPages.status, "published"),
          ),
        )
        .limit(1);

      if (currentPage.length === 0) {
        return [];
      }

      const page = currentPage[0];
      if (!page) {
        return [];
      }

      const conditions = [
        eq(documentationPages.status, "published"),
        sql`${documentationPages.id} != ${page.id}`,
      ];

      // Try to find pages in same category first
      if (page.category) {
        conditions.push(eq(documentationPages.category, page.category));
      }

      const related = await db
        .select({
          id: documentationPages.id,
          title: documentationPages.title,
          slug: documentationPages.slug,
          description: documentationPages.description,
          category: documentationPages.category,
        })
        .from(documentationPages)
        .where(and(...conditions))
        .orderBy(asc(documentationPages.order))
        .limit(input.limit);

      return related;
    }),

  // Search documentation
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).optional().default(20),
      }),
    )
    .query(async ({ input }) => {
      const pages = await db
        .select({
          id: documentationPages.id,
          title: documentationPages.title,
          slug: documentationPages.slug,
          description: documentationPages.description,
          category: documentationPages.category,
          section: documentationPages.section,
        })
        .from(documentationPages)
        .where(eq(documentationPages.status, "published"))
        .limit(200); // Get more than needed for filtering

      // Simple text search (could be improved with full-text search)
      const queryLower = input.query.toLowerCase();
      const filtered = pages
        .filter(
          (page) =>
            page.title.toLowerCase().includes(queryLower) ||
            (page.description?.toLowerCase().includes(queryLower) ?? false) ||
            page.category.toLowerCase().includes(queryLower),
        )
        .slice(0, input.limit);

      return filtered;
    }),

  // Get all unique tags
  getTags: publicProcedure.query(async () => {
    const pages = await db
      .select({ tags: documentationPages.tags })
      .from(documentationPages)
      .where(eq(documentationPages.status, "published"));

    const tagSet = new Set<string>();
    for (const page of pages) {
      if (page.tags && Array.isArray(page.tags)) {
        for (const tag of page.tags) {
          tagSet.add(tag);
        }
      }
    }

    return Array.from(tagSet).sort();
  }),
});

