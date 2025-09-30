"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Check, X, Zap, Users, Building2, Sparkles } from "lucide-react";
import { api } from "~/trpc/react";

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const { data: currentSub } = api.subscription.getCurrent.useQuery(undefined, {
    enabled: isSignedIn,
  });

  const tiers = [
    {
      id: "starter",
      name: "Starter",
      icon: Sparkles,
      price: 0,
      priceYearly: 0,
      description: "Perfect for exploring and casual use",
      color: "from-gray-400 to-gray-600",
      features: [
        { text: "5 PDFs per month", included: true },
        { text: "50 MB storage (30 days)", included: true },
        { text: "Basic templates (3)", included: true },
        { text: "Free AI models", included: true },
        { text: "Watermark on exports", included: false },
        { text: "2-5 minute processing", included: false },
        { text: "Community support", included: true },
        { text: "Premium templates", included: false },
        { text: "API access", included: false },
        { text: "Team collaboration", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      icon: Zap,
      price: 12,
      priceYearly: 120,
      description: "For freelancers and professionals",
      color: "from-blue-400 to-blue-600",
      features: [
        { text: "50 PDFs per month", included: true },
        { text: "2 GB permanent storage", included: true },
        { text: "20+ premium templates", included: true },
        { text: "Premium AI models (GPT-4 class)", included: true },
        { text: "No watermarks", included: true },
        { text: "<60 second processing", included: true },
        { text: "Version history (10 versions)", included: true },
        { text: "Email support (24-48h)", included: true },
        { text: "API access", included: false },
        { text: "Team collaboration", included: false },
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      id: "business",
      name: "Business",
      icon: Users,
      price: 79,
      priceYearly: 790,
      description: "For teams and small businesses",
      color: "from-purple-400 to-purple-600",
      features: [
        { text: "500 PDFs per month (pooled)", included: true },
        { text: "50 GB shared storage", included: true },
        { text: "Unlimited templates", included: true },
        { text: "Premium AI models + priority", included: true },
        { text: "Custom branding", included: true },
        { text: "<30 second processing", included: true },
        { text: "Version history (50 versions)", included: true },
        { text: "Priority support (live chat)", included: true },
        { text: "API access (beta)", included: true },
        { text: "Team collaboration (5 seats)", included: true },
      ],
      cta: "Upgrade to Business",
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Building2,
      price: 500,
      priceYearly: 5000,
      description: "Custom solutions for large organizations",
      color: "from-orange-400 to-orange-600",
      features: [
        { text: "Unlimited PDFs", included: true },
        { text: "Unlimited storage", included: true },
        { text: "Custom templates", included: true },
        { text: "Custom AI models", included: true },
        { text: "White-label options", included: true },
        { text: "<15 second processing", included: true },
        { text: "Unlimited version history", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Full API access + webhooks", included: true },
        { text: "Unlimited seats + SSO", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {currentSub && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              Current plan:{" "}
              <span className="font-bold capitalize">{currentSub.tier}</span>
            </div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-4">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier = currentSub?.tier === tier.id;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col rounded-2xl border-2 bg-white p-8 shadow-lg transition-all hover:shadow-xl ${
                  tier.popular
                    ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                    : "border-gray-200"
                } ${isCurrentTier ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-4 py-1 text-sm font-semibold text-white">
                    Current Plan
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tier.color}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Tier Name */}
                <h3 className="text-2xl font-bold text-gray-900">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{tier.description}</p>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${tier.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {tier.priceYearly > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      or ${tier.priceYearly}/year{" "}
                      <span className="font-semibold text-green-600">
                        (save 17%)
                      </span>
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={
                    isCurrentTier
                      ? "/dashboard"
                      : tier.id === "enterprise"
                        ? "/contact"
                        : isSignedIn
                          ? `/dashboard?upgrade=${tier.id}`
                          : "/sign-up"
                  }
                  className={`mt-8 block rounded-lg px-6 py-3 text-center font-semibold transition-all ${
                    tier.popular || isCurrentTier
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {isCurrentTier ? "Manage Plan" : tier.cta}
                </Link>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 flex-shrink-0 text-gray-300" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-gray-700"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-24"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Can I change plans anytime?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we&apos;ll prorate any charges.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                What happens if I exceed my quota?
              </h3>
              <p className="mt-2 text-gray-600">
                You&apos;ll receive notifications at 80% usage. If you hit your
                limit, you can upgrade instantly or wait until next month&apos;s
                reset.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Do you offer refunds?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes, we offer a 14-day money-back guarantee on all paid plans.
                No questions asked.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                What payment methods do you accept?
              </h3>
              <p className="mt-2 text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for
                Enterprise plans.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-24 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white">
            Still have questions?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our team is here to help. Contact us for a personalized demo or to
            discuss custom Enterprise solutions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50"
            >
              Contact Sales
            </Link>
            <Link
              href="/help"
              className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
            >
              View Documentation
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
