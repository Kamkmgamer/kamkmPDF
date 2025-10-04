// app/help/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HelpCircle, Mail, Book } from "lucide-react";

import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const faqs = [
  {
    q: "How do I generate a PDF?",
    a: "Simply upload your content, choose a template or customize your branding, and click 'Generate'. Your PDF will be ready instantly.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All files are encrypted in transit and automatically deleted from our servers after processing.",
  },
  {
    q: "Can I use my own branding?",
    a: "Absolutely! Upload your logo, fonts, and color scheme to create fully branded PDFs with kamkmPDF.",
  },
  {
    q: "Do you offer free and paid plans?",
    a: "Yes. We offer a free plan with core features, and pro/business plans with advanced functionality and more usage.",
  },
  {
    q: "Where can I get support?",
    a: "You can reach us anytime at contact@kamkmpdf.com or use the contact form in the app.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative container mx-auto px-6 py-32 text-center max-w-7xl">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl font-black tracking-tight text-slate-900 dark:text-white lg:text-7xl"
        >
          Help Center
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-3xl text-xl text-slate-600 dark:text-slate-400"
        >
          Find answers to common questions, explore guides, and get support for
          using <span className="font-semibold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400">kamkmPDF</span>.
        </motion.p>
      </section>

      {/* FAQ Section */}
      <section className="relative container mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <motion.div
              key={item.q}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-sky-600 rounded-3xl opacity-0 blur transition duration-300 group-hover:opacity-20" />
              <button
                onClick={() => toggleFAQ(i)}
                className="relative w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-left transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-400/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white pr-8">{item.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {openIndex === i ? "−" : "+"}
                    </div>
                  </motion.div>
                </div>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.p
                      key="content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed"
                    >
                      {item.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: 0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 p-16 text-center"
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-black text-white lg:text-5xl">Still need help?</h2>
              <p className="mt-4 text-xl text-white/90">
                Our support team is here for you 24/7.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
                  >
                    <Mail className="h-5 w-5" />
                    Contact Support
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-xl px-8 py-4 font-bold text-white transition-all hover:bg-white/20"
                  >
                    <Book className="h-5 w-5" />
                    View Docs
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
