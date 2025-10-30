import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { blogPosts } from "~/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const blogRouter = createTRPCRouter({
  // Get all published blog posts
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(20),
          offset: z.number().min(0).optional().default(0),
          tag: z.string().optional(),
        })
        .optional()
        .default({ limit: 20, offset: 0 }),
    )
    .query(async ({ input }) => {
      const { limit, offset, tag } = input;

      const conditions = [eq(blogPosts.status, "published")];

      if (tag) {
        conditions.push(
          sql`${blogPosts.tags} @> ${JSON.stringify([tag])}`,
        );
      }

      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(and(...conditions));

      return {
        posts,
        total: Number(total[0]?.count ?? 0),
      };
    }),

  // Get a single blog post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db
        .select()
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.slug, input.slug),
            eq(blogPosts.status, "published"),
          ),
        )
        .limit(1);

      if (post.length === 0) {
        return null;
      }

      return post[0];
    }),

  // Get recent posts (for sidebar or footer)
  getRecent: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(10).optional().default(5),
        })
        .optional()
        .default({ limit: 5 }),
    )
    .query(async ({ input }) => {
      const posts = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          publishedAt: blogPosts.publishedAt,
          featuredImage: blogPosts.featuredImage,
        })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
        .limit(input.limit);

      return posts;
    }),

  // Get all unique tags
  getTags: publicProcedure.query(async () => {
    const posts = await db
      .select({ tags: blogPosts.tags })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    const tagSet = new Set<string>();
    for (const post of posts) {
      if (post.tags && Array.isArray(post.tags)) {
        for (const tag of post.tags) {
          tagSet.add(tag);
        }
      }
    }

    return Array.from(tagSet).sort();
  }),
});

