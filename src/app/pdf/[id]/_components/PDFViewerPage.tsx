"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "~/trpc/react";
import { Toolbar } from "./Toolbar";
import type { GenerationStage } from "~/types/pdf";
import { LoadingStates } from "./LoadingStates";
import { ErrorBoundary, ErrorBoundaryWrapper } from "./ErrorBoundary";
import { ThumbnailsSidebar } from "./ThumbnailsSidebar";
import { ShareModal } from "./ShareModal";
import { ConfirmModal } from "./ConfirmModal";
import { toastPrompt } from "~/_components/ToastPrompt";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationStatus, setRegenerationStatus] = useState<string>("");
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  // Fetch job data
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
  }, [job?.status, isRegenerating]);

  // We keep getDownloadUrl for preview components elsewhere; for the download button
  // we call our own API route to allow a custom filename via Content-Disposition.

  const shareMutation = api.files.createShareLink.useMutation();
  const regenerateMutation = api.jobs.recreate.useMutation();

  // Handle download with custom filename toast prompt
  const handleDownload = async () => {
    if (!job?.resultFileId) return;

    try {
      // Suggest a default name based on the prompt or job id
      const defaultBase = (job.prompt?.trim() ?? `document-${job.id}`).slice(
        0,
        50,
      );
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

      const url = `/api/files/${job.resultFileId}/download?filename=${encodeURIComponent(filename)}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!job?.resultFileId) return;

    try {
      const result = await shareMutation.mutateAsync({
        fileId: job.resultFileId,
      });
      setShareUrl(result.url);
      setShowShareModal(true);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  // Handle regenerate with live status updates
  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setRegenerationStatus("Starting regeneration...");

      // Start the regeneration
      await regenerateMutation.mutateAsync(jobId);
      setShowConfirmModal(false);
      setRegenerationStatus("Regeneration started. Checking status...");

      // Poll for status updates
      const pollInterval = setInterval(() => {
        void (async () => {
          try {
            const result = await refetch();
            const updatedJob = result.data;

            if (updatedJob?.status === "processing") {
              setRegenerationStatus("Processing your PDF...");
            } else if (updatedJob?.status === "queued") {
              setRegenerationStatus("Queued for processing...");
            } else if (updatedJob?.status === "completed") {
              setRegenerationStatus("Regeneration completed!");
              setIsRegenerating(false);
              clearInterval(pollInterval);
            } else if (updatedJob?.status === "failed") {
              setRegenerationStatus("Regeneration failed. Please try again.");
              setIsRegenerating(false);
              clearInterval(pollInterval);
            }
          } catch (error) {
            console.error("Error polling job status:", error);
            setRegenerationStatus(
              "Error checking status. Please refresh the page.",
            );
            setIsRegenerating(false);
            clearInterval(pollInterval);
          }
        })();
      }, 2000); // Poll every 2 seconds

      // Stop polling after 5 minutes as a safety measure
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isRegenerating) {
          setRegenerationStatus(
            "Status check timed out. Please refresh the page.",
          );
          setIsRegenerating(false);
        }
      }, 300000); // 5 minutes
    } catch (error) {
      console.error("Regenerate failed:", error);
      setRegenerationStatus("Failed to start regeneration. Please try again.");
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
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
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
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Job not found
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {error?.message ?? "The requested job could not be found."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Processing state
  if (job.status === "processing" || job.status === "queued") {
    // If we're regenerating, show the regeneration status
    if (isRegenerating) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Regenerating PDF
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {regenerationStatus}
            </p>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 animate-pulse rounded-full bg-blue-600"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This may take a few moments...
            </p>
          </div>
        </div>
      );
    }
    const pct = Math.min(
      99,
      Math.max(0, job.progress ?? (job.status === "processing" ? 20 : 5)),
    );
    const allowed: GenerationStage[] = [
      "Processing PDF",
      "Analyzing your request",
      "Generating content",
      "Formatting PDF",
      "Finalizing document",
    ];
    const stageStr =
      job.stage ?? (job.status === "queued" ? "Processing PDF" : undefined);
    const stage = allowed.includes(stageStr as GenerationStage)
      ? (stageStr as GenerationStage)
      : undefined;
    return <LoadingStates type="processing" progress={pct} stage={stage} />;
  }

  // Failed state
  if (job.status === "failed") {
    return (
      <ErrorBoundaryWrapper
        error={
          job.errorMessage ??
          "The PDF generation failed. Please try regenerating."
        }
        onRetry={() => refetch()}
      />
    );
  }

  // Completed state - show PDF viewer
  if (job.status === "completed" && job.resultFileId) {
    return (
      <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
        {showReadyBanner && (
          <div className="z-10 w-full bg-green-50 px-3 py-2 text-center text-sm text-green-700 shadow-sm sm:px-4 dark:bg-green-900/30 dark:text-green-200">
            PDF ready. You can view, download, or share it now.
          </div>
        )}
        <Toolbar
          job={job}
          onBack={() => router.push("/dashboard")}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onShare={handleShare}
          onRegenerate={() => setShowConfirmModal(true)}
          onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
          isRegenerating={isRegenerating}
        />

        <div className="relative flex flex-1 overflow-hidden">
          <ThumbnailsSidebar
            fileId={job.resultFileId}
            job={job}
            currentPage={1}
            onPageSelect={(page) => {
              // TODO: Implement page navigation in PDFViewer
              console.log("Navigate to page:", page);
            }}
            isOpen={showThumbnails}
            onClose={() => setShowThumbnails(false)}
          />

          <div className="relative flex-1 overflow-hidden">
            <PDFViewer fileId={job.resultFileId} _job={job} />

            {/* Regeneration Status Overlay */}
            {isRegenerating && (
              <div className="bg-opacity-50 absolute inset-0 z-50 flex items-center justify-center bg-black p-4">
                <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-4 text-center shadow-xl sm:max-w-md sm:p-6 dark:bg-gray-800">
                  <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600 sm:mb-4 sm:h-12 sm:w-12"></div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                    Regenerating PDF
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base dark:text-gray-400">
                    {regenerationStatus}
                  </p>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 animate-pulse rounded-full bg-blue-600"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
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

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleRegenerate}
          title="Regenerate PDF"
          message="Are you sure you want to regenerate this PDF? This will create a new version."
        />
      </div>
    );
  }

  // Fallback
  return <LoadingStates type="error" />;
}
