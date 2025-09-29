export default function PrivacyPage() {
  const privacySections = [
    {
      title: "Information We Collect",
      content:
        "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, payment information, and documents you create using our platform.",
    },
    {
      title: "How We Use Your Information",
      content:
        "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.",
    },
    {
      title: "Information Sharing",
      content:
        "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our platform.",
    },
    {
      title: "Data Security",
      content:
        "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    },
    {
      title: "Your Rights",
      content:
        "You have the right to access, update, or delete your personal information. You may also object to or restrict certain processing of your information.",
    },
    {
      title: "Data Retention",
      content:
        "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.",
    },
  ];

  const cookiesInfo = [
    {
      category: "Essential Cookies",
      description: "Required for the website to function properly",
      examples: ["Authentication", "Security", "Session management"],
    },
    {
      category: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website",
      examples: [
        "Google Analytics",
        "User behavior tracking",
        "Performance monitoring",
      ],
    },
    {
      category: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      examples: ["Ad targeting", "Retargeting", "Conversion tracking"],
    },
    {
      category: "Functional Cookies",
      description: "Enable enhanced functionality and personalization",
      examples: [
        "Language preferences",
        "Theme settings",
        "Feature preferences",
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
              Privacy Policy
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              Last updated: January 15, 2024
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-lg text-[--color-text-muted]">
              Prompt-to-PDF (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              respects your privacy and is committed to protecting your personal
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              AI-powered document creation platform.
            </p>
            <p className="text-[--color-text-muted]">
              By using our services, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-3xl font-bold">Privacy Overview</h2>
            <div className="space-y-8">
              {privacySections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8"
                >
                  <h3 className="mb-4 text-xl font-semibold">
                    {section.title}
                  </h3>
                  <p className="text-[--color-text-muted]">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cookies Section */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-3xl font-bold">Cookies and Tracking</h2>
            <p className="mb-8 text-[--color-text-muted]">
              We use cookies and similar tracking technologies to collect and
              use personal information about you. You can control cookies
              through your browser settings and other tools.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {cookiesInfo.map((category, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6"
                >
                  <h3 className="mb-3 text-lg font-semibold">
                    {category.category}
                  </h3>
                  <p className="mb-4 text-sm text-[--color-text-muted]">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Examples:</h4>
                    <ul className="space-y-1">
                      {category.examples.map((example, exampleIndex) => (
                        <li
                          key={exampleIndex}
                          className="text-xs text-[--color-text-muted]"
                        >
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">Contact Us</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8 text-center">
                <h3 className="mb-4 text-xl font-semibold">Privacy Officer</h3>
                <p className="mb-4 text-[--color-text-muted]">
                  For privacy-related inquiries and requests
                </p>
                <a
                  href="mailto:privacy@prompttopdf.com"
                  className="text-[--color-primary] hover:underline"
                >
                  privacy@prompttopdf.com
                </a>
              </div>
              <div className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8 text-center">
                <h3 className="mb-4 text-xl font-semibold">
                  Data Protection Officer
                </h3>
                <p className="mb-4 text-[--color-text-muted]">
                  For GDPR and data protection matters
                </p>
                <a
                  href="mailto:dpo@prompttopdf.com"
                  className="text-[--color-primary] hover:underline"
                >
                  dpo@prompttopdf.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Policy Updates</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last updated&quot; date.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Contact Us
            </a>
            <a
              href="/gdpr"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              GDPR Information
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
