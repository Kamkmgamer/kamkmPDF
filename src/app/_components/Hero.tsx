import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 py-24 text-white">
      <div className="container mx-auto px-4 text-center">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
          Prompt-to-PDF
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg opacity-90">
          Turn natural-language prompts into polished, ready-to-share PDFs in
          seconds. Generate reports, proposals, invoices, and more — with
          templates, branding, and batch export.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-white/90 px-8 py-3 font-semibold text-indigo-700 shadow hover:opacity-95"
          >
            Try it free
          </Link>
          <Link
            href="/docs"
            className="rounded-full border border-white/30 px-6 py-3 text-white hover:bg-white/10"
          >
            Docs & API
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-4">
            <h4 className="font-semibold">AI-powered templates</h4>
            <p className="mt-2 text-sm opacity-90">
              Use curated prompt templates to generate content and layout with
              a single prompt.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <h4 className="font-semibold">Branding & styling</h4>
            <p className="mt-2 text-sm opacity-90">
              Customize fonts, colors, logos and footers to match your brand.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <h4 className="font-semibold">Export & integrations</h4>
            <p className="mt-2 text-sm opacity-90">
              Download PDFs, send them by email, or save to cloud storage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
