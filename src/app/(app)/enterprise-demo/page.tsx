"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Calendar,
  Users,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function EnterpriseDemoPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enterprise-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(errorData?.error ?? "Failed to submit request");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit enterprise demo request", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-3xl border-2 border-purple-200/50 bg-white p-8 text-center shadow-2xl lg:p-12 dark:border-purple-900/30 dark:bg-slate-900"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-6 inline-flex items-center justify-center"
            >
              <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-6 shadow-2xl">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </motion.div>

            <h1 className="mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-4xl font-black text-transparent lg:text-5xl">
              Thank You!
            </h1>
            <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
              Your demo request has been received. Our enterprise team will
              contact you within 24 hours to schedule your personalized demo.
            </p>

            <div className="mb-8 rounded-2xl border border-purple-200/50 bg-purple-50/50 p-6 dark:border-purple-900/30 dark:bg-purple-950/30">
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                What happens next?
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Our team reviews your requirements
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <p className="text-gray-700 dark:text-gray-300">
                    We&apos;ll contact you to schedule a convenient time
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Receive a personalized demo tailored to your needs
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Get a custom proposal and pricing
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-xl transition-all hover:shadow-2xl"
              >
                View Pricing
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-purple-300 bg-white px-6 py-3 font-bold text-purple-600 transition-all hover:bg-purple-50 dark:border-purple-700 dark:bg-slate-800 dark:text-purple-400 dark:hover:bg-slate-700"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl [animation-delay:1s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center lg:mb-16"
        >
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 shadow-2xl lg:h-20 lg:w-20">
                <Crown className="h-8 w-8 text-white lg:h-10 lg:w-10" />
              </div>
            </div>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-4xl font-black text-transparent lg:text-6xl">
            Schedule Your Enterprise Demo
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-700 lg:text-xl dark:text-gray-300">
            Discover how KamkmPDF Enterprise can transform your
            organization&apos;s PDF generation workflow with unlimited scale and
            dedicated support.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="rounded-3xl border-2 border-purple-200/50 bg-white p-6 shadow-2xl lg:p-8 dark:border-purple-900/30 dark:bg-slate-900">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Tell us about your needs
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <Mail className="mr-1 mb-1 inline h-4 w-4" />
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                    placeholder="john.doe@company.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <Phone className="mr-1 mb-1 inline h-4 w-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Company */}
                <div>
                  <label
                    htmlFor="company"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <Building2 className="mr-1 mb-1 inline h-4 w-4" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                    placeholder="Acme Corporation"
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label
                    htmlFor="companySize"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <Users className="mr-1 mb-1 inline h-4 w-4" />
                    Company Size *
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    required
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                  >
                    <option value="">Select company size</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1,000 employees</option>
                    <option value="1001-5000">1,001-5,000 employees</option>
                    <option value="5001+">5,001+ employees</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Your Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                  >
                    <option value="">Select your role</option>
                    <option value="executive">C-Level / Executive</option>
                    <option value="director">Director / VP</option>
                    <option value="manager">Manager</option>
                    <option value="engineer">Engineer / Developer</option>
                    <option value="it">IT / Operations</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <MessageSquare className="mr-1 mb-1 inline h-4 w-4" />
                    Tell us about your use case
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-400"
                    placeholder="What are your PDF generation needs? How many PDFs do you generate monthly?"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5" />
                      <span>Schedule Demo</span>
                    </>
                  )}
                </motion.button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  By submitting, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </form>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-6"
          >
            {/* What to Expect */}
            <div className="rounded-3xl border-2 border-purple-200/50 bg-white p-6 shadow-xl lg:p-8 dark:border-purple-900/30 dark:bg-slate-900">
              <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                What to Expect
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: "30-Minute Personalized Demo",
                    description:
                      "See KamkmPDF Enterprise in action with examples tailored to your use case",
                  },
                  {
                    title: "Custom Solution Design",
                    description:
                      "Our team will design a solution that fits your organization's needs",
                  },
                  {
                    title: "Technical Deep Dive",
                    description:
                      "Discuss integrations, security, compliance, and technical requirements",
                  },
                  {
                    title: "Pricing Proposal",
                    description:
                      "Receive a custom quote with volume discounts and flexible terms",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Features */}
            <div className="rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 p-6 lg:p-8 dark:border-purple-900/30 dark:from-purple-950/30 dark:to-pink-950/30">
              <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Enterprise Features
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Zap, text: "Unlimited PDFs" },
                  { icon: Shield, text: "SOC 2 Certified" },
                  { icon: Users, text: "Unlimited Seats" },
                  { icon: Globe, text: "White-Label" },
                  { icon: Crown, text: "Dedicated Support" },
                  { icon: Sparkles, text: "Custom AI Models" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl bg-white/80 p-3 backdrop-blur-sm dark:bg-slate-800/80"
                  >
                    <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="rounded-3xl border-2 border-purple-200/50 bg-white p-6 text-center dark:border-purple-900/30 dark:bg-slate-900">
              <p className="mb-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Trusted by leading organizations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                <span className="rounded-full bg-gray-100 px-4 py-2 dark:bg-slate-800">
                  Fortune 500
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 dark:bg-slate-800">
                  SOC 2 Type II
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 dark:bg-slate-800">
                  GDPR Compliant
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 dark:bg-slate-800">
                  99.9% Uptime
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
