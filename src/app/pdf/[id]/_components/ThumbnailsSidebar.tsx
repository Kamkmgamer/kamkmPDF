"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { api } from "~/trpc/react";
import type { Job } from "~/types/pdf";

// Configure PDF.js worker (use jsDelivr to avoid CORS/MIME issues seen with unpkg)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Get PDF URL from tRPC
  const { data: downloadUrl } = api.files.getDownloadUrl.useQuery(
    { fileId },
    {
      enabled: !!fileId && job.status === "completed",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  useEffect(() => {
    if (downloadUrl?.url) {
      setPdfUrl(downloadUrl.url);
      setIsLoading(false);
    }
  }, [downloadUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (_error: Error) => {
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="bg-opacity-50 fixed inset-0 z-40 bg-black md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[--color-border] bg-[--color-surface] transition-transform duration-300 ease-in-out md:static ${isOpen ? "translate-x-0" : "-translate-x-full"} md:block md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--color-border] p-4">
          <h3 className="text-sm font-semibold text-[--color-text-primary]">
            Pages ({totalPages})
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[--color-base] md:hidden"
            aria-label="Close thumbnails"
          >
            <svg
              className="h-5 w-5"
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
        <div className="max-h-[calc(100vh-80px)] flex-1 space-y-2 overflow-y-auto p-2 md:max-h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : pdfUrl ? (
            <Document
              file={pdfUrl}
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
                />
              ))}
            </Document>
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
}

function ThumbnailItem({
  pageNumber,
  isSelected,
  onClick,
}: ThumbnailItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border-2 p-2 text-left transition-all duration-200 ${
        isSelected
          ? "border-[--color-primary] bg-blue-500/10"
          : "border-[--color-border] hover:bg-[--color-base]"
      } `}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="flex items-center space-x-3">
        <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded border bg-[--color-base]">
          <Page
            pageNumber={pageNumber}
            scale={0.2}
            loading={
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-[--color-text-muted]"></div>
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
          <p className="text-sm font-medium text-[--color-text-primary]">
            Page {pageNumber}
          </p>
        </div>
      </div>
    </button>
  );
}
