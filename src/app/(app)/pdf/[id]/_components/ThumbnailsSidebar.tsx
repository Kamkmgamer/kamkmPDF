"use client";

import { useState, useEffect, useMemo } from "react";
import type * as ReactPdf from "react-pdf";
import { api } from "~/trpc/react";
import type { Job } from "~/types/pdf";

type ReactPdfModule = typeof ReactPdf;

interface ThumbnailsSidebarProps {
  fileId: string;
  job: Job;
  currentPage: number;
  onPageSelect: (pageNumber: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ThumbnailsSidebar({
  fileId,
  job,
  currentPage,
  onPageSelect,
  isOpen,
  onClose,
}: ThumbnailsSidebarProps) {
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfSource, setPdfSource] = useState<string | Uint8Array | null>(null);
  const [reactPdf, setReactPdf] = useState<ReactPdfModule | null>(null);
  const [inlineLoaded, setInlineLoaded] = useState(false);

  useEffect(() => {
    setInlineLoaded(false);
    setPdfSource(null);
    setIsLoading(true);
  }, [fileId]);

  // Lazy-load react-pdf to ensure pdfjs only runs in the browser
  useEffect(() => {
    let mounted = true;

    void import("react-pdf")
      .then((mod) => {
        if (!mounted) return;
        mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
        setReactPdf(mod);
      })
      .catch((error) => {
        console.error("Failed to load react-pdf", error);
        setReactPdf(null);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Get PDF URL from tRPC
  const { data: downloadUrl, error: downloadError } =
    api.files.getDownloadUrl.useQuery(
      { fileId },
      {
        enabled: !!fileId && job.status === "completed",
        refetchInterval: (query) =>
          query.state.data?.url?.startsWith("data:") && !inlineLoaded
            ? 3000
            : false,
      },
    );

  useEffect(() => {
    if (!downloadUrl?.url) {
      if (downloadError) {
        console.error("Thumbnail download error", downloadError);
        setIsLoading(false);
      }
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const url = downloadUrl.url;
        if (url.startsWith("data:")) {
          setIsLoading(true);
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) {
            throw new Error(`Inline PDF fetch failed: ${response.status}`);
          }
          const buffer = await response.arrayBuffer();
          if (cancelled) return;
          setPdfSource(new Uint8Array(buffer));
          setInlineLoaded(true);
        } else {
          setPdfSource(url);
          setInlineLoaded(false);
        }
        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load inline PDF for thumbnails", err);
        setPdfSource(null);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [downloadUrl, downloadError]);

  const documentSource = useMemo(() => {
    if (!pdfSource) return null;
    if (typeof pdfSource === "string") return pdfSource;
    return { data: pdfSource };
  }, [pdfSource]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
  };
  const onDocumentLoadError = (_error: Error) => {
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const DocumentComponent = reactPdf?.Document;
  const PageComponent = reactPdf?.Page;
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[--color-border] bg-[--color-surface] shadow-2xl transition-transform duration-300 ease-in-out sm:w-80 md:static md:w-64 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"} md:block md:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-[--color-border] p-4 sm:p-5 md:p-4">
          <h3 className="text-base font-bold text-[--color-text-primary] sm:text-lg md:text-sm">
            Pages ({totalPages})
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-[--color-base] active:scale-95 md:hidden"
            aria-label="Close thumbnails"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Thumbnails Container */}
        <div className="max-h-[calc(100vh-80px)] flex-1 space-y-2.5 overflow-y-auto p-3 sm:space-y-3 sm:p-4 md:max-h-[calc(100vh-200px)] md:space-y-2 md:p-2">
          {isLoading || !DocumentComponent || !PageComponent ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : documentSource ? (
            <DocumentComponent
              file={documentSource}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              }
            >
              {Array.from(new Array(totalPages), (_, index) => (
                <ThumbnailItem
                  key={index + 1}
                  pageNumber={index + 1}
                  isSelected={currentPage === index + 1}
                  onClick={() => onPageSelect(index + 1)}
                  PageComponent={PageComponent}
                />
              ))}
            </DocumentComponent>
          ) : (
            <div className="py-8 text-center text-[--color-text-muted]">
              <p className="text-sm">No PDF available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface ThumbnailItemProps {
  pageNumber: number;
  isSelected: boolean;
  onClick: () => void;
  PageComponent: ReactPdfModule["Page"];
}

function ThumbnailItem({
  pageNumber,
  isSelected,
  onClick,
  PageComponent,
}: ThumbnailItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 sm:p-3 md:p-2 ${
        isSelected
          ? "border-[--color-primary] bg-blue-500/10 shadow-sm"
          : "border-[--color-border] hover:bg-[--color-base]"
      } `}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded border bg-[--color-base] sm:h-24 sm:w-20 md:h-16 md:w-12">
          <PageComponent
            pageNumber={pageNumber}
            scale={0.2}
            loading={
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[--color-text-muted]"></div>
              </div>
            }
            error={
              <div className="flex h-full w-full items-center justify-center text-xs text-[--color-text-muted]">
                Error
              </div>
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[--color-text-primary] sm:text-base md:text-sm">
            Page {pageNumber}
          </p>
        </div>
      </div>
    </button>
  );
}
