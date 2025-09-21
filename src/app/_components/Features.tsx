"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
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

  return (
    <section
      id="features"
      className="scroll-mt-24 bg-white py-20 dark:bg-slate-900"
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
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative rounded-2xl border border-[--color-border] bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:from-slate-800 dark:to-slate-900"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div
                className={`inline-flex h-16 w-16 items-center justify-center bg-gradient-to-r ${feature.color} mb-6 rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-4 text-xl font-semibold">{feature.title}</h3>
              <p className="leading-relaxed text-[--color-text-muted]">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
