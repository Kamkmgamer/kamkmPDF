"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Zap, Users, Heart } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-32 text-center max-w-7xl">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Heart className="h-4 w-4" />
          <span>Our Story</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl font-black tracking-tight text-slate-900 lg:text-7xl dark:text-white"
        >
          About{" "}
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-cyan-300 dark:to-sky-400">
            kamkmPDF
          </span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-slate-600 dark:text-slate-400"
        >
          kamkmPDF makes PDF creation simple, fast, and delightful. Whether
          you&apos;re an individual, a business, or a developer, our mission is
          to empower you to generate beautiful PDFs in seconds.
        </motion.p>
      </section>

      {/* Mission Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Fast & Reliable",
              desc: "Generate PDFs instantly with secure cloud processing.",
              color: "from-yellow-500 to-orange-500",
            },
            {
              icon: Sparkles,
              title: "Customizable",
              desc: "Logos, colors, fonts — fully brand your PDFs.",
              color: "from-sky-500 to-teal-500",
            },
            {
              icon: Users,
              title: "For Everyone",
              desc: "From freelancers to enterprises, kamkmPDF scales with you.",
              color: "from-blue-500 to-cyan-500",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-60`}
              />
              <div className="relative h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                <motion.div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-xl`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-gradient-to-b from-white to-slate-50 py-32 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 text-center md:grid-cols-3">
            {[
              { stat: "10K+", label: "PDFs Generated" },
              { stat: "99.9%", label: "Uptime" },
              { stat: "500+", label: "Happy Users" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{
                  delay: i * 0.15,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative"
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 blur-xl transition duration-500 group-hover:opacity-40" />
                <div className="relative rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-8 shadow-2xl dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900">
                  <h4 className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-5xl font-black text-transparent dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400">
                    {item.stat}
                  </h4>
                  <p className="mt-3 text-sm font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-400">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0, duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mx-auto max-w-2xl"
        >
          <Image
            src="https://7g9d5wparu.ufs.sh/f/A10B13NxqwDP69Lcva5U4LiK8WdqGfsrem5jMacTwl1kQxhN"
            alt="Khalil - Creator of kamkmPDF"
            width={96}
            height={96}
            className="border-primary mx-auto rounded-full border-4"
          />
          <h3 className="mt-6 text-2xl font-semibold">Khalil (kamkm)</h3>
          <p className="text-muted-foreground mt-4">
            I built kamkmPDF to make professional PDF generation simple,
            accessible, and fun. This is just the beginning.
          </p>
        </motion.div>
      </section>

      {/* CTA Section */}
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
              <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-black text-white lg:text-5xl">
                Ready to create beautiful PDFs?
              </h2>
              <p className="mt-4 text-xl text-white/90">
                Join thousands of creators and businesses using kamkmPDF today.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <motion.a
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try it now
                </motion.a>
                <motion.a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-xl transition-all hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn features
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
