"use client";

import Link from "next/link";
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
  Rocket,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Hero() {
  const { isSignedIn } = useAuth();
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

  return (
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
            x: reduceMotion ? 0 : (mousePosition.x - windowSize.width / 2) / 50,
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
            {isSignedIn ? (
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

          {/* Secondary internal links for SEO and quick navigation */}
          <div className="mt-2 mb-12 text-sm text-slate-600 dark:text-slate-400">
            <Link
              href="/pricing"
              className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-white"
            >
              See pricing
            </Link>
            <span className="mx-2">•</span>
            <Link
              href="/help"
              className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-white"
            >
              Read docs
            </Link>
            <span className="mx-2">•</span>
            <Link
              href="/security"
              className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-white"
            >
              Security
            </Link>
          </div>
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
  );
}
