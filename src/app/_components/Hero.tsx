"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Hero() {
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 -skew-y-1 transform bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <span className="mr-2">✨</span>
            AI-Powered PDF Generation
          </div>

          {/* Main headline */}
          <motion.h1
            className="mb-6 text-5xl leading-tight font-bold lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Turn Prompts Into
            <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              {" "}
              Perfect PDFs
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 lg:text-2xl"
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
                className="group flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:from-blue-600 hover:to-blue-800"
              >
                Go to Dashboard
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="group flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:from-blue-600 hover:to-blue-800"
              >
                Start Free Trial
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            )}

            <Link
              href="/dashboard/new"
              className="rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:bg-white/10"
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
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
