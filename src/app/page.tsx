"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Star,
  FileText,
  Download,
  Rocket,
  Globe,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Pricing from "./_components/Pricing";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Reduced motion preference
  const reduceMotion = useReducedMotion();

  // Mouse position for parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Window size for parallax calculations
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pricingFeatures = [
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

  const stats = [
    { number: "10K+", label: "PDFs Generated" },
    { number: "500+", label: "Happy Teams" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  // Pricing uses shared component for consistent content

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Templates", href: "/dashboard/templates" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Status", href: "/status" },
      { name: "Security", href: "/security" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Cookies", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Stats", href: "/stats" },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 dark:text-white">
      {/* Theme toggle removed */}

      {/* Hero Section - Completely Redesigned */}
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden"
        suppressHydrationWarning={true}
      >
        {/* Advanced animated background with gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.15),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.25),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_50%)]" />

          {/* Floating orbs with parallax */}
          <motion.div
            className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }
            }
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              x: reduceMotion
                ? 0
                : (mousePosition.x - windowSize.width / 2) / 50,
              y: reduceMotion
                ? 0
                : (mousePosition.y - windowSize.height / 2) / 50,
            }}
          />
          <motion.div
            className="absolute bottom-32 left-[15%] h-96 w-96 rounded-full bg-gradient-to-tr from-sky-400/40 to-teal-400/40 blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, 40, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }
            }
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{
              x: reduceMotion
                ? 0
                : -(mousePosition.x - windowSize.width / 2) / 40,
              y: reduceMotion
                ? 0
                : -(mousePosition.y - windowSize.height / 2) / 40,
            }}
          />

          {/* Animated grid pattern */}
          <motion.div
            className="absolute inset-0 opacity-20 dark:opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, rgb(148 163 184 / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.3) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
              maskImage:
                "radial-gradient(ellipse 100% 60% at 50% 0%, #000 60%, transparent 100%)",
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    backgroundPosition: ["0px 0px", "80px 80px"],
                  }
            }
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Floating particles */}
          {!reduceMotion &&
            [1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-blue-400/30"
                style={{
                  left: `${20 * i}%`,
                  top: `${15 * i}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
        </div>

        <motion.div
          className="relative container mx-auto flex min-h-screen items-center px-4 py-20 lg:py-28"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <div className="mx-auto w-full max-w-6xl text-center">
            {/* Floating Badge with modern glassmorphism */}
            <motion.div
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/80 px-6 py-3 text-sm font-medium shadow-2xl shadow-blue-500/20 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div
                className="relative"
                animate={reduceMotion ? undefined : { rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-yellow-400/50 blur-md"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text font-semibold text-transparent dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400">
                AI-Powered PDF Generation Platform
              </span>
            </motion.div>

            {/* Main headline with advanced typography */}
            <motion.h1
              className="mb-8 text-6xl leading-[1.1] font-black tracking-tight lg:text-8xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Transform Ideas Into
              </motion.span>
              <br />
              <motion.span
                className="relative inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-cyan-300 dark:to-sky-400">
                  Stunning PDFs
                </span>
                {/* Animated underline */}
                <motion.div
                  className="absolute right-0 -bottom-2 left-0 h-3 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-sky-500/30 blur-xl"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scaleX: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.span>
            </motion.h1>

            <motion.p
              className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-slate-600 lg:text-2xl dark:text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              Harness the power of AI to transform simple text prompts into
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {" "}
                professional documents
              </span>{" "}
              in seconds. No design skills required.
            </motion.p>

            {/* CTA Buttons with magnetic effect */}
            <motion.div
              className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
            >
              {isLoaded && isSignedIn ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                >
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 opacity-60 blur-xl transition duration-300 group-hover:opacity-100" />
                  <Link
                    href="/dashboard"
                    className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-300"
                  >
                    <Rocket className="h-5 w-5" />
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                >
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 opacity-60 blur-xl transition duration-300 group-hover:opacity-100" />
                  <Link
                    href="/sign-up"
                    className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-300"
                  >
                    <Rocket className="h-5 w-5" />
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard/new"
                  className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/80 px-10 py-5 text-lg font-bold text-slate-700 shadow-xl backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  <FileText className="h-5 w-5" />
                  <span>Try Demo</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Feature highlights with 3D depth - Bento Grid Style */}
            <motion.div
              className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 1.1 },
                },
              }}
            >
              {[
                {
                  icon: Sparkles,
                  title: "AI-Powered",
                  desc: "Advanced AI transforms your prompts instantly",
                  color: "from-sky-500 to-teal-500",
                  delay: 0,
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  desc: "Generate PDFs in seconds, not hours",
                  color: "from-yellow-500 to-orange-500",
                  delay: 0.1,
                },
                {
                  icon: Shield,
                  title: "Enterprise Ready",
                  desc: "Secure, scalable, and compliant",
                  color: "from-blue-500 to-cyan-500",
                  delay: 0.2,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-60`}
                  />

                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/5">
                    {/* Animated gradient orb */}
                    <motion.div
                      className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-20`}
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                              scale: [1, 1.2, 1],
                              rotate: [0, 90, 0],
                            }
                      }
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: feature.delay,
                      }}
                    />

                    <motion.div
                      className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-2xl`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />
      </section>

      {/* Features Section - Redesigned with Bento Grid */}
      <section
        id="features"
        className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white py-32 dark:from-slate-950 dark:to-slate-900"
      >
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="mb-20 text-center">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Powerful Features</span>
            </motion.div>
            <motion.h2
              className="mb-6 text-5xl font-black tracking-tight lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Everything you need to create
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-cyan-300 dark:to-sky-400">
                amazing PDFs
              </span>
            </motion.h2>
            <motion.p
              className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Built for teams and solo creators who demand reliability, speed,
              and professional results.
            </motion.p>
          </div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            {pricingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Glow effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-50`}
                />

                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/5">
                  {/* Animated background orb */}
                  <motion.div
                    className={`absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-15`}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                          }
                    }
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  />

                  <motion.div
                    className={`inline-flex h-16 w-16 items-center justify-center bg-gradient-to-r ${feature.color} mb-6 rounded-2xl text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    {feature.icon === "🧠" && (
                      <svg
                        className="h-8 w-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {feature.icon === "📚" && (
                      <svg
                        className="h-8 w-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    )}
                    {feature.icon === "👥" && (
                      <svg
                        className="h-8 w-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    )}
                    {feature.icon === "🔒" && (
                      <svg
                        className="h-8 w-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </motion.div>

                  <h3 className="mb-3 text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* Social Proof Section - Redesigned */}
      <section
        id="testimonials"
        className="relative scroll-mt-24 overflow-hidden bg-white py-24 dark:bg-slate-900"
      >
        <div className="container mx-auto px-4">
          {/* Stats with modern cards */}
          <motion.div
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative"
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-sky-400/0 via-sky-400/20 to-blue-500/0 opacity-0 blur-xl transition duration-500 group-hover:opacity-60 dark:from-blue-500/0 dark:via-blue-500/25 dark:to-blue-500/0" />

                <div className="relative flex h-full flex-col items-center justify-center rounded-[28px] bg-white p-10 text-center shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-300 dark:bg-slate-900 dark:shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
                  <motion.span
                    className="text-4xl font-black tracking-tight text-transparent sm:text-5xl bg-clip-text bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 dark:from-blue-400 dark:via-sky-400 dark:to-cyan-400"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {stat.number}
                  </motion.span>
                  <span className="mt-3 text-xs font-semibold tracking-[0.35em] text-slate-500 uppercase sm:text-sm sm:tracking-[0.25em] dark:text-slate-400">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Redesigned with modern gradient */}
      <section id="cta" className="relative scroll-mt-24 overflow-hidden py-32">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-700 dark:via-cyan-700 dark:to-sky-700" />

        {/* Animated mesh gradient overlay */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />

          {/* Floating orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Rocket className="h-4 w-4" />
            <span>Get Started Today</span>
          </motion.div>

          <motion.h2
            className="mb-6 text-5xl font-black text-white lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Ready to transform your workflow?
          </motion.h2>
          <motion.p
            className="mx-auto mb-12 max-w-2xl text-xl text-white/90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of professionals who are already saving hours with
            AI-powered PDF generation.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <div className="absolute -inset-1 rounded-3xl bg-white opacity-50 blur-lg transition duration-300 group-hover:opacity-75" />
              <Link
                href="/dashboard"
                className="relative flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-blue-600 shadow-2xl transition-all duration-300"
              >
                <Download className="h-5 w-5" />
                <span>
                  {isSignedIn ? "Go to Dashboard" : "Start Free Trial"}
                </span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard/new"
                className="group flex items-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 px-10 py-5 text-lg font-bold text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:bg-white/20"
              >
                <Globe className="h-5 w-5" />
                <span>Try Demo</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Redesigned */}
      <footer className="relative bg-gradient-to-b from-white to-slate-100 text-slate-700 dark:from-slate-900 dark:to-slate-950 dark:text-slate-300">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="group mb-6 inline-block">
                <span className="inline-block bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-3xl font-black text-transparent transition-all group-hover:scale-105 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400">
                  Prompt-to-PDF
                </span>
              </Link>
              <p className="mb-8 max-w-md leading-relaxed text-slate-600 dark:text-slate-400">
                Transform natural language into professional PDFs instantly.
                Join thousands of professionals who trust our AI-powered
                platform.
              </p>
              <div className="flex space-x-3">
                <motion.a
                  href="https://x.com/kamkmgamer"
                  className="group relative"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 blur-lg transition duration-300 group-hover:opacity-50" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </div>
                </motion.a>
                <motion.a
                  href="https://github.com/Kamkmgamer"
                  className="group relative"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 opacity-0 blur-lg transition duration-300 group-hover:opacity-50" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700 transition-colors group-hover:bg-sky-500 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                    <span className="sr-only">GitHub</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/in/kamkm-gamer/"
                  className="group relative"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 blur-lg transition duration-300 group-hover:opacity-50" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700 transition-colors group-hover:bg-cyan-500 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="mb-6 text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-slate-600 transition-all hover:translate-x-1 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="mb-6 text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-slate-600 transition-all hover:translate-x-1 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="mb-6 text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-slate-600 transition-all hover:translate-x-1 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="mb-6 text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-slate-600 transition-all hover:translate-x-1 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              &copy; 2025 Prompt-to-PDF. All rights reserved.
            </p>
            <p className="text-center text-sm text-slate-600 md:text-right dark:text-slate-400">
              Made with{" "}
              <motion.span
                className="inline-block text-red-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ❤️
              </motion.span>{" "}
              for PDF creators everywhere
              <br />
              by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-semibold text-transparent dark:from-blue-400 dark:to-cyan-400">
                Soft-Magic
              </span>{" "}
              and{" "}
              <span className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text font-semibold text-transparent dark:from-sky-400 dark:to-teal-400">
                KamkmGamer
              </span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
