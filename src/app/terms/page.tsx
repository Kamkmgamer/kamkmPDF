// app/terms/page.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, Scale, Shield, AlertCircle } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "By accessing or using KamkmPDF, you agree to these Terms and Conditions. If you do not agree, you may not use the platform.",
      icon: FileText,
    },
    {
      title: "2. Use of Service",
      content:
        "You agree to use KamkmPDF only for lawful purposes and in accordance with all applicable local, national, and international laws.",
      icon: Scale,
    },
    {
      title: "3. User Content",
      content:
        "You retain ownership of your uploaded files. By using our service, you grant KamkmPDF a limited license to process your files for conversion and delivery.",
      icon: FileText,
    },
    {
      title: "4. Intellectual Property",
      content:
        "All rights, titles, and interests in KamkmPDF, including logos, brand, and software, are owned by us and protected under intellectual property laws.",
      icon: Shield,
    },
    {
      title: "5. Limitations of Liability",
      content:
        "KamkmPDF is provided 'as is' without warranties of any kind. We are not liable for data loss, damages, or disruptions caused by using our service.",
      icon: AlertCircle,
    },
    {
      title: "6. Privacy",
      content:
        "Your use of the service is also governed by our Privacy Policy. Please review it to understand how we collect and use your information.",
      icon: Shield,
    },
    {
      title: "7. Changes to Terms",
      content:
        "We reserve the right to update these Terms at any time. Continued use of KamkmPDF after changes means you accept the updated Terms.",
      icon: FileText,
    },
    {
      title: "8. Contact",
      content:
        "If you have any questions about these Terms, please contact us at contact@KamkmPDF.com.",
      icon: Scale,
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
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Scale className="h-4 w-4" />
            <span>Legal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl font-black tracking-tight text-slate-900 lg:text-7xl dark:text-white"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-xl text-slate-600 dark:text-slate-400"
          >
            Please read these terms carefully before using our service.
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
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-sky-600 to-teal-600 opacity-0 blur transition duration-300 group-hover:opacity-20" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg">
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
