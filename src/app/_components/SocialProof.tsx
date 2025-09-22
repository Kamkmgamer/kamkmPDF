"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "~/providers/ThemeProvider";

export default function SocialProof() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp",
      content:
        "Prompt-to-PDF transformed how we create proposals. What used to take hours now takes minutes.",
      avatar: "SC",
    },
    {
      name: "Marcus Johnson",
      role: "Freelance Designer",
      company: "Independent",
      content:
        "The AI-powered templates are incredible. My client deliverables look professional every time.",
      avatar: "MJ",
    },
    {
      name: "Elena Rodriguez",
      role: "Operations Manager",
      company: "StartupXYZ",
      content:
        "Finally, a tool that understands natural language. Our team productivity increased by 40%.",
      avatar: "ER",
    },
  ];

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
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute right-10 -bottom-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.16),transparent_60%)] blur-2xl" />
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
                <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  {stat.number}
                </span>
              </div>
              <div className="text-sm text-[--color-text-muted]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="mb-12 text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Loved by teams worldwide
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-lg text-[--color-text-muted]"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          >
            Join thousands of professionals who trust Prompt-to-PDF for their
            document needs
          </motion.p>
        </div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm transition-shadow hover:shadow-md"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="mb-4 flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[--color-primary] font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-[--color-text-muted]">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
              <p className="text-[--color-text-muted]">
                &quot;{testimonial.content}&quot;
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
