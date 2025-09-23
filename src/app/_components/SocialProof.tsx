"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "~/providers/ThemeProvider";

export default function SocialProof() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stats = [
    { number: "10K+", label: "PDFs Generated" },
    { number: "500+", label: "Happy Teams" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 overflow-hidden bg-[--color-bg] py-16"
    >
      {/* Decorative radial accents in light mode */}
      <div
        className={`pointer-events-none absolute inset-0 ${isDark ? "hidden" : ""}`}
      >
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)] blur-3xl dark:hidden" />
        <div className="absolute right-10 -bottom-28 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.10),transparent_60%)] blur-3xl dark:hidden" />
      </div>

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
    </section>
  );
}
