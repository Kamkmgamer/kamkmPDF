"use client";

import React, { useState, useEffect } from "react";
import { AdvancedPDFGenerator } from "./AdvancedPDFGenerator";
import { detectBrowser, getRecommendedMethod, getPDFSupportMessage } from "~/lib/browser-detection";

interface JobResponse {
  id?: string;
  status?: string;
  errorMessage?: string;
  resultFileId?: string;
}

interface HybridPDFGeneratorProps {
  html: string;
  filename?: string;
  serverSideUrl?: string;
  onGenerated?: (success: boolean, method: "client" | "server") => void;
  onError?: (error: Error, method: "client" | "server") => void;
}

export function HybridPDFGenerator({
  html,
  filename = "document.pdf",
  serverSideUrl = "/api/v1/generate",
  onGenerated,
  onError,
}: HybridPDFGeneratorProps) {
  const browserInfo = detectBrowser();
  const recommendedMethod = getRecommendedMethod();
  const [method, setMethod] = useState<"client" | "server">(recommendedMethod === "server" ? "server" : "client");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [browserMessage, setBrowserMessage] = useState("");

  useEffect(() => {
    setBrowserMessage(getPDFSupportMessage());
  }, []);

  const handleClientGenerated = (_blob: Blob) => {
    // Client-side generation always opens print dialog
    // We consider it successful if no error was thrown
    onGenerated?.(true, "client");
    setIsGenerating(false);
  };

  const handleClientError = (error: Error) => {
    console.warn("Client-side PDF generation failed, offering fallback:", error);
    setShowFallback(true);
    onError?.(error, "client");
    setIsGenerating(false);
  };

  const generateServerSide = async () => {
    setIsGenerating(true);
    setMethod("server");
    
    try {
      const response = await fetch(serverSideUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Client-side fallback generation",
          html: html,
          options: {
            format: "A4",
            printBackground: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = (await response.json()) as JobResponse;
      
      // If we have a job ID, poll for completion
      if (result.id) {
        void pollForCompletion(result.id);
      } else {
        // Direct response
        downloadServerPDF(result);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Server generation failed");
      onError?.(err, "server");
      setIsGenerating(false);
    }
  };

  const pollForCompletion = async (jobId: string) => {
    const pollInterval = setInterval(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/v1/jobs/${jobId}`);
          const job = (await response.json()) as JobResponse;

          if (job.status === "completed") {
            clearInterval(pollInterval);
            downloadServerPDF(job);
          } else if (job.status === "failed") {
            clearInterval(pollInterval);
            throw new Error(job.errorMessage ?? "Server generation failed");
          }
        } catch (error) {
          clearInterval(pollInterval);
          const err = error instanceof Error ? error : new Error("Polling failed");
          onError?.(err, "server");
          setIsGenerating(false);
        }
      })();
    }, 2000);

    // Stop polling after 60 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isGenerating) {
        onError?.(new Error("Server generation timeout"), "server");
        setIsGenerating(false);
      }
    }, 60000);
  };

  const downloadServerPDF = (job: JobResponse) => {
    if (job.resultFileId) {
      const url = `/api/files/${job.resultFileId}/download?filename=${encodeURIComponent(filename)}`;
      window.open(url, "_blank");
      onGenerated?.(true, "server");
    }
    setIsGenerating(false);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    if (method === "client") {
      // Client-side generation will be handled by AdvancedPDFGenerator
    } else {
      void generateServerSide().catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error, "server");
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Browser Detection Info */}
      {browserMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">{browserMessage}</p>
              <p className="text-xs text-blue-700 mt-1">
                Browser: {browserInfo.name.charAt(0).toUpperCase() + browserInfo.name.slice(1)} {browserInfo.version}
                {browserInfo.notes && ` • ${browserInfo.notes}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Method Selection */}
      <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="client"
            checked={method === "client"}
            onChange={(e) => setMethod(e.target.value as "client")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium">
            Browser (Instant)
            <span className="text-xs text-gray-500 ml-1">• No cold start</span>
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="server"
            checked={method === "server"}
            onChange={(e) => setMethod(e.target.value as "server")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium">
            Server (High Quality)
            <span className="text-xs text-gray-500 ml-1">• 2-3s startup</span>
          </span>
        </label>
      </div>

      {/* Generation Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
      >
        {isGenerating ? (
          <span className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {method === "client" ? "Preparing PDF..." : "Generating on server..."}
          </span>
        ) : (
          `Generate PDF (${method === "client" ? "Browser" : "Server"})`
        )}
      </button>

      {/* Client-side generator (hidden when using server) */}
      {method === "client" && (
        <div className="hidden">
          <AdvancedPDFGenerator
            html={html}
            filename={filename}
            onGenerated={handleClientGenerated}
            onError={handleClientError}
          />
        </div>
      )}

      {/* Fallback option */}
      {showFallback && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 mb-3">
            Browser PDF generation isn&apos;t available. Try our server-side generation instead.
          </p>
          <button
            onClick={() => {
              setMethod("server");
              setShowFallback(false);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Use Server Generation
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• <strong>Browser:</strong> Uses your browser&apos;s print-to-PDF. Instant, no cold start.</p>
        <p>• <strong>Server:</strong> Uses our optimized Chromium. Higher quality, 2-3s startup.</p>
      </div>
    </div>
  );
}
