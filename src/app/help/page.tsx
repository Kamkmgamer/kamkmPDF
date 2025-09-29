"use client";

import { useState } from "react";

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I get started with Prompt-to-PDF?",
      answer:
        "Getting started is easy! Simply sign up for an account, choose a template or start with a blank document, and begin writing your prompt. Our AI will transform your natural language into a professionally formatted PDF.",
    },
    {
      question: "What types of documents can I create?",
      answer:
        "You can create a wide variety of documents including reports, proposals, invoices, presentations, resumes, cover letters, business plans, and much more. Our AI adapts to your specific needs.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption for data at rest and in transit. Your documents are private and secure, and we never share your data with third parties without your explicit consent.",
    },
    {
      question: "Can I collaborate with my team?",
      answer:
        "Yes! Our Pro and Teams plans include collaborative editing features that allow multiple team members to work on documents simultaneously, leave comments, and track changes.",
    },
    {
      question: "What file formats do you support?",
      answer:
        "We generate high-quality PDFs as our primary output format. You can also export your documents to other formats like Word or HTML if needed.",
    },
    {
      question: "Do you offer custom templates?",
      answer:
        "Yes! Our Pro and Teams plans include access to custom template creation tools, and we also offer professional template design services for enterprise customers.",
    },
    {
      question: "How accurate is the AI-generated content?",
      answer:
        "Our AI is trained on millions of professional documents and produces highly accurate, contextually appropriate content. However, we always recommend reviewing and editing the generated content to ensure it meets your specific requirements.",
    },
    {
      question: "What are your API limitations?",
      answer:
        "Our API rate limits depend on your plan. Free users get 10 requests per month, Pro users get unlimited requests, and Teams/Enterprise customers get custom limits based on their needs.",
    },
  ];

  const categories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using Prompt-to-PDF",
      articles: [
        "Creating Your First Document",
        "Understanding Templates",
        "Navigation and Interface Guide",
        "Account Setup and Settings",
      ],
    },
    {
      title: "AI Features",
      description: "Master the power of AI document generation",
      articles: [
        "Writing Effective Prompts",
        "Customizing AI Output",
        "Template Personalization",
        "Advanced AI Settings",
      ],
    },
    {
      title: "Collaboration",
      description: "Work together with your team",
      articles: [
        "Inviting Team Members",
        "Real-time Collaboration",
        "Comment and Review System",
        "Version Control",
      ],
    },
    {
      title: "Enterprise",
      description: "For organizations and businesses",
      articles: [
        "SSO Integration",
        "Security and Compliance",
        "Admin Dashboard",
        "Custom Integrations",
      ],
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Help Center
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              Find answers, get support, and learn how to make the most of
              Prompt-to-PDF&apos;s powerful features.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full rounded-xl border border-[--color-border] bg-[--color-surface] px-6 py-4 pl-12 text-lg focus:ring-2 focus:ring-[--color-primary] focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="h-6 w-6 text-[--color-text-muted]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">Quick Help</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/dashboard/new"
                className="rounded-xl border border-[--color-border] bg-[--color-bg] p-6 text-center transition-all hover:shadow-lg"
              >
                <div className="mb-3 text-2xl">📄</div>
                <h3 className="font-semibold">Create Document</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">
                  Start with a template
                </p>
              </a>
              <a
                href="/templates"
                className="rounded-xl border border-[--color-border] bg-[--color-bg] p-6 text-center transition-all hover:shadow-lg"
              >
                <div className="mb-3 text-2xl">🎨</div>
                <h3 className="font-semibold">Browse Templates</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">
                  Find the perfect template
                </p>
              </a>
              <a
                href="/contact"
                className="rounded-xl border border-[--color-border] bg-[--color-bg] p-6 text-center transition-all hover:shadow-lg"
              >
                <div className="mb-3 text-2xl">💬</div>
                <h3 className="font-semibold">Contact Support</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">
                  Get personalized help
                </p>
              </a>
              <a
                href="/api"
                className="rounded-xl border border-[--color-border] bg-[--color-bg] p-6 text-center transition-all hover:shadow-lg"
              >
                <div className="mb-3 text-2xl">🔧</div>
                <h3 className="font-semibold">API Documentation</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">
                  Developer resources
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[--color-border] bg-[--color-surface]"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left focus:ring-2 focus:ring-[--color-primary] focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      <span
                        className={`transition-transform ${openFAQ === index ? "rotate-180" : ""}`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4">
                      <p className="text-[--color-text-muted]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Documentation
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8"
                >
                  <h3 className="mb-3 text-xl font-bold">{category.title}</h3>
                  <p className="mb-6 text-[--color-text-muted]">
                    {category.description}
                  </p>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a
                          href="#"
                          className="text-[--color-primary] hover:underline"
                        >
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Still need help?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Our support team is here to help you succeed. Get in touch and
            we&apos;ll respond as quickly as possible.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@prompttopdf.com"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Email Us Directly
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
