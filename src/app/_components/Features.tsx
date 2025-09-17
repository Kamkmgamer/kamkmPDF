export default function Features() {
  const features = [
    {
      title: "Smart Content Generation",
      desc: "AI rewrites and expands prompts into structured sections, summaries, and visuals.",
    },
    {
      title: "Template Library",
      desc: "Pre-built templates for proposals, reports, invoices, and case studies.",
    },
    {
      title: "Collaborative Editing",
      desc: "Invite teammates, leave comments, and iterate on drafts before export.",
    },
    {
      title: "Secure Storage",
      desc: "Encrypted at rest and in transit, with access controls and audit logs.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-center text-2xl font-bold">Features</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm opacity-90">
        Built for teams and solo creators who need reliable, fast PDF generation
        from natural prompts.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="border-border rounded-lg border p-4">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-text-muted mt-2 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
