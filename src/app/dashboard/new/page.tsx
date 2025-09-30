"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import DashboardLayout from "../../../_components/DashboardLayout";
import { api } from "~/trpc/react";
import { ArrowLeft, X } from "lucide-react";
import QuotaExceededModal from "~/_components/QuotaExceededModal";

// Tone definition
const tones = [
  "Formal",
  "Friendly",
  "Technical",
  "Persuasive",
  "Concise",
] as const;
type Tone = (typeof tones)[number];

export default function NewPromptPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // State management
  const [prompt, setPrompt] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"cover" | "inline">("inline");
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedTone, setSelectedTone] = React.useState<Tone | null>(null);
  const [showQuotaModal, setShowQuotaModal] = React.useState(false);
  const [quotaInfo, setQuotaInfo] = React.useState<{
    tier: string;
    limit: number;
  } | null>(null);

  const createJob = api.jobs.create.useMutation();
  const { data: subscription } = api.subscription.getCurrent.useQuery();

  // Effects for auth, autosave, and unload warning
  useAuthGuard(isLoaded, isSignedIn ?? false, router);
  useAutosave(prompt, setPrompt);
  useUnloadWarning(prompt, submitting);

  // Constants and validation
  const charCount = prompt.length;
  const maxChars = 2000;
  const isTooLong = charCount > maxChars;
  const isTooShort = prompt.trim().length === 0;

  // Image handling
  const { validateAndSetImage, resetImage } = useImageHandling(
    setImageFile,
    setImagePreview,
    setImageError,
    imagePreview,
  );

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (isTooShort) {
      setError("Please enter a prompt.");
      return;
    }
    if (isTooLong) {
      setError(`Prompt is too long. Maximum ${maxChars} characters.`);
      return;
    }

    const finalPrompt = selectedTone
      ? `${toneSystemPrefix(selectedTone)}

${prompt.trim()}`
      : prompt.trim();

    setSubmitting(true);
    try {
      if (imageFile) {
        // Handle image upload
        const fd = new FormData();
        fd.set("prompt", finalPrompt);
        fd.set("mode", mode);
        fd.set("image", imageFile);
        const res = await fetch("/api/jobs/create-with-image", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data?.error ?? `Upload failed (${res.status})`);
        }
        const data = (await res.json()) as { ok: boolean; id?: string };
        if (data?.id) router.push(`/pdf/${data.id}`);
        else throw new Error("No job id returned");
      } else {
        // Handle text-only job
        const job = await createJob.mutateAsync({ prompt: finalPrompt });
        if (job?.id) router.push(`/pdf/${job.id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      // Check if it's a quota exceeded error
      if (msg.includes("monthly limit") || msg.includes("quota")) {
        setQuotaInfo({
          tier: subscription?.tier ?? "starter",
          limit: subscription?.tierConfig?.quotas?.pdfsPerMonth ?? 5,
        });
        setShowQuotaModal(true);
      } else {
        setError(msg ?? "Failed to create job.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create New PDF
          </h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <PromptEditor
            prompt={prompt}
            setPrompt={setPrompt}
            isTooLong={isTooLong}
            maxChars={maxChars}
            charCount={charCount}
            touched={touched}
            isTooShort={isTooShort}
            error={error}
          />

          <ToneSelector
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
          />

          <ImageUploader
            imagePreview={imagePreview}
            imageError={imageError}
            mode={mode}
            setMode={setMode}
            resetImage={resetImage}
            validateAndSetImage={validateAndSetImage}
          />

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setPrompt("");
                resetImage();
                setError(null);
                setTouched(false);
              }}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear All
            </button>
            <button
              type="submit"
              disabled={submitting || isTooShort || isTooLong}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              )}
              {submitting ? "Converting..." : "Convert to PDF"}
            </button>
          </div>
        </form>
      </div>

      {/* Quota Exceeded Modal */}
      {quotaInfo && (
        <QuotaExceededModal
          isOpen={showQuotaModal}
          onClose={() => setShowQuotaModal(false)}
          currentTier={quotaInfo.tier}
          quotaType="pdfs"
          limit={quotaInfo.limit}
        />
      )}
    </DashboardLayout>
  );
}

// Extracted Components
interface PromptEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isTooLong: boolean;
  maxChars: number;
  charCount: number;
  touched: boolean;
  isTooShort: boolean;
  error: string | null;
}
function PromptEditor({
  prompt,
  setPrompt,
  isTooLong,
  maxChars,
  charCount,
  touched,
  isTooShort,
  error,
}: PromptEditorProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <label
        htmlFor="prompt"
        className="block text-lg font-semibold text-gray-900 dark:text-white"
      >
        Your Prompt
      </label>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Describe the document you want to create. Be specific for the best
        results.
      </p>
      <textarea
        id="prompt"
        className={`mt-4 block w-full resize-y rounded-xl border-gray-300 px-4 py-3 text-base shadow-sm transition focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${isTooLong ? "border-red-500 ring-red-500" : ""}`}
        rows={8}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A professional resume for a software engineer with 3 years of experience..."
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className={`text-gray-500 ${isTooLong ? "text-red-600" : ""}`}>
          {charCount} / {maxChars}
        </div>
        {((touched && isTooShort) || error) && (
          <div className="text-sm text-red-600">
            {isTooShort ? "Please enter a prompt." : error}
          </div>
        )}
      </div>
    </div>
  );
}

interface ToneSelectorProps {
  selectedTone: Tone | null;
  setSelectedTone: (tone: Tone | null) => void;
}
function ToneSelector({ selectedTone, setSelectedTone }: ToneSelectorProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Choose a Tone
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {tones.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => setSelectedTone(selectedTone === tone ? null : tone)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedTone === tone ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ImageUploaderProps {
  imagePreview: string | null;
  imageError: string | null;
  mode: "cover" | "inline";
  setMode: (mode: "cover" | "inline") => void;
  resetImage: () => void;
  validateAndSetImage: (file: File) => void;
}
function ImageUploader({
  imagePreview,
  imageError,
  mode,
  setMode,
  resetImage,
  validateAndSetImage,
}: ImageUploaderProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Optional Image
      </h3>
      <div className="mt-4">
        {imagePreview ? (
          <div className="flex items-center gap-4">
            <Image
              src={imagePreview}
              alt="Preview"
              width={100}
              height={100}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Placement:
                </span>
                <div className="flex gap-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value="inline"
                      checked={mode === "inline"}
                      onChange={() => setMode("inline")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    Inline
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value="cover"
                      checked={mode === "cover"}
                      onChange={() => setMode("cover")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    Cover
                  </label>
                </div>
              </div>
              <button
                onClick={resetImage}
                className="mt-3 flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" /> Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file) validateAndSetImage(file);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 dark:border-gray-600"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop an image, or{" "}
                <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                  browse
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) validateAndSetImage(f);
                    }}
                  />
                </label>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG or JPEG, up to 8MB
              </p>
            </div>
          </div>
        )}
        {imageError && (
          <p className="mt-2 text-sm text-red-600">{imageError}</p>
        )}
      </div>
    </div>
  );
}

// Hooks

function useAuthGuard(
  isLoaded: boolean,
  isSignedIn: boolean,
  router: AppRouterInstance,
) {
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/dashboard/new");
    }
  }, [isLoaded, isSignedIn, router]);
}

function useAutosave(prompt: string, setPrompt: (p: string) => void) {
  React.useEffect(() => {
    const saved = localStorage.getItem("dashboard:new:prompt");
    if (saved && !prompt) setPrompt(saved);
  }, [prompt, setPrompt]);

  React.useEffect(() => {
    localStorage.setItem("dashboard:new:prompt", prompt);
  }, [prompt]);
}

function useUnloadWarning(prompt: string, submitting: boolean) {
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (prompt.trim() && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [prompt, submitting]);
}

function useImageHandling(
  setImageFile: (file: File | null) => void,
  setImagePreview: (preview: string | null) => void,
  setImageError: (error: string | null) => void,
  imagePreview: string | null,
) {
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
  const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);

  const resetImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setImageError(null);
  };

  const validateAndSetImage = async (file: File) => {
    setImageError(null);
    if (!ACCEPTED_TYPES.has(file.type)) {
      setImageError("Unsupported file type. Use PNG or JPEG.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("File too large. Max 8MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      // Dimension check can be added here if needed
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(url);
      setImageFile(file);
    } catch {
      URL.revokeObjectURL(url);
      setImageError("Could not read image.");
    }
  };

  return { validateAndSetImage, resetImage };
}

function toneSystemPrefix(tone: Tone) {
  switch (tone) {
    case "Formal":
      return "System: Use a formal, professional tone.";
    case "Friendly":
      return "System: Use a friendly, approachable tone.";
    case "Technical":
      return "System: Use a technical, precise tone.";
    case "Persuasive":
      return "System: Use a persuasive, compelling tone.";
    case "Concise":
      return "System: Use a concise and to-the-point tone.";
  }
}
