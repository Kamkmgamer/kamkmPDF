"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Pricing() {
  const { isSignedIn } = useAuth();

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

  return (
    <section
      id="pricing"
      className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-blue-100 py-20 dark:from-blue-950 dark:to-blue-900"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <motion.h2
            className="mb-4 text-4xl font-bold"
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
              className={`relative rounded-2xl border-2 bg-white p-8 transition-all duration-300 hover:shadow-xl dark:bg-slate-800 ${
                plan.popular
                  ? "scale-105 border-[--color-primary] shadow-lg"
                  : "border-[--color-border] hover:border-[--color-primary]/50"
              }`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="flex items-center rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow">
                    <span className="mr-1">⭐</span>
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
                    <span className="mr-3 flex-shrink-0 text-green-500">✓</span>
                    <span className="text-[--color-text-muted]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={isSignedIn ? "/dashboard" : "/dashboard"}
                className={`block w-full rounded-xl px-6 py-3 text-center font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
                    : "bg-[--color-primary] text-white hover:bg-[--color-primary]/90"
                }`}
              >
                {plan.cta}
              </Link>
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
    </section>
  );
}
