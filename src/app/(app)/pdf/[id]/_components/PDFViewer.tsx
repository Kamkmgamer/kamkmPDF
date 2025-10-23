"use client";

import { useState, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { api } from "~/trpc/react";
import type { Job } from "~/types/pdf";

// Configure PDF.js worker (use jsDelivr to avoid CORS/MIME issues seen with unpkg)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfSource =
  | { kind: "url"; value: string }
  | { kind: "data"; value: Uint8Array };

interface PDFViewerProps {
  fileId: string;
  _job: Job;
}

export function PDFViewer({ fileId, _job }: PDFViewerProps) {
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<PdfSource | null>(null);
  const [inlineLoaded, setInlineLoaded] = useState(false);

  // Calculate base page width that fits viewport
  const getPageWidth = () => {
    if (typeof window === "undefined") return 600;
    const viewportWidth = window.innerWidth;
    const padding = viewportWidth < 640 ? 24 : 32; // Account for container padding
    const maxWidth = viewportWidth < 640 ? viewportWidth - padding : 800;
    return Math.min(maxWidth, 800) * zoom;
  };

  useEffect(() => {
    // Start with 100% zoom, user can adjust
    setZoom(1);
  }, []);

  useEffect(() => {
    setInlineLoaded(false);
    setPdfSource(null);
    setError(null);
    setIsLoading(true);
  }, [fileId]);

  // Get PDF URL from tRPC
  const {
    data: downloadUrl,
    isLoading: urlLoading,
    error: urlError,
  } = api.files.getDownloadUrl.useQuery(
    { fileId },
    {
      enabled: !!fileId,
      refetchInterval: (query) =>
        query.state.data?.url?.startsWith("data:") && !inlineLoaded
          ? 3000
          : false,
    },
  );

  useEffect(() => {
    if (!downloadUrl?.url) {
      if (urlError) {
        setError(urlError.message || "Failed to load PDF");
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
          setPdfSource({ kind: "data", value: new Uint8Array(buffer) });
          setInlineLoaded(true);
        } else {
          setPdfSource({ kind: "url", value: url });
          setInlineLoaded(false);
        }
        if (!cancelled) {
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load PDF source", err);
        setError("Failed to load PDF");
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [downloadUrl, urlError]);

  const documentFile = useMemo(() => {
    if (!pdfSource) return null;
    if (pdfSource.kind === "url") return pdfSource.value;
    return { data: pdfSource.value };
  }, [pdfSource]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-100 dark:bg-gray-800">
      {/* PDF Controls */}
      <div className="flex flex-col gap-2 border-b border-gray-200 bg-white p-2 sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-center gap-2 sm:justify-start sm:gap-3">
          <button
            onClick={handleZoomOut}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium transition-colors hover:bg-gray-50 active:scale-95 sm:h-8 sm:w-8 sm:text-base dark:border-gray-600 dark:hover:bg-gray-700"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className="flex h-10 min-w-[80px] items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-medium transition-colors hover:bg-gray-50 active:scale-95 sm:h-8 sm:min-w-[70px] dark:border-gray-600 dark:hover:bg-gray-700"
            aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium transition-colors hover:bg-gray-50 active:scale-95 sm:h-8 sm:w-8 sm:text-base dark:border-gray-600 dark:hover:bg-gray-700"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        <div className="flex items-center justify-center text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
          <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-200 p-2 sm:p-4 md:p-6 dark:bg-gray-700">
        {urlLoading || isLoading ? (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
          </div>
        ) : error ? (
          <div className="text-center">
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
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : documentFile ? (
          <div className="mx-auto w-full max-w-full">
            <Document
              file={documentFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-8 text-center">
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading document...
                  </p>
                </div>
              }
              error={
                <div className="p-8 text-center">
                  <p className="text-red-600 dark:text-red-400">
                    Failed to load PDF document
                  </p>
                </div>
              }
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <div key={index + 1} className="mb-4 flex w-full justify-center last:mb-0 sm:mb-6">
                  <div className="bg-white shadow-md dark:bg-gray-800">
                    <Page
                      pageNumber={index + 1}
                      width={getPageWidth()}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="max-w-full"
                      loading={
                        <div className="flex min-h-[400px] items-center justify-center p-4 text-center sm:min-h-[600px]">
                          <div>
                            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Loading page {index + 1}...
                            </p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex min-h-[200px] items-center justify-center p-4 text-center">
                          <p className="text-red-600 dark:text-red-400">
                            Failed to load page {index + 1}
                          </p>
                        </div>
                      }
                    />
                  </div>
                </div>
              ))}
            </Document>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No PDF URL available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
