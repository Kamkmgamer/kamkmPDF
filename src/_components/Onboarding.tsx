"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Upload,
  Sparkles,
  Download,
  Rocket,
} from "lucide-react";

interface OnboardingStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    id: 0,
    icon: <Rocket className="h-12 w-12" />,
    title: "Welcome to KamkmPDF!",
    description:
      "Let's show you how easy it is to create professional PDFs in seconds.",
    gradient: "from-blue-500 via-cyan-500 to-sky-500",
  },
  {
    id: 1,
    icon: <Upload className="h-12 w-12" />,
    title: "Start with a prompt",
    description:
      "Simply describe what you want to create, and our AI will generate a beautiful document.",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    id: 2,
    icon: <Sparkles className="h-12 w-12" />,
    title: "AI does the magic",
    description:
      "Watch as your prompt transforms into a professionally formatted PDF instantly.",
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
  },
  {
    id: 3,
    icon: <Download className="h-12 w-12" />,
    title: "Download & Share",
    description:
      "Your PDF is ready! Download it, share it, or create another one.",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    if (!onboardingCompleted) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("onboardingCompleted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative mx-4 w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-2xl sm:p-10 dark:border-white/10 dark:bg-slate-900/95">
            {/* Animated background gradient */}
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className={`absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br ${currentStepData.gradient} opacity-20 blur-3xl`}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Skip button */}
            <motion.button
              onClick={handleSkip}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div
                key={currentStep}
                className={`mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${currentStepData.gradient} shadow-2xl`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <div className="text-white">{currentStepData.icon}</div>
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${currentStep}`}
                className="mb-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {currentStepData.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                key={`desc-${currentStep}`}
                className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {currentStepData.description}
              </motion.p>

              {/* Progress dots */}
              <div className="mb-8 flex gap-2">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "w-8 bg-gradient-to-r from-blue-600 to-cyan-600"
                        : "w-2 bg-slate-300 dark:bg-slate-600"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <motion.button
                  onClick={handleNext}
                  className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/50"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{isLastStep ? "Get Started" : "Next"}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.button>

                {!isLastStep && (
                  <motion.button
                    onClick={handleSkip}
                    className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Skip
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
