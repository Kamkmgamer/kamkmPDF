export default function AboutPage() {
  const stats = [
    { number: "10K+", label: "PDFs Generated" },
    { number: "500+", label: "Happy Teams" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const values = [
    {
      title: "Innovation First",
      description:
        "                  We&apos;re constantly pushing the boundaries of what&apos;s possible with AI and document generation.",
    },
    {
      title: "User-Centric Design",
      description:
        "Every feature we build is designed with our users' workflow and experience in mind.",
    },
    {
      title: "Reliability",
      description:
        "                  When you need to create important documents, we&apos;re here with enterprise-grade reliability.",
    },
    {
      title: "Transparency",
      description:
        "                  We believe in being open about our technology, our progress, and our mission.",
    },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                Prompt-to-PDF
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              We&apos;re on a mission to revolutionize how professionals create
              documents. By combining the power of AI with intuitive design,
              we&apos;re making professional document creation accessible to
              everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-[--color-primary] md:text-4xl">
                  {stat.number}
                </div>
                <div className="mt-2 text-sm text-[--color-text-muted] md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold">Our Story</h2>
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-xl font-semibold">The Problem</h3>
                <p className="text-[--color-text-muted]">
                  Traditional document creation is broken. Professionals spend
                  hours formatting documents, struggling with templates, and
                  repeating the same work across multiple projects. What should
                  be a simple task becomes a time-consuming chore that takes
                  away from actual work.
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-xl font-semibold">The Solution</h3>
                <p className="text-[--color-text-muted]">
                  We saw an opportunity to use AI to transform how documents are
                  created. By understanding natural language prompts and
                  converting them into professionally formatted PDFs, we could
                  save professionals countless hours while ensuring consistent,
                  high-quality results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-3xl font-bold">Our Mission</h2>
            <p className="text-xl text-[--color-text-muted]">
              To democratize professional document creation through AI, making
              it possible for anyone to create beautiful, consistent documents
              from simple prompts while saving time and reducing frustration.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>
                  <p className="text-[--color-text-muted]">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-3xl font-bold">Meet the Team</h2>
            <p className="mb-12 text-xl text-[--color-text-muted]">
              We&apos;re a small but passionate team of AI enthusiasts,
              designers, and problem-solvers dedicated to making document
              creation better for everyone.
            </p>

            {/* Team members would go here */}
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600"></div>
                <h3 className="text-xl font-semibold">Our Team</h3>
                <p className="mt-2 text-[--color-text-muted]">
                  We&apos;re a distributed team of AI experts, designers, and
                  engineers working together to build the future of document
                  creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to join the revolution?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Experience the power of AI-driven document creation. Join thousands
            of professionals who are already saving time with Prompt-to-PDF.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/dashboard"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
