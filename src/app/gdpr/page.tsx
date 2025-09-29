export default function GdprPage() {
  const gdprRights = [
    {
      title: "Right to Access",
      description:
        "You have the right to request information about the personal data we hold about you.",
      icon: "👁️",
      details: [
        "Confirmation that we process your data",
        "Copy of your personal data",
        "Information about our processing activities",
      ],
    },
    {
      title: "Right to Rectification",
      description:
        "You can request correction of inaccurate or incomplete personal data.",
      icon: "✏️",
      details: [
        "Correction of inaccurate data",
        "Completion of incomplete data",
        "Verification of data accuracy",
      ],
    },
    {
      title: "Right to Erasure",
      description:
        "You can request deletion of your personal data under certain circumstances.",
      icon: "🗑️",
      details: [
        "Data no longer necessary",
        "Withdrawal of consent",
        "Unlawful processing",
      ],
    },
    {
      title: "Right to Restrict Processing",
      description:
        "You can limit how we process your personal data in certain situations.",
      icon: "⏸️",
      details: [
        "Contesting data accuracy",
        "Unlawful processing",
        "No longer needed but required by you",
      ],
    },
    {
      title: "Right to Data Portability",
      description:
        "You can receive your data in a structured, machine-readable format.",
      icon: "📦",
      details: [
        "Data provided to us",
        "Structured format",
        "Transmission to another controller",
      ],
    },
    {
      title: "Right to Object",
      description:
        "You can object to processing based on legitimate interests or direct marketing.",
      icon: "🚫",
      details: [
        "Direct marketing purposes",
        "Processing for research",
        "Legitimate interests override",
      ],
    },
  ];

  const dataProcessing = [
    {
      purpose: "Service Provision",
      lawfulBasis: "Contract",
      description:
        "Processing necessary to provide our AI document creation services",
      dataCategories: ["Account information", "Document content", "Usage data"],
      retention: "Duration of service + 3 years",
    },
    {
      purpose: "Customer Support",
      lawfulBasis: "Legitimate Interest",
      description: "Providing technical support and responding to inquiries",
      dataCategories: [
        "Contact information",
        "Support tickets",
        "Communication history",
      ],
      retention: "6 years from last contact",
    },
    {
      purpose: "Analytics & Improvement",
      lawfulBasis: "Legitimate Interest",
      description: "Improving our services and user experience",
      dataCategories: ["Usage analytics", "Performance data", "Feature usage"],
      retention: "3 years",
    },
    {
      purpose: "Marketing",
      lawfulBasis: "Consent",
      description: "Sending promotional communications (with opt-out)",
      dataCategories: [
        "Email address",
        "Marketing preferences",
        "Engagement data",
      ],
      retention: "Until consent withdrawn",
    },
  ];

  const safeguards = [
    {
      title: "Technical Measures",
      items: [
        "End-to-end encryption (TLS 1.3)",
        "AES-256 encryption at rest",
        "Regular security assessments",
        "Intrusion detection systems",
      ],
    },
    {
      title: "Organizational Measures",
      items: [
        "Staff training on data protection",
        "Access controls and authentication",
        "Regular compliance audits",
        "Data protection impact assessments",
      ],
    },
    {
      title: "Data Protection Officer",
      items: [
        "Dedicated DPO oversight",
        "Privacy-by-design approach",
        "Incident response procedures",
        "Regular compliance reviews",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              GDPR Compliance
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              Prompt-to-PDF is fully compliant with the General Data Protection
              Regulation (GDPR). Learn about your rights and our data protection
              measures.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-green-100 px-6 py-3 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <div className="mr-3 h-3 w-3 rounded-full bg-green-500"></div>
              <span className="font-semibold">GDPR Compliant</span>
            </div>
            <p className="text-[--color-text-muted]">
              Last compliance review: January 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Your GDPR Rights
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {gdprRights.map((right, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8"
                >
                  <div className="mb-4 text-3xl">{right.icon}</div>
                  <h3 className="mb-3 text-xl font-semibold">{right.title}</h3>
                  <p className="mb-6 text-[--color-text-muted]">
                    {right.description}
                  </p>
                  <ul className="space-y-2">
                    {right.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-start gap-2 text-sm text-[--color-text-muted]"
                      >
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-primary]"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Processing */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Data Processing Activities
            </h2>
            <div className="space-y-6">
              {dataProcessing.map((activity, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {activity.purpose}
                        </h3>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {activity.lawfulBasis}
                        </span>
                      </div>
                      <p className="mb-4 text-[--color-text-muted]">
                        {activity.description}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="mb-2 font-medium">Data Categories:</h4>
                          <ul className="space-y-1">
                            {activity.dataCategories.map(
                              (category, catIndex) => (
                                <li
                                  key={catIndex}
                                  className="text-sm text-[--color-text-muted]"
                                >
                                  • {category}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-2 font-medium">
                            Retention Period:
                          </h4>
                          <p className="text-sm text-[--color-text-muted]">
                            {activity.retention}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safeguards */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Data Protection Safeguards
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {safeguards.map((safeguard, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8"
                >
                  <h3 className="mb-6 text-xl font-semibold">
                    {safeguard.title}
                  </h3>
                  <ul className="space-y-3">
                    {safeguard.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start gap-3 text-[--color-text-muted]"
                      >
                        <div className="mt-1 text-green-500">✓</div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-12 text-3xl font-bold">Exercise Your Rights</h2>
            <p className="mb-8 text-[--color-text-muted]">
              To exercise any of your GDPR rights or if you have questions about
              our data processing activities:
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
                <h3 className="mb-4 text-xl font-semibold">
                  Data Protection Officer
                </h3>
                <p className="mb-4 text-[--color-text-muted]">
                  For all GDPR-related inquiries and requests
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:dpo@prompttopdf.com"
                    className="block text-[--color-primary] hover:underline"
                  >
                    dpo@prompttopdf.com
                  </a>
                  <a
                    href="/contact"
                    className="block text-[--color-primary] hover:underline"
                  >
                    Contact Form
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
                <h3 className="mb-4 text-xl font-semibold">
                  EU Representative
                </h3>
                <p className="mb-4 text-[--color-text-muted]">
                  Our designated representative in the European Union
                </p>
                <div className="space-y-2 text-sm text-[--color-text-muted]">
                  <p>Prompt-to-PDF EU Ltd</p>
                  <p>Dublin, Ireland</p>
                  <a
                    href="mailto:eu-rep@prompttopdf.com"
                    className="text-[--color-primary] hover:underline"
                  >
                    eu-rep@prompttopdf.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Stay Informed</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            We are committed to protecting your privacy and complying with GDPR
            requirements. This page will be updated as needed to reflect any
            changes in our practices.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/privacy"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Privacy Policy
            </a>
            <a
              href="/contact"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Contact DPO
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
