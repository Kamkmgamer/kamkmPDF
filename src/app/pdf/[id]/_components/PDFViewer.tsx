"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { api } from "~/trpc/react";
import type { Job } from "~/types/pdf";

// Configure PDF.js worker (use jsDelivr to avoid CORS/MIME issues seen with unpkg)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileId: string;
  _job: Job;
}

export function PDFViewer({ fileId, _job }: PDFViewerProps) {
  const currentPage = 1;
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Get PDF URL from tRPC
  const {
    data: downloadUrl,
    isLoading: urlLoading,
    error: urlError,
  } = api.files.getDownloadUrl.useQuery({ fileId }, { enabled: !!fileId });

  useEffect(() => {
    if (downloadUrl?.url) {
      setPdfUrl(downloadUrl.url);
      setIsLoading(false);
    } else if (urlError) {
      setError(urlError.message || "Failed to load PDF");
      setIsLoading(false);
    }
  }, [downloadUrl, urlError]);

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
    <div className="flex h-full flex-col bg-gray-100 dark:bg-gray-800">
      {/* PDF Controls */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleZoomOut}
            className="rounded-md border border-gray-300 px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            onClick={handleZoomReset}
            className="rounded-md border border-gray-300 px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="rounded-md border border-gray-300 px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-200 p-4 dark:bg-gray-700">
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
        ) : pdfUrl ? (
          <div className="max-h-full overflow-auto rounded-lg bg-white shadow-lg dark:bg-gray-800">
            <Document
              file={pdfUrl}
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
              <Page
                pageNumber={currentPage}
                scale={zoom}
                loading={
                  <div className="p-4 text-center">
                    <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Loading page...
                    </p>
                  </div>
                }
                error={
                  <div className="p-4 text-center">
                    <p className="text-red-600 dark:text-red-400">
                      Failed to load page
                    </p>
                  </div>
                }
              />
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
