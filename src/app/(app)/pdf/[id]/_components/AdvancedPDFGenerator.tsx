"use client";

import React, { useRef, useState, useEffect } from "react";

interface AdvancedPDFGeneratorProps {
  html: string;
  filename?: string;
  options?: {
    format?: "A4" | "Letter";
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    landscape?: boolean;
  };
  onGenerated?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

export function AdvancedPDFGenerator({
  html,
  filename: _filename = "document.pdf",
  options = {},
  onGenerated,
  onError,
}: AdvancedPDFGeneratorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if the browser supports the necessary features
    const checkSupport = () => {
      const hasPrint = typeof window !== "undefined" && "print" in window;
      const hasIframe = typeof document !== "undefined" && "createElement" in document;
      setIsSupported(hasPrint && hasIframe);
    };
    checkSupport();
  }, []);

  const generatePDFBlob = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!iframeRef.current) {
        reject(new Error("Iframe not available"));
        return;
      }

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      
      if (!iframeDoc) {
        reject(new Error("Could not access iframe document"));
        return;
      }

      // Set up print styles
      const printStyles = `
        @page {
          margin: ${options.margin?.top ?? "20mm"} ${options.margin?.right ?? "15mm"} ${options.margin?.bottom ?? "20mm"} ${options.margin?.left ?? "15mm"};
          size: ${options.format ?? "A4"} ${options.landscape ? "landscape" : "portrait"};
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body {
          font-family: 'Noto Naskh Arabic', 'Noto Sans Arabic', 'Amiri', Arial, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.4;
        }
        
        [dir="rtl"] {
          direction: rtl;
          text-align: right;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        
        th, td {
          border: 1px solid #e2e8f0;
          padding: 8px;
          text-align: right;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .avoid-page-break {
          page-break-inside: avoid;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `;

      // Write content to iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>${printStyles}</style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to render and fonts to load
      iframe.onload = () => {
        setTimeout(() => {
          try {
            // Use window.print() which will trigger the browser's print dialog
            // The user can then choose "Save as PDF"
            iframe.contentWindow?.print();
            resolve(new Blob()); // Empty blob as we can't programmatically get the PDF
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        }, 1000);
      };
    });
  };

  const generatePDF = async () => {
    if (!isSupported) {
      onError?.(new Error("Browser not supported"));
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDFBlob();
      onGenerated?.(new Blob());
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      onError?.(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const printPDF = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              margin: ${options.margin?.top ?? "20mm"} ${options.margin?.right ?? "15mm"} ${options.margin?.bottom ?? "20mm"} ${options.margin?.left ?? "15mm"};
              size: ${options.format ?? "A4"} ${options.landscape ? "landscape" : "portrait"};
            }
            
            body {
              font-family: 'Noto Naskh Arabic', 'Noto Sans Arabic', 'Amiri', Arial, sans-serif;
              margin: 0;
              padding: 0;
              line-height: 1.4;
            }
            
            [dir="rtl"] {
              direction: rtl;
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Trigger print after content loads
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 500);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Your browser doesn&apos;t support client-side PDF generation. 
          Please use a modern browser or try our server-side generation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </span>
          ) : (
            "Generate PDF"
          )}
        </button>
        <button
          onClick={printPDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Print PDF
        </button>
      </div>
      
      {/* Hidden iframe for PDF generation */}
      <iframe
        ref={iframeRef}
        className="hidden"
        title="PDF Generator"
        sandbox="allow-same-origin allow-scripts allow-print"
      />
    </div>
  );
}
