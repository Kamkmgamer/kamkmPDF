"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";

interface PromptOptions {
  title?: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  // Return a string to show an inline error; return null if valid
  validate?: (value: string) => string | null;
}

interface PromptProps extends PromptOptions {
  onResolve: (value: string | null) => void;
}

function ToastPromptUI({
  title = "Name your file",
  message = "Enter a filename for your download.",
  defaultValue = "document",
  placeholder = "e.g. My PDF",
  confirmText = "Save",
  cancelText = "Cancel",
  validate,
  onResolve,
}: PromptProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const handleConfirm = useCallback(() => {
    const v = value.trim();
    const msg = validate ? validate(v) : null;
    if (msg) {
      setError(msg);
      return;
    }
    onResolve(v || defaultValue);
  }, [value, defaultValue, validate, onResolve]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onResolve(null);
      if (e.key === "Enter") handleConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleConfirm, onResolve]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="pointer-events-auto relative w-full max-w-md rounded-xl border border-[--color-border] bg-white shadow-2xl ring-1 ring-black/10 dark:border-gray-600 dark:bg-gray-800 dark:shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toast-prompt-title"
        >
          <div className="p-4 sm:p-5">
            <div className="mb-3">
              <h3
                id="toast-prompt-title"
                className="text-sm font-semibold text-[--color-text]"
              >
                {title}
              </h3>
              {message && (
                <p className="mt-1 text-sm text-[--color-text-muted]">
                  {message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={inputRef}
                type="text"
                className="w-full rounded-md border border-[--color-border] bg-[--color-base] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[--color-primary] dark:border-white/10 dark:bg-neutral-800 dark:text-white"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => onResolve(null)}
                className="rounded-md border border-[--color-border] px-3 py-1.5 text-sm hover:bg-[--color-base] dark:border-white/10"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:opacity-95"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function toastPrompt(
  options: PromptOptions = {},
): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  return new Promise((resolve) => {
    function cleanup() {
      try {
        root.unmount();
      } catch {}
      if (container.parentNode) container.parentNode.removeChild(container);
    }

    function handleResolve(value: string | null) {
      cleanup();
      resolve(value);
    }

    root.render(<ToastPromptUI {...options} onResolve={handleResolve} />);
  });
}
