"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  const features = [
    {
      icon: "✨",
      title: "AI-Powered",
      description:
        "Advanced AI transforms your prompts into professional documents",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Generate PDFs in seconds, not hours",
    },
    {
      icon: "🛡️",
      title: "Enterprise Ready",
      description: "Secure, scalable, and built for teams",
    },
  ];

  const pricingFeatures = [
    {
      icon: "🧠",
      title: "Smart Content Generation",
      desc: "AI rewrites and expands prompts into structured sections, summaries, and visuals automatically.",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: "📚",
      title: "Template Library",
      desc: "Pre-built templates for proposals, reports, invoices, and case studies ready to customize.",
      color: "from-blue-300 to-blue-500",
    },
    {
      icon: "👥",
      title: "Collaborative Editing",
      desc: "Invite teammates, leave comments, and iterate on drafts before export with real-time collaboration.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: "🔒",
      title: "Secure Storage",
      desc: "Encrypted at rest and in transit, with access controls and audit logs for enterprise security.",
      color: "from-blue-200 to-blue-400",
    },
  ];

  const stats = [
    { number: "10K+", label: "PDFs Generated" },
    { number: "500+", label: "Happy Teams" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "10 PDFs/month",
        "Basic templates",
        "Email support",
        "Standard quality",
      ],
      popular: false,
      cta: "Get Started Free",
    },
    {
      name: "Pro",
      price: "$15",
      period: "/month",
      description: "Best for professionals",
      features: [
        "Unlimited PDFs",
        "Custom branding",
        "Priority support",
        "High quality exports",
        "Template library",
        "Collaborative editing",
      ],
      popular: true,
      cta: "Start Pro Trial",
    },
    {
      name: "Teams",
      price: "$99",
      period: "/month",
      description: "For growing organizations",
      features: [
        "Everything in Pro",
        "SSO & team management",
        "Advanced security",
        "API access",
        "White-label solution",
        "Dedicated support",
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ];

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Templates", href: "/templates" },
      { name: "API", href: "/api" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Status", href: "/status" },
      { name: "Security", href: "/security" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Cookies", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  return (
    <main className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <section
        className={
          "relative overflow-hidden bg-white text-[--color-text-primary] dark:bg-gradient-to-b dark:from-[var(--color-bg)] dark:via-[#0e1628] dark:to-[#0f1b2d]"
        }
        suppressHydrationWarning={true}
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          {/* Subtle light overlay; stronger in dark mode via existing gradient */}
          <div className="absolute inset-0 -skew-y-1 transform bg-gradient-to-r from-transparent via-black/[.02] to-transparent dark:via-white/5" />
          {/* Radial accents for light mode */}
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_60%)] blur-2xl dark:hidden" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),transparent_60%)] blur-2xl dark:hidden" />
          {/* Soft grid */}
          <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] [background-size:14px_14px] opacity-25 dark:opacity-20" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[var(--color-surface)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[var(--color-bg)]" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-[--color-border] bg-[--color-surface]/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm dark:border-white/20 dark:bg-white/10">
              <svg
                className="mr-2 h-4 w-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI-Powered PDF Generation
            </div>

            {/* Main headline */}
            <motion.h1
              className="mb-6 text-5xl leading-tight font-bold tracking-tight lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Turn Prompts Into
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-blue-100">
                {" "}
                Perfect PDFs
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-[--color-text-muted] lg:text-2xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            >
              Transform natural language into professional documents instantly.
              Create reports, proposals, and presentations with AI-powered
              precision.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              {isLoaded && isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
                >
                  Go to Dashboard
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
                >
                  Start Free Trial
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}

              <Link
                href="/dashboard/new"
                className="rounded-xl border-2 border-[--color-border] bg-white/80 px-8 py-4 text-lg font-semibold text-[--color-text-primary] transition-all duration-200 hover:bg-white hover:shadow-lg dark:border-white/30 dark:bg-transparent dark:hover:bg-white/20 dark:hover:shadow-xl"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                Try Demo
              </Link>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface)] shadow-sm dark:bg-white/10">
                    {feature.icon === "✨" && (
                      <svg
                        className="h-6 w-6 text-purple-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {feature.icon === "⚡" && (
                      <svg
                        className="h-6 w-6 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                      </svg>
                    )}
                    {feature.icon === "🛡️" && (
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[--color-text-primary] dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[--color-text-muted]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative scroll-mt-24 overflow-hidden bg-[--color-bg] py-20"
      >
        {/* Decorative subtle grid for light mode */}
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(2,6,23,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.04)_1px,transparent_1px)] [background-size:16px_16px] opacity-20 dark:hidden" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <motion.h2
              className="mb-4 text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              Everything you need to create amazing PDFs
            </motion.h2>
            <motion.p
              className="mx-auto max-w-3xl text-xl text-[--color-text-muted]"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            >
              Built for teams and solo creators who need reliable, fast PDF
              generation from natural prompts.
            </motion.p>
          </div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {pricingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative rounded-2xl border border-[--color-border] bg-[--color-surface] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[--color-primary]/40 hover:shadow-xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div
                  className={`inline-flex h-16 w-16 items-center justify-center bg-gradient-to-r ${feature.color} mb-6 rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon === "🧠" && (
                    <svg
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  {feature.icon === "📚" && (
                    <svg
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  )}
                  {feature.icon === "👥" && (
                    <svg
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  )}
                  {feature.icon === "🔒" && (
                    <svg
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-[--color-text-primary]">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-[--color-text-muted]">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--color-bg)]" />
      </section>

      {/* Social Proof Section */}
      <section
        id="testimonials"
        className="relative scroll-mt-24 overflow-hidden bg-[--color-bg] py-16"
      >
        {/* Decorative radial accents in light mode */}
        <div className="pointer-events-none absolute inset-0 dark:hidden">
          <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)] blur-3xl dark:hidden" />
          <div className="absolute right-10 -bottom-28 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.10),transparent_60%)] blur-3xl dark:hidden" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
        <div className="container mx-auto px-4">
          {/* Stats */}
          <motion.div
            className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="mb-1 text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent dark:from-sky-300 dark:to-cyan-200">
                    {stat.number}
                  </span>
                </div>
                <div className="text-sm text-[--color-text-muted]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--color-bg)]" />
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className={
          "relative scroll-mt-24 overflow-hidden bg-white py-20 dark:bg-gradient-to-b dark:from-[var(--color-bg)] dark:via-[#0e1628] dark:to-[#0f1b2d]"
        }
        suppressHydrationWarning={true}
      >
        {/* Decorative accents for light mode */}
        <div className="pointer-events-none absolute inset-0 dark:hidden">
          <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)] blur-3xl" />
          <div className="absolute right-16 -bottom-28 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.10),transparent_60%)] blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <motion.h2
              className="mb-4 text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p
              className="mx-auto max-w-2xl text-xl text-[--color-text-muted]"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            >
              Choose the plan that fits your needs. Upgrade or cancel anytime.
            </motion.p>
          </div>

          <motion.div
            className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.12 },
              },
            }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  plan.popular
                    ? "scale-105 border-[--color-primary] shadow-lg"
                    : "border-[--color-border] hover:border-[--color-primary]/50"
                } bg-[--color-surface]`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <div className="flex items-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="mb-4 text-[--color-text-muted]">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-[--color-text-muted]">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="mr-3 flex-shrink-0 text-green-500">
                        ✓
                      </span>
                      <span className="text-[--color-text-muted]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                    href={isSignedIn ? "/dashboard" : "/dashboard"}
                    className={`block w-full rounded-xl px-6 py-3 text-center font-semibold transition-all duration-200 ${
                      plan.popular
                        ? "bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-sm hover:from-sky-600 hover:to-cyan-700 hover:shadow-md"
                        : "bg-blue-500/80 text-white shadow-sm hover:bg-blue-400 hover:shadow-md"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-[--color-text-muted]">
              All plans include a 14-day free trial • No credit card required •
              Cancel anytime
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--color-surface)]" />
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className="relative scroll-mt-24 overflow-hidden bg-gradient-to-r from-sky-500 to-cyan-600 py-20 text-white dark:from-sky-700 dark:to-cyan-700"
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_60%)] blur-[60px]" />
          <div className="absolute right-16 -bottom-28 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)] blur-[70px]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="mb-6 text-4xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Ready to transform your workflow?
          </motion.h2>
          <motion.p
            className="mx-auto mb-8 max-w-2xl text-xl opacity-90"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          >
            Join thousands of professionals who are already saving hours with
            AI-powered PDF generation.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
          >
            <Link
              href="/dashboard"
              className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
            >
              {isSignedIn ? "Go to Dashboard" : "Start Free Trial"}
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/dashboard/new"
              className="group flex items-center rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/15 hover:shadow-lg"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              Try Demo
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>

          <p className="mt-6 text-sm opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--color-surface)]" />
      </section>

      {/* Footer */}
      <footer className="border-t border-[--color-border] bg-[--color-surface] text-[--color-text-primary]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="mb-4 inline-block text-2xl font-bold">
                Prompt-to-PDF
              </Link>
              <p className="mb-6 max-w-md text-[--color-text-muted]">
                Transform natural language into professional PDFs instantly.
                Join thousands of professionals who trust our AI-powered
                platform.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://x.com/kamkmgamer"
                  className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary]"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://github.com/Kamkmgamer"
                  className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary]"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/kamkm-gamer/"
                  className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary]"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase">
                Product
              </h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase">
                Legal
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-[--color-border] pt-8 md:flex-row">
            <p className="text-sm text-[--color-text-muted]">
              &copy; 2024 Prompt-to-PDF. All rights reserved.
            </p>
            <p className="mt-4 text-sm text-[--color-text-muted] md:mt-0">
              Made with &hearts; for PDF creators everywhere
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
