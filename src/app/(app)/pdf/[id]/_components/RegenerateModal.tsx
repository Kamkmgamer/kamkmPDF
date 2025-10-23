"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import type { Job } from "~/types/pdf";

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (data: RegenerateData) => Promise<void>;
  job: Job;
  userCredits?: number;
  isRegenerating?: boolean;
}

export interface RegenerateData {
  mode: "same" | "edit";
  newPrompt?: string;
  images?: File[];
}

export function RegenerateModal({
  isOpen,
  onClose,
  onRegenerate,
  job,
  userCredits = 10, // Default fallback
  isRegenerating = false,
}: RegenerateModalProps) {
  const [newPrompt, setNewPrompt] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasNewContent = newPrompt.trim().length > 0 || images.length > 0;
  const creditCost = hasNewContent ? 0.5 : 1;
  const hasEnoughCredits = userCredits === -1 || userCredits >= creditCost;

  // Handle file selection
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      // Validate file size (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        setError("Image size must be less than 8MB");
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError(null);
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  // Remove image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]!);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle regeneration
  const handleSubmit = async (mode: "same" | "edit") => {
    if (mode === "edit" && !hasNewContent) {
      setError("Please add a new prompt or upload images");
      return;
    }

    if (!hasEnoughCredits) {
      setError(`You need ${creditCost} credits to regenerate this PDF`);
      return;
    }

    try {
      await onRegenerate({
        mode,
        newPrompt: newPrompt.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      });

      // Clean up
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    }
  };

  // Cleanup on unmount
  const handleClose = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);
    setNewPrompt("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl sm:rounded-3xl dark:border-gray-700 dark:bg-gray-900"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6 dark:border-gray-700 dark:bg-gray-900/95">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 sm:h-10 sm:w-10 sm:rounded-xl">
                <Sparkles className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-gray-900 sm:text-xl dark:text-white">
                  Regenerate or Modify PDF
                </h2>
                <p className="hidden text-sm text-gray-600 sm:block dark:text-gray-400">
                  Edit your document with AI assistance
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isRegenerating}
              className="flex-shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100 active:scale-95 disabled:opacity-50 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            {/* Description */}
            <div className="rounded-xl bg-blue-50 p-3 sm:rounded-2xl sm:p-4 dark:bg-blue-950/30">
              <p className="text-xs leading-relaxed text-blue-900 sm:text-sm dark:text-blue-300">
                You can reuse your last prompt, write a new one to add comments
                or edits, or upload images to replace placeholders. The AI will
                use your previous PDF as a base template.
              </p>
            </div>

            {/* Original Prompt Display */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                Original Prompt
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 sm:rounded-xl sm:p-4 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {job.prompt ?? "No prompt available"}
              </div>
            </div>

            {/* New Prompt Input */}
            <div>
              <label
                htmlFor="new-prompt"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300"
              >
                New Instructions (Optional)
              </label>
              <textarea
                id="new-prompt"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                disabled={isRegenerating}
                placeholder="Write a new prompt or leave empty to use the previous one.&#10;Example: Add a summary section, Change the title to..."
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-xs transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm sm:focus:ring-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                rows={4}
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                Upload New Images (Optional)
              </label>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-3 sm:gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 sm:rounded-xl dark:border-gray-700"
                    >
                      <Image
                        src={preview}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        disabled={isRegenerating}
                        className="absolute top-1.5 right-1.5 rounded-full bg-red-500 p-1.5 text-white opacity-100 transition-opacity group-hover:opacity-100 disabled:opacity-50 sm:top-2 sm:right-2 sm:opacity-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-lg border-2 border-dashed p-6 transition-all sm:rounded-xl sm:p-8 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                } ${isRegenerating ? "opacity-50" : ""}`}
              >
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={isRegenerating}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer flex-col items-center justify-center text-center"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 sm:mb-3 sm:h-12 sm:w-12 dark:bg-gray-700">
                    <Upload className="h-5 w-5 text-gray-600 sm:h-6 sm:w-6 dark:text-gray-400" />
                  </div>
                  <p className="mb-1 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                    Drag & drop images or{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG up to 8MB each
                  </p>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 sm:rounded-xl sm:p-4 sm:text-sm dark:bg-red-950/30 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </motion.div>
            )}

            {/* Credit Info */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 sm:rounded-2xl sm:p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                    Credit Cost
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {hasNewContent
                      ? "With new content: 0.5 credits"
                      : "Same prompt: 1 credit"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {creditCost}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Available: {userCredits === -1 ? "∞" : userCredits}
                  </p>
                </div>
              </div>
              {!hasEnoughCredits && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-800 sm:mt-3 sm:p-3 dark:bg-yellow-950/30 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    You don&lsquo;t have enough credits. Please upgrade your
                    plan or buy more credits.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:gap-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-900/95">
            <button
              onClick={() => handleSubmit("same")}
              disabled={isRegenerating || !hasEnoughCredits}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-xl sm:px-6 sm:py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              ) : (
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>Same Prompt</span>
              <span className="hidden text-xs text-gray-500 sm:inline">(1 credit)</span>
            </button>

            <button
              onClick={() => handleSubmit("edit")}
              disabled={isRegenerating || !hasEnoughCredits || !hasNewContent}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:rounded-xl sm:px-6 sm:py-3"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              ) : (
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>With New Content</span>
              <span className="hidden text-xs opacity-90 sm:inline">(0.5 credits)</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
