import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Prompt-to-PDF",
  description: "Latest updates, tips, and insights about AI-powered PDF generation.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[--color-surface]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[--color-text-primary] mb-8">
            Blog
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-[--color-text-muted] text-xl mb-8">
              Welcome to our blog! Here you&apos;ll find the latest updates, tips, and insights about AI-powered PDF generation.
            </p>
            
            <div className="bg-[--color-surface-secondary] rounded-lg p-8 border border-[--color-border]">
              <h2 className="text-2xl font-semibold text-[--color-text-primary] mb-4">
                Coming Soon
              </h2>
              <p className="text-[--color-text-muted] mb-4">
                We&apos;re working on bringing you valuable content about:
              </p>
              <ul className="list-disc list-inside text-[--color-text-muted] space-y-2">
                <li>Best practices for AI prompt engineering</li>
                <li>PDF generation tips and tricks</li>
                <li>Product updates and new features</li>
                <li>User success stories</li>
                <li>Technical deep-dives</li>
              </ul>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-[--color-text-muted]">
                Stay tuned for our first blog post!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
