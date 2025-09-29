export default function TermsPage() {
  const termsSections = [
    {
      title: "Acceptance of Terms",
      content:
        "By accessing and using Prompt-to-PDF, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "Use License",
      content:
        "Permission is granted to temporarily use Prompt-to-PDF for personal and commercial document creation purposes. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials, use the materials for any commercial purpose or for any public display, or attempt to reverse engineer any software contained on the website.",
    },
    {
      title: "User Accounts",
      content:
        "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.",
    },
    {
      title: "Acceptable Use",
      content:
        "You agree not to use the service to create, upload, or share content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, or otherwise objectionable.",
    },
    {
      title: "Service Availability",
      content:
        "We strive to provide uninterrupted service but do not guarantee that the service will be available at all times. We reserve the right to modify, suspend, or discontinue the service with or without notice.",
    },
    {
      title: "Limitation of Liability",
      content:
        "In no event shall Prompt-to-PDF or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use our services.",
    },
  ];

  const pricingTerms = [
    {
      title: "Subscription Plans",
      content:
        "We offer various subscription plans with different features and limitations. All fees are billed in advance on a recurring basis unless otherwise specified.",
    },
    {
      title: "Payment Terms",
      content:
        "Payment is due at the beginning of each billing cycle. We accept major credit cards and other payment methods as indicated during the checkout process.",
    },
    {
      title: "Cancellation Policy",
      content:
        "You may cancel your subscription at any time. Upon cancellation, you will continue to have access to the service until the end of your current billing period.",
    },
    {
      title: "Refund Policy",
      content:
        "We offer a 14-day money-back guarantee for new subscriptions. Refunds for established accounts are provided at our discretion.",
    },
  ];

  const contentGuidelines = [
    "Documents must not violate any laws or regulations",
    "Content must not infringe on intellectual property rights",
    "No creation of misleading or fraudulent documents",
    "Users are responsible for the accuracy of generated content",
    "Prohibited from using the service for illegal activities",
    "Must comply with our community guidelines and acceptable use policy",
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Terms of Service
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
              These Terms of Service (&quot;Terms&quot;) govern your use of
              Prompt-to-PDF&apos;s AI-powered document creation platform and
              related services. By using our service, you agree to these Terms.
            </p>
            <p className="text-[--color-text-muted]">
              Please read these Terms carefully before using our services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-3xl font-bold">Terms of Use</h2>
            <div className="space-y-8">
              {termsSections.map((section, index) => (
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

      {/* Content Guidelines */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-3xl font-bold">Content Guidelines</h2>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
              <h3 className="mb-6 text-xl font-semibold">
                Acceptable Content Policy
              </h3>
              <p className="mb-6 text-[--color-text-muted]">
                You are solely responsible for the content you create using our
                platform. The following types of content are strictly
                prohibited:
              </p>
              <ul className="space-y-3">
                {contentGuidelines.map((guideline, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[--color-text-muted]"
                  >
                    <div className="mt-1 text-red-500">✗</div>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Terms */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-3xl font-bold">
              Pricing and Payment Terms
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {pricingTerms.map((term, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8"
                >
                  <h3 className="mb-4 text-lg font-semibold">{term.title}</h3>
                  <p className="text-[--color-text-muted]">{term.content}</p>
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
            <h2 className="mb-12 text-3xl font-bold">
              Questions About These Terms?
            </h2>
            <p className="mb-8 text-[--color-text-muted]">
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6">
                <h3 className="mb-2 font-semibold">Legal Department</h3>
                <a
                  href="mailto:legal@prompttopdf.com"
                  className="text-[--color-primary] hover:underline"
                >
                  legal@prompttopdf.com
                </a>
              </div>
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6">
                <h3 className="mb-2 font-semibold">General Support</h3>
                <a
                  href="/contact"
                  className="text-[--color-primary] hover:underline"
                >
                  Contact Form
                </a>
              </div>
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6">
                <h3 className="mb-2 font-semibold">Business Address</h3>
                <p className="text-sm text-[--color-text-muted]">
                  123 Innovation Drive
                  <br />
                  Tech City, TC 12345
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Terms Updates</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            We may update these Terms of Service from time to time. We will
            notify you of any changes by posting the new Terms on this page and
            updating the &quot;Last updated&quot; date.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Contact Us
            </a>
            <a
              href="/privacy"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
