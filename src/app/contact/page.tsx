"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";

interface ApiResponse {
  error?: string;
  message?: string;
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false); // Reset success state

    const formData = new FormData(event.currentTarget);
    const firstNameEntry = formData.get("first-name");
    const lastNameEntry = formData.get("last-name");

    const firstName = typeof firstNameEntry === "string" ? firstNameEntry : "";
    const lastName = typeof lastNameEntry === "string" ? lastNameEntry : "";

    const name = `${firstName} ${lastName}`.trim();
    const email = formData.get("email") as string;
    const subject =
      (formData.get("subject") as string) || "Contact Form Submission";
    const message = formData.get("message") as string;

    // Client-side validation
    if (!name || !email || !message) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error ?? `Failed to send message (Status: ${response.status})`,
        );
      }

      setSuccess(true);
      // Reset form using ref
      formRef.current?.reset();

      // No redirect - show success message inline
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while sending your message. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // No URL param check needed since we're handling success inline

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative container mx-auto max-w-4xl px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-16">
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600 sm:mb-6 sm:px-4 sm:py-2 sm:text-sm dark:bg-blue-900/30 dark:text-blue-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Get in Touch</span>
          </motion.div>

          <motion.h1
            className="px-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="mt-4 px-4 text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-xl dark:text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Have a question? We&apos;d love to hear from you. Send us a message
            and we&apos;ll respond as soon as possible.
          </motion.p>
        </div>

        {error && (
          <motion.div
            className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-center sm:mb-8 sm:rounded-2xl sm:p-6 dark:border-red-800 dark:bg-red-900/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold text-red-800 sm:text-base dark:text-red-400">
              {error}
            </p>
          </motion.div>
        )}

        {success && (
          <motion.div
            className="mx-auto mb-6 max-w-2xl rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center sm:mb-8 sm:rounded-3xl sm:p-8 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-5 sm:mb-6">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 sm:mb-4 sm:h-16 sm:w-16">
                <CheckCircle className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 sm:text-3xl dark:text-green-400">
                Thank You!
              </h2>
              <p className="mt-2 px-2 text-base text-green-700 sm:mt-3 sm:text-lg dark:text-green-300">
                Your message has been sent successfully. We&apos;ll get back to
                you soon.
              </p>
            </div>
            <motion.button
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-green-700 active:scale-95 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Another Message
            </motion.button>
          </motion.div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-xl sm:mt-12"
        >
          <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
            <div>
              <label htmlFor="first-name" className="block text-xs font-medium sm:text-sm">
                First name
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  required
                  className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm sm:rounded-md"
                />
              </div>
            </div>
            <div>
              <label htmlFor="last-name" className="block text-xs font-medium sm:text-sm">
                Last name
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  required
                  className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm sm:rounded-md"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-xs font-medium sm:text-sm">
                Email
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm sm:rounded-md"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="subject" className="block text-xs font-medium sm:text-sm">
                Subject (Optional)
              </label>
              <div className="mt-1.5">
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  autoComplete="subject"
                  className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm sm:rounded-md"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-xs font-medium sm:text-sm">
                Message
              </label>
              <div className="mt-1.5">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm sm:rounded-md"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:col-span-2 sm:mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-6 py-3.5 text-base font-bold text-white shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-8 sm:py-5 sm:text-lg"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
