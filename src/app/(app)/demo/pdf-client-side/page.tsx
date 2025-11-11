"use client";

import React, { useState } from "react";
import { HybridPDFGenerator } from "~/app/(app)/pdf/[id]/_components/HybridPDFGenerator";
import { AdvancedPDFGenerator } from "~/app/(app)/pdf/[id]/_components/AdvancedPDFGenerator";
import { ClientSidePDFGenerator } from "~/app/(app)/pdf/[id]/_components/ClientSidePDFGenerator";

export default function PDFClientSideDemo() {
  const [selectedDemo, setSelectedDemo] = useState<"simple" | "advanced" | "hybrid">("hybrid");

  // Sample HTML content with multilingual text
  const sampleHTML = `
    <div style="font-family: 'Noto Naskh Arabic', 'Noto Sans Arabic', Arial, sans-serif; direction: rtl; text-align: right;">
      <h1 style="color: #2563eb; margin-bottom: 20px;">اختبار توليد PDF من المتصفح</h1>
      <p style="line-height: 1.6; margin-bottom: 15px;">
        لما كان تناسي حقوق الإنسان وازدراؤها قد أفضيا إلى أعمال همجية آذت الضمير الإنساني، وكان الإعلان العالمي لحقوق الإنسان كأعلى ما طمح إليه الشعوب والمم.
      </p>
    </div>
    
    <div style="margin: 20px 0;">
      <h2 style="color: #1f2937; margin-bottom: 10px;">English Content Test</h2>
      <p style="line-height: 1.6;">
        This is a test of client-side PDF generation using the browser's native print functionality. 
        It should be much faster than server-side generation with no cold start delays.
      </p>
    </div>

    <div style="margin: 20px 0;">
      <h2 style="color: #1f2937; margin-bottom: 10px;">Table Test</h2>
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Feature</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Client-Side</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Server-Side</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">Cold Start</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; color: green;">✓ None</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; color: red;">✗ 2.5s</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">Font Support</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; color: green;">✓ Excellent</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; color: green;">✓ Excellent</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e5e7eb; padding: 8px;">Speed</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; color: green;">✓ Instant</td>
            <td style="border: 1px solid #e5e7eb; padding: 8px; color: orange;">~3s</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin: 20px 0; page-break-inside: avoid;">
      <h2 style="color: #1f2937; margin-bottom: 10px;">Performance Comparison</h2>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
        <p><strong>Client-Side Generation:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>No cold start delay</li>
          <li>Uses browser's native PDF engine</li>
          <li>Instant response</li>
          <li>Excellent font rendering</li>
          <li>Works offline</li>
        </ul>
        
        <p><strong>Server-Side Generation:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>2.5+ second cold start</li>
          <li>Requires Chromium initialization</li>
          <li>Network latency</li>
          <li>Server resources needed</li>
          <li>More consistent across browsers</li>
        </ul>
      </div>
    </div>

    <div class="page-break">
      <h2 style="color: #1f2937; margin-bottom: 10px;">Second Page Test</h2>
      <p>This content should appear on a new page in the PDF.</p>
    </div>
  `;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Client-Side PDF Generation Demo
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Test different approaches to PDF generation. Client-side uses your browser&apos;s native print-to-PDF,
              eliminating the 2.5 second Chromium cold start delay.
            </p>
            
            {/* Demo Selection */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedDemo("hybrid")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDemo === "hybrid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Hybrid (Recommended)
              </button>
              <button
                onClick={() => setSelectedDemo("advanced")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDemo === "advanced"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Advanced Client-Side
              </button>
              <button
                onClick={() => setSelectedDemo("simple")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDemo === "simple"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Simple Client-Side
              </button>
            </div>
          </div>

          {/* Demo Content */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedDemo === "hybrid" && "Hybrid PDF Generator"}
              {selectedDemo === "advanced" && "Advanced Client-Side PDF Generator"}
              {selectedDemo === "simple" && "Simple Client-Side PDF Generator"}
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Sample Content:</h3>
              <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: sampleHTML }} />
            </div>

            {/* Render the selected demo */}
            {selectedDemo === "hybrid" && (
              <HybridPDFGenerator
                html={sampleHTML}
                filename="client-side-demo.pdf"
                onGenerated={(success, method) => {
                  console.log(`PDF generation ${success ? "succeeded" : "failed"} using ${method} method`);
                }}
                onError={(error, method) => {
                  console.error(`PDF generation failed using ${method} method:`, error);
                }}
              />
            )}
            
            {selectedDemo === "advanced" && (
              <AdvancedPDFGenerator
                html={sampleHTML}
                filename="advanced-client-side-demo.pdf"
                options={{
                  format: "A4",
                  margin: {
                    top: "20mm",
                    right: "15mm",
                    bottom: "20mm",
                    left: "15mm",
                  },
                }}
                onGenerated={(_blob) => {
                  console.log("Advanced PDF generated");
                }}
                onError={(error) => {
                  console.error("Advanced PDF generation failed:", error);
                }}
              />
            )}
            
            {selectedDemo === "simple" && (
              <ClientSidePDFGenerator
                html={sampleHTML}
                filename="simple-client-side-demo.pdf"
                onGenerated={(success) => {
                  console.log(`Simple PDF generation ${success ? "succeeded" : "failed"}`);
                }}
              />
            )}
          </div>

          {/* Performance Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Performance Benefits:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Zero Cold Start:</strong> Browser is already running, no initialization needed</li>
              <li>• <strong>Instant Response:</strong> PDF generation begins immediately</li>
              <li>• <strong>Reduced Server Load:</strong> No server resources needed for client-side option</li>
              <li>• <strong>Better UX:</strong> No waiting for server processing</li>
              <li>• <strong>Offline Capable:</strong> Works without internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
