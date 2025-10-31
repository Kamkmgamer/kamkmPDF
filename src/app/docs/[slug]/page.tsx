import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { serverApi } from "~/trpc/server";
import { ArrowLeft, Book, Tag, ChevronRight } from "lucide-react";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await serverApi.documentation.getBySlug({ slug });

  if (!page) {
    return {
      title: "Page Not Found - kamkmPDF Documentation",
    };
  }

  return {
    title:
      page.seoTitle ??
      `${page.title ?? "Documentation"} - kamkmPDF Documentation`,
    description: page.seoDescription ?? page.description ?? undefined,
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await serverApi.documentation.getBySlug({ slug });

  if (!page) {
    notFound();
  }

  const relatedPages = await serverApi.documentation.getRelated({
    slug,
    limit: 5,
  });

  const categoryPages = await serverApi.documentation.getByCategory({
    category: page.category,
  });

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Back Button */}
                <Link
                  href="/docs"
                  className="flex items-center gap-2 text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Documentation
                </Link>

                {/* Table of Contents */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                    <Book className="h-4 w-4" />
                    In This Section
                  </h3>
                  <nav className="space-y-1">
                    {categoryPages
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((p) => (
                        <Link
                          key={p.id}
                          href={`/docs/${p.slug}`}
                          className={`block rounded px-3 py-2 text-sm transition-colors ${
                            p.id === page.id
                              ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                          }`}
                        >
                          {p.title}
                        </Link>
                      ))}
                  </nav>
                </div>

                {/* Related Pages */}
                {relatedPages.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                      Related Pages
                    </h3>
                    <nav className="space-y-2">
                      {relatedPages.map((p) => (
                        <Link
                          key={p.id}
                          href={`/docs/${p.slug}`}
                          className="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        >
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          {p.title}
                        </Link>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-3">
              {/* Header */}
              <header className="mb-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize dark:bg-blue-900/30 dark:text-blue-400">
                    {page.category.replace(/-/g, " ")}
                  </span>
                  {page.section && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 capitalize dark:bg-slate-700 dark:text-slate-300">
                      {page.section.replace(/-/g, " ")}
                    </span>
                  )}
                  {page.tags &&
                    Array.isArray(page.tags) &&
                    page.tags.length > 0 && (
                      <>
                        {page.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                </div>
                <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                  {page.title}
                </h1>
                {page.description && (
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    {page.description}
                  </p>
                )}
              </header>

              {/* Content */}
              <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-ul:text-slate-700 dark:prose-ul:text-slate-300 prose-ol:text-slate-700 dark:prose-ol:text-slate-300 max-w-none">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>

              {/* Footer Navigation */}
              <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Documentation
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
