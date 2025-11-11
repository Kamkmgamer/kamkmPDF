import { NextResponse } from "next/server";

export async function GET() {
  const testHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            margin: 20mm;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
          .header {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
          }
          .comparison {
            display: flex;
            gap: 20px;
            margin: 20px 0;
          }
          .method {
            flex: 1;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .client {
            background-color: #f0fdf4;
            border-color: #22c55e;
          }
          .server {
            background-color: #fef2f2;
            border-color: #ef4444;
          }
          .metric {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .good { color: #22c55e; }
          .bad { color: #ef4444; }
          .neutral { color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Client-Side vs Server-Side PDF Generation</h1>
          <p>Performance comparison and analysis</p>
        </div>

        <div class="comparison">
          <div class="method client">
            <h2>Client-Side Generation</h2>
            <div class="metric">
              <span>Cold Start Time:</span>
              <span class="good">0ms</span>
            </div>
            <div class="metric">
              <span>Response Time:</span>
              <span class="good">&lt;500ms</span>
            </div>
            <div class="metric">
              <span>Server Load:</span>
              <span class="good">None</span>
            </div>
            <div class="metric">
              <span>Font Support:</span>
              <span class="good">Excellent</span>
            </div>
            <div class="metric">
              <span>Offline Support:</span>
              <span class="good">Yes</span>
            </div>
          </div>

          <div class="method server">
            <h2>Server-Side Generation</h2>
            <div class="metric">
              <span>Cold Start Time:</span>
              <span class="bad">2500ms+</span>
            </div>
            <div class="metric">
              <span>Response Time:</span>
              <span class="neutral">3000ms+</span>
            </div>
            <div class="metric">
              <span>Server Load:</span>
              <span class="bad">High</span>
            </div>
            <div class="metric">
              <span>Font Support:</span>
              <span class="good">Excellent</span>
            </div>
            <div class="metric">
              <span>Offline Support:</span>
              <span class="bad">No</span>
            </div>
          </div>
        </div>

        <h2>Benefits of Client-Side Generation</h2>
        <ul>
          <li><strong>No Cold Start:</strong> Browser is already running, eliminating the 2.5 second Chromium initialization delay</li>
          <li><strong>Instant Response:</strong> PDF generation begins immediately when user clicks the button</li>
          <li><strong>Reduced Server Costs:</strong> No server resources needed for PDF generation</li>
          <li><strong>Better User Experience:</strong> No waiting for server processing or network latency</li>
          <li><strong>Scalability:</strong> Client-side generation scales with your users, not your server capacity</li>
          <li><strong>Reliability:</strong> Works even if server is down or experiencing high load</li>
        </ul>

        <h2>When to Use Server-Side Generation</h2>
        <ul>
          <li>When you need automated/batch PDF generation without user interaction</li>
          <li>When you need to store PDFs on the server immediately</li>
          <li>When supporting very old browsers that don't have good PDF printing capabilities</li>
          <li>When you need advanced PDF features not available in browser print</li>
        </ul>

        <div style="page-break-before: always;">
          <h2>Implementation Recommendation</h2>
          <p>For your kamkmPDF application, I recommend implementing a hybrid approach:</p>
          
          <h3>Primary: Client-Side Generation</h3>
          <p>Use browser's native print-to-PDF for interactive user requests. This provides the best user experience with instant response times.</p>
          
          <h3>Secondary: Server-Side Fallback</h3>
          <p>Maintain server-side generation as a fallback for:</p>
          <ul>
            <li>Browsers that don't support client-side PDF generation</li>
            <li>Users who prefer server-side processing</li>
            <li>API requests that need server-generated PDFs</li>
          </ul>
          
          <h3>Expected Performance Improvement</h3>
          <p>By implementing client-side PDF generation, you can expect:</p>
          <ul>
            <li><strong>80% faster response time</strong> for most users (2.5s → &lt;0.5s)</li>
            <li><strong>Reduced server costs</strong> by offloading PDF generation to clients</li>
            <li><strong>Better user satisfaction</strong> with instant PDF generation</li>
            <li><strong>Improved scalability</strong> during traffic spikes</li>
          </ul>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(testHTML, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache",
    },
  });
}
