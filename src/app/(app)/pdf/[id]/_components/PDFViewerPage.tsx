"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { Toolbar } from "./Toolbar";
import type { GenerationStage } from "~/types/pdf";
import { LoadingStates } from "./LoadingStates";
import { ErrorBoundary, ErrorBoundaryWrapper } from "./ErrorBoundary";
import { ThumbnailsSidebar } from "./ThumbnailsSidebar";
import { ShareModal } from "./ShareModal";
import { RegenerateModal, type RegenerateData } from "./RegenerateModal";
import { toastPrompt } from "~/_components/ToastPrompt";
import SignInPromptModal from "~/_components/SignInPromptModal";

// Dynamically import PDFViewer with SSR disabled to prevent DOMMatrix issues
const PDFViewer = dynamic(
  () => import("./PDFViewer").then((mod) => ({ default: mod.PDFViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading PDF viewer...
          </p>
        </div>
      </div>
    ),
  },
);

interface PDFViewerPageProps {
  jobId: string;
}

export function PDFViewerPage({ jobId }: PDFViewerPageProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationStatus, setRegenerationStatus] = useState<string>("");
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  // Fetch job data with polling (reverted from SSE due to Netlify timeout issues)
  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = api.jobs.get.useQuery(jobId, {
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current) return 2000;
      return current.status === "completed" && current.resultFileId
        ? false
        : 2000;
    },
  });

  const currentJob = job;

  // Show a transient banner when the job transitions to completed
  useEffect(() => {
    const prev = prevStatusRef.current;
    const status = job?.status ?? null;
    if (
      status &&
      prev &&
      prev !== status &&
      status === "completed" &&
      !isRegenerating
    ) {
      setShowReadyBanner(true);
      const t = setTimeout(() => setShowReadyBanner(false), 2500);
      return () => clearTimeout(t);
    }
    prevStatusRef.current = status;
  }, [currentJob?.status, isRegenerating]);

  // We keep getDownloadUrl for preview components elsewhere; for the download button
  // we call our own API route to allow a custom filename via Content-Disposition.

  const shareMutation = api.files.createShareLink.useMutation();
  const regenerateMutation = api.jobs.recreate.useMutation();
  const { data: subscription } = api.subscription.getCurrent.useQuery(
    undefined,
    {
      enabled: isSignedIn ?? false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  // Handle download with custom filename toast prompt
  const handleDownload = async () => {
    if (!currentJob?.resultFileId) return;

    try {
      // Suggest a default name based on the prompt or job id
      const defaultBase = (
        currentJob.prompt?.trim() ?? `document-${currentJob.id}`
      ).slice(0, 50);
      const suggested = defaultBase ?? "document";

      const input = await toastPrompt({
        title: "Name your PDF",
        message: "Enter a filename for your download.",
        defaultValue: suggested,
        placeholder: "e.g. Proposal v1",
        confirmText: "Download",
        validate: (v) => {
          const val = v.trim();
          if (!val) return "Please enter a name";
          if (val.length > 100) return "Name is too long (max 100)";
          return null;
        },
      });

      if (input === null) return; // user cancelled
      const name = input.trim();
      const filename = name.toLowerCase().endsWith(".pdf")
        ? name
        : `${name}.pdf`;

      const url = `/api/files/${currentJob.resultFileId}/download?filename=${encodeURIComponent(filename)}`;
      window.open(url, "_blank");

      // Show sign-in modal for unauthenticated users after download
      if (!isSignedIn) {
        // Small delay to let the download start
        setTimeout(() => {
          setShowSignInModal(true);
        }, 500);
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!currentJob?.resultFileId) return;

    try {
      const result = await shareMutation.mutateAsync({
        fileId: currentJob.resultFileId,
      });
      setShareUrl(result.url);
      setShowShareModal(true);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  // Handle regenerate with live status updates
  const handleRegenerate = async (data: RegenerateData) => {
    try {
      setIsRegenerating(true);
      setRegenerationStatus("Starting regeneration...");

      let newJobId: string;

      // Check if we have images to upload
      if (data.images && data.images.length > 0) {
        // Use form data API for image uploads
        const formData = new FormData();
        formData.append("jobId", jobId);
        formData.append("mode", data.mode);
        if (data.newPrompt) {
          formData.append("newPrompt", data.newPrompt);
        }
        data.images.forEach((image) => {
          formData.append("images", image);
        });

        const response = await fetch("/api/jobs/regenerate-with-images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? "Failed to regenerate");
        }

        const result = (await response.json()) as { id: string };
        newJobId = result.id;
      } else {
        // Use tRPC mutation for text-only regeneration
        const result = await regenerateMutation.mutateAsync({
          jobId,
          mode: data.mode,
          newPrompt: data.newPrompt,
        });
        newJobId = result?.id ?? jobId;
      }

      setShowRegenerateModal(false);
      setRegenerationStatus("Regeneration started. Checking status...");

      // Navigate to the new job
      router.push(`/pdf/${newJobId}`);
    } catch (error) {
      console.error("Regenerate failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start regeneration";
      setRegenerationStatus(errorMessage);
      setIsRegenerating(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return <LoadingStates type="loading" />;
  }

  // Error state
  if (error || !job) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 sm:h-16 sm:w-16 dark:bg-red-900">
              <svg
                className="h-7 w-7 text-red-600 sm:h-8 sm:w-8 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
              Job not found
            </h2>
            <p className="mb-6 px-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
              {error?.message ?? "The requested job could not be found."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-95 sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Processing state
  if (
    currentJob &&
    (currentJob.status === "processing" || currentJob.status === "queued")
  ) {
    // If we're regenerating, show the regeneration status
    if (isRegenerating) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-2 border-blue-600 sm:h-16 sm:w-16"></div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
              Regenerating PDF
            </h2>
            <p className="mb-4 px-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
              {regenerationStatus}
            </p>
            <div className="mx-auto h-2 w-full max-w-xs rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 animate-pulse rounded-full bg-blue-600"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="mt-3 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              This may take a few moments...
            </p>
          </div>
        </div>
      );
    }
    const pct = Math.min(
      99,
      Math.max(
        0,
        currentJob.progress ?? (currentJob.status === "processing" ? 20 : 5),
      ),
    );
    const allowed: GenerationStage[] = [
      "Processing PDF",
      "Analyzing your request",
      "Generating content",
      "Formatting PDF",
      "Finalizing document",
    ];
    const stageStr =
      currentJob.stage ??
      (currentJob.status === "queued" ? "Processing PDF" : undefined);
    const stage = allowed.includes(stageStr as GenerationStage)
      ? (stageStr as GenerationStage)
      : undefined;
    return <LoadingStates type="processing" progress={pct} stage={stage} />;
  }

  // Failed state
  if (currentJob?.status === "failed") {
    return (
      <ErrorBoundaryWrapper
        error={
          currentJob.errorMessage ??
          "The PDF generation failed. Please try regenerating."
        }
        onRetry={() => refetch()}
      />
    );
  }

  // Completed state - show PDF viewer
  if (currentJob?.status === "completed" && currentJob?.resultFileId) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        {showReadyBanner && (
          <div className="z-10 w-full bg-green-50 px-4 py-3 text-center text-xs font-medium text-green-700 shadow-sm sm:py-2 sm:text-sm dark:bg-green-900/30 dark:text-green-200">
            ✓ PDF ready. You can view, download, or share it now.
          </div>
        )}
        <Toolbar
          job={job}
          onBack={() => router.push("/dashboard")}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onShare={handleShare}
          onRegenerate={() => setShowRegenerateModal(true)}
          onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
          isRegenerating={isRegenerating}
        />

        <div className="relative flex flex-1 overflow-hidden">
          <ThumbnailsSidebar
            fileId={currentJob.resultFileId}
            job={currentJob}
            currentPage={1}
            onPageSelect={() => {
              // Page navigation handled by PDFViewer component
            }}
            isOpen={showThumbnails}
            onClose={() => setShowThumbnails(false)}
          />

          <div className="relative flex-1 overflow-hidden bg-gray-200 dark:bg-gray-800">
            <PDFViewer fileId={currentJob.resultFileId} _job={currentJob} />

            {/* Regeneration Status Overlay */}
            {isRegenerating && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl sm:max-w-md sm:p-8 dark:bg-gray-800">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 sm:mb-5 sm:h-14 sm:w-14"></div>
                  <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl dark:text-gray-100">
                    Regenerating PDF
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 sm:mb-5 sm:text-base dark:text-gray-400">
                    {regenerationStatus}
                  </p>
                  <div className="mx-auto h-2 w-full max-w-xs rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 animate-pulse rounded-full bg-blue-600"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm dark:text-gray-400">
                    This may take a few moments...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={shareUrl}
        />

        <RegenerateModal
          isOpen={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onRegenerate={handleRegenerate}
          job={job}
          userCredits={
            subscription
              ? subscription.tierConfig.quotas.pdfsPerMonth === -1
                ? -1
                : subscription.tierConfig.quotas.pdfsPerMonth -
                  subscription.pdfsUsedThisMonth
              : 0
          }
          isRegenerating={isRegenerating}
        />

        <SignInPromptModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
        />
      </div>
    );
  }

  // Fallback
  return <LoadingStates type="error" />;
}
