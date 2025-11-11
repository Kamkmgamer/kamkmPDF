"use client";

import React, { useRef, useState } from "react";

interface ClientSidePDFGeneratorProps {
  html: string;
  filename?: string;
  onGenerated?: (success: boolean) => void;
}

export function ClientSidePDFGenerator({
  html,
  filename: _filename = "document.pdf",
  onGenerated,
}: ClientSidePDFGeneratorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!iframeRef.current) return;

    setIsGenerating(true);
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      
      if (!iframeDoc) {
        throw new Error("Could not access iframe document");
      }

      // Write the HTML content to the iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              /* Print-specific styles */
              @page {
                margin: 20mm 15mm;
                size: A4;
              }
              
              body {
                font-family: 'Noto Naskh Arabic', 'Noto Sans Arabic', 'Amiri', Arial, sans-serif;
                margin: 0;
                padding: 0;
                line-height: 1.4;
              }
              
              /* Hide UI elements during print */
              .no-print {
                display: none !important;
              }
              
              /* Ensure proper text direction for RTL content */
              [dir="rtl"] {
                direction: rtl;
                text-align: right;
              }
              
              /* Table styling for PDF */
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
              
              /* Page break control */
              .page-break {
                page-break-before: always;
              }
              
              .avoid-page-break {
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Trigger print dialog
      iframe.contentWindow?.print();

      onGenerated?.(true);
    } catch (error) {
      console.error("Client-side PDF generation failed:", error);
      onGenerated?.(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!iframeRef.current) return;

    setIsGenerating(true);
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      
      if (!iframeDoc) {
        throw new Error("Could not access iframe document");
      }

      // Write the HTML content to the iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @page {
                margin: 20mm 15mm;
                size: A4;
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
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use the browser's print to PDF functionality
      // This will open the print dialog where user can choose "Save as PDF"
      iframe.contentWindow?.print();

      onGenerated?.(true);
    } catch (error) {
      console.error("Client-side PDF download failed:", error);
      onGenerated?.(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate PDF"}
        </button>
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Preparing..." : "Download PDF"}
        </button>
      </div>
      
      {/* Hidden iframe for PDF generation */}
      <iframe
        ref={iframeRef}
        className="hidden"
        title="PDF Generator"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
