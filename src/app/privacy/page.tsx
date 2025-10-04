// app/privacy/page.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "At kamkmPDF, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.",
      icon: Shield,
    },
    {
      title: "2. Information We Collect",
      content:
        "We may collect information such as your email address, files you upload, and usage data. This information helps us improve our services and ensure smooth functionality.",
      icon: Eye,
    },
    {
      title: "3. How We Use Your Information",
      content:
        "Your information is used to provide and enhance our services, process files, improve performance, and communicate important updates with you.",
      icon: FileCheck,
    },
    {
      title: "4. File Security",
      content:
        "Your uploaded documents are processed securely and automatically deleted after conversion. We do not access, share, or use your files for any other purpose.",
      icon: Lock,
    },
    {
      title: "5. Sharing of Data",
      content:
        "We do not sell or rent your personal information. Limited data may be shared with trusted third-party providers solely to operate our services.",
      icon: Shield,
    },
    {
      title: "6. Cookies",
      content:
        "kamkmPDF uses cookies to enhance your experience, analyze traffic, and improve our website. You can manage cookies in your browser settings.",
      icon: Eye,
    },
    {
      title: "7. Data Retention",
      content:
        "We retain your data only as long as necessary to provide our services. Uploaded files are deleted automatically after processing.",
      icon: FileCheck,
    },
    {
      title: "8. Your Rights",
      content:
        "You may request access, correction, or deletion of your personal data. Please contact us if you wish to exercise your privacy rights.",
      icon: Shield,
    },
    {
      title: "9. Changes to this Policy",
      content:
        "We may update this Privacy Policy to reflect changes in our practices. Updates will be posted here with a new effective date.",
      icon: FileCheck,
    },
    {
      title: "10. Contact Us",
      content:
        "For questions about this Privacy Policy, please contact us at contact@kamkmpdf.com.",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 py-32 max-w-6xl">
        <div className="text-center mb-20">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
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
            className="text-6xl font-black tracking-tight text-slate-900 dark:text-white lg:text-7xl"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-xl text-slate-600 dark:text-slate-400"
          >
            Your privacy matters to us. Learn how we protect and handle your data.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="group relative"
              whileHover={{ y: -4 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-sky-600 rounded-3xl opacity-0 blur transition duration-300 group-hover:opacity-20" />
              <div className="relative rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{section.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
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
