// app/gdpr/page.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Database, UserCheck, Globe } from "lucide-react";

export default function GDPRPage() {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "KamkmPDF is committed to complying with the General Data Protection Regulation (GDPR). This page explains your rights under GDPR and how we protect your personal data.",
      icon: Shield,
    },
    {
      title: "2. Data Collection",
      content:
        "We collect only the minimal personal information necessary to provide our services, such as your email and uploaded files for processing. Files are automatically deleted after conversion.",
      icon: Database,
    },
    {
      title: "3. Legal Basis for Processing",
      content:
        "We process your personal data under lawful bases, including consent, contract fulfillment, and legitimate interest, as defined by GDPR.",
      icon: Shield,
    },
    {
      title: "4. Your GDPR Rights",
      content:
        "Under GDPR, you have the right to access, correct, delete, or restrict processing of your data. You may also request a copy of your data or withdraw consent at any time.",
      icon: UserCheck,
    },
    {
      title: "5. Data Transfers",
      content:
        "Where data is transferred outside the EU/EEA, we ensure appropriate safeguards are in place to protect your information.",
      icon: Globe,
    },
    {
      title: "6. Data Security",
      content:
        "We use industry-standard measures to protect your personal data from unauthorized access, disclosure, or destruction.",
      icon: Lock,
    },
    {
      title: "7. Data Retention",
      content:
        "We retain your data only for as long as necessary to fulfill our services. Uploaded files are automatically deleted after processing.",
      icon: Database,
    },
    {
      title: "8. Cookies & Tracking",
      content:
        "KamkmPDF uses cookies and tracking technologies to improve user experience and analyze traffic. You may manage cookies through your browser settings.",
      icon: Shield,
    },
    {
      title: "9. Contact & Data Protection Officer",
      content:
        "For GDPR inquiries or to exercise your rights, please contact our Data Protection Officer at dpo@KamkmPDF.com.",
      icon: UserCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-6 py-32">
        <div className="mb-20 text-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="h-4 w-4" />
            <span>Legal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl font-black tracking-tight text-slate-900 lg:text-7xl dark:text-white"
          >
            GDPR Compliance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-xl text-slate-600 dark:text-slate-400"
          >
            Your data protection rights under the General Data Protection
            Regulation.
          </motion.p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="group relative"
              whileHover={{ y: -4 }}
            >
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 blur transition duration-300 group-hover:opacity-20" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
