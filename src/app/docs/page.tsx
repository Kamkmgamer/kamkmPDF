import type { Metadata } from "next";
import Link from "next/link";
import { serverApi } from "~/trpc/server";
import type { RouterOutputs } from "~/trpc/react";
import { Book, ChevronRight, Tag } from "lucide-react";

type DocumentationPage = RouterOutputs["documentation"]["getAll"][number];
type CategoryInfo = RouterOutputs["documentation"]["getCategories"][number];

export const metadata: Metadata = {
  title: "Documentation - kamkmPDF",
  description: "Complete documentation for kamkmPDF. Learn how to use our API, generate PDFs, and integrate PDF generation into your applications.",
};

export default async function DocumentationPage() {
  const categories = await serverApi.documentation.getCategories();
  const allPages = await serverApi.documentation.getAll({ limit: 200 });

  // Group pages by category and section
  const groupedPages = new Map<
    string,
    Map<string | null, DocumentationPage[]>
  >();

  for (const page of allPages) {
    if (!groupedPages.has(page.category)) {
      groupedPages.set(page.category, new Map());
    }
    const categoryMap = groupedPages.get(page.category)!;
    const section = page.section ?? "general";
    if (!categoryMap.has(section)) {
      categoryMap.set(section, []);
    }
    categoryMap.get(section)!.push(page);
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Book className="h-4 w-4" />
              <span>Documentation</span>
            </div>
            <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-900 lg:text-6xl dark:text-white">
              Documentation
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-400">
              Everything you need to know about using kamkmPDF. From getting
              started to advanced API usage.
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                No documentation available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Array.from(groupedPages.entries()).map(
                ([category, sections]) => {
                  const categoryInfo = categories.find((c) => c.category === category);
                  return (
                    <div
                      key={category}
                      className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <h2 className="mb-6 text-2xl font-bold capitalize text-slate-900 dark:text-white">
                        {category.replace(/-/g, " ")}
                        {categoryInfo && (
                          <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                            ({categoryInfo.count} pages)
                          </span>
                        )}
                      </h2>

                      {Array.from(sections.entries()).map(([section, pages]) => {
                        return (
                          <div key={section ?? "general"} className="mb-6 last:mb-0">
                          {section && section !== "general" && (
                            <h3 className="mb-4 text-lg font-semibold capitalize text-slate-700 dark:text-slate-300">
                              {section.replace(/-/g, " ")}
                            </h3>
                          )}
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {pages
                              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                              .map((page) => (
                                <Link
                                  key={page.id}
                                  href={`/docs/${page.slug}`}
                                  className="group flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
                                >
                                  <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                      {page.title}
                                    </h4>
                                    {page.description && (
                                      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                        {page.description}
                                      </p>
                                    )}
                                    {page.tags && Array.isArray(page.tags) && page.tags.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {page.tags.slice(0, 2).map((tag: string) => (
                                          <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                          >
                                            <Tag className="h-3 w-3" />
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400" />
                                </Link>
                              ))}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

