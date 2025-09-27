"use client";

import React from "react";
import { api } from "~/trpc/react";

// Type definitions for PDF.js - simplified to avoid conflicts with actual library types
interface PDFJSGlobal {
  GlobalWorkerOptions: {
    workerSrc: string;
    _workerSet?: boolean;
  };
  getDocument: (options: { url: string; withCredentials: boolean }) => {
    promise: Promise<unknown>;
  };
}

// Renders the first page of a PDF into a canvas when visible.
// Uses a signed URL from getDownloadUrl for security.
export default function PdfThumbnail({ fileId }: { fileId: string }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [inView, setInView] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Observe visibility
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "150px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { data, isLoading } = api.files.getDownloadUrl.useQuery(
    { fileId },
    { enabled: inView },
  );

  React.useEffect(() => {
    async function render() {
      if (!data?.url || !canvasRef.current) return;
      setError(null);
      try {
        // Ensure DOMMatrix exists in the runtime (some browsers expose WebKitCSSMatrix only)
        try {
          const w = window as unknown as Record<string, unknown>;
          if (typeof w.DOMMatrix === "undefined") {
            w.DOMMatrix =
              w.WebKitCSSMatrix ??
              w.MSCSSMatrix ??
              class DOMMatrixPolyfill {
                a = 1;
                b = 0;
                c = 0;
                d = 1;
                e = 0;
                f = 0;
                multiplySelf() {
                  return this;
                }
                translateSelf() {
                  return this;
                }
                scaleSelf() {
                  return this;
                }
                rotateSelf() {
                  return this;
                }
              };
          }
        } catch {}

        // Dynamically import pdfjs to avoid server-side module evaluation (DOMMatrix not defined)
        const pdfjsLib = await import("pdfjs-dist");
        const GlobalWorkerOptions = (pdfjsLib as unknown as PDFJSGlobal)
          .GlobalWorkerOptions;
        const getDocument = (pdfjsLib as unknown as PDFJSGlobal).getDocument;

        // Ensure worker is configured once
        try {
          if (!GlobalWorkerOptions._workerSet) {
            GlobalWorkerOptions.workerSrc = new URL(
              "pdfjs-dist/build/pdf.worker.min.mjs",
              import.meta.url,
            ).toString();
            GlobalWorkerOptions._workerSet = true;
          }
        } catch {}

        const loadingTask = getDocument({
          url: data.url,
          withCredentials: false,
        });
        const pdf = await loadingTask.promise;
        const page = await (
          pdf as { getPage: (pageNumber: number) => Promise<unknown> }
        ).getPage(1);

        // Calculate high-DPI scale based on the rendered size in the grid
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const cssWidth = Math.max(1, rect.width);
        const cssHeight = Math.max(1, rect.height);
        const dpr = Math.max(1, window.devicePixelRatio ?? 1);
        const quality = 5;

        const baseViewport = (
          page as {
            getViewport: (options: { scale: number }) => {
              width: number;
              height: number;
            };
          }
        ).getViewport({ scale: 1 });
        const scaleValue = (cssWidth * dpr * quality) / baseViewport.width;
        const viewport = (
          page as {
            getViewport: (options: { scale: number }) => {
              width: number;
              height: number;
            };
          }
        ).getViewport({ scale: scaleValue });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Backing store size for crisp rendering
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        // CSS size to fit the card area
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        await (
          page as {
            render: (options: {
              canvasContext: CanvasRenderingContext2D;
              viewport: { width: number; height: number };
              canvas: HTMLCanvasElement;
            }) => { promise: Promise<void> };
          }
        ).render({ canvasContext: context, viewport, canvas }).promise;
      } catch {
        setError("thumbnail-failed");
      }
    }
    void render();
  }, [data?.url]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-[--color-text-muted]">
          Loading…
        </div>
      )}
      <canvas ref={canvasRef} className="h-full w-full object-cover" />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[--color-primary]/10 text-[--color-primary]">
            📄
          </div>
          <div className="line-clamp-3 text-xs text-[--color-text-muted]">
            Preview unavailable
          </div>
        </div>
      )}
    </div>
  );
}
