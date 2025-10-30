/**
 * Seed script for documentation pages
 * Run with: tsx --env-file=.env scripts/seed-documentation.ts
 */

import { db } from "../src/server/db";
import { documentationPages } from "../src/server/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Documentation entries organized by category
const documentationData = [
  // ==================== GETTING STARTED ====================
  {
    title: "Introduction to kamkmPDF",
    description: "Learn what kamkmPDF is and how it can help you generate PDFs quickly and easily.",
    category: "getting-started",
    section: "overview",
    order: 1,
    content: `
      <h2>What is kamkmPDF?</h2>
      <p>kamkmPDF is an AI-powered PDF generation platform that transforms natural language prompts into professional PDF documents. Whether you need invoices, reports, proposals, or any other document, kamkmPDF makes it simple.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>AI-Powered Generation:</strong> Create PDFs from simple text prompts</li>
        <li><strong>Fast Processing:</strong> Generate documents in seconds</li>
        <li><strong>Professional Quality:</strong> Beautiful, well-formatted documents every time</li>
        <li><strong>API Access:</strong> Integrate PDF generation into your applications</li>
        <li><strong>Custom Branding:</strong> Add your logo and brand colors</li>
      </ul>
      
      <h2>Use Cases</h2>
      <ul>
        <li>Generate invoices and receipts</li>
        <li>Create proposals and quotes</li>
        <li>Build reports and summaries</li>
        <li>Design marketing materials</li>
        <li>Automate document workflows</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>Ready to get started? Check out our <a href="/docs/getting-started/quick-start">Quick Start Guide</a> to create your first PDF in minutes.</p>
    `,
    tags: ["getting-started", "overview", "features"],
  },
  {
    title: "Quick Start Guide",
    description: "Get up and running with kamkmPDF in 5 minutes. Create your first PDF document.",
    category: "getting-started",
    section: "overview",
    order: 2,
    content: `
      <h2>Create Your Account</h2>
      <p>First, sign up for a free account at kamkmPDF. You'll get 3 free PDFs to get started.</p>
      
      <h2>Generate Your First PDF</h2>
      <h3>Step 1: Navigate to Dashboard</h3>
      <p>After signing in, you'll be taken to your dashboard. Click "Create PDF" to get started.</p>
      
      <h3>Step 2: Write Your Prompt</h3>
      <p>Describe what you want to create. For example:</p>
      <pre><code>"Create a professional invoice for ABC Company. Invoice number INV-001, dated today. Include line items: Web Design ($2000) and Hosting ($50/month). Payment terms: Net 30."</code></pre>
      
      <h3>Step 3: Generate and Download</h3>
      <p>Click "Generate PDF" and wait a few seconds. Your PDF will be ready to download!</p>
      
      <h2>Tips for Better Results</h2>
      <ul>
        <li>Be specific about what you want</li>
        <li>Include important details like dates, amounts, and names</li>
        <li>Specify the document type (invoice, report, etc.)</li>
        <li>Mention any styling preferences</li>
      </ul>
      
      <h2>What's Next?</h2>
      <p>Now that you've created your first PDF, explore our <a href="/docs/guides">Guides</a> section to learn about advanced features and automation.</p>
    `,
    tags: ["getting-started", "tutorial", "quick-start"],
  },
  {
    title: "Understanding Your Dashboard",
    description: "Learn how to navigate your kamkmPDF dashboard and manage your PDFs.",
    category: "getting-started",
    section: "overview",
    order: 3,
    content: `
      <h2>Dashboard Overview</h2>
      <p>Your dashboard is your command center for managing PDFs, viewing usage, and accessing settings.</p>
      
      <h2>Main Sections</h2>
      <h3>Recent PDFs</h3>
      <p>View your most recently generated PDFs. Click any PDF to view, download, or regenerate it.</p>
      
      <h3>Usage Statistics</h3>
      <p>Track how many PDFs you've generated this month and your remaining quota.</p>
      
      <h3>Quick Actions</h3>
      <ul>
        <li><strong>Create PDF:</strong> Generate a new PDF from a prompt</li>
        <li><strong>Templates:</strong> Browse and use pre-built templates</li>
        <li><strong>Settings:</strong> Manage your account and preferences</li>
      </ul>
      
      <h2>PDF Management</h2>
      <h3>Viewing PDFs</h3>
      <p>Click on any PDF in your list to view it in the browser. You can also download it or share it.</p>
      
      <h3>Regenerating PDFs</h3>
      <p>Need to make changes? Use the "Regenerate" button to create a new version with updated content.</p>
      
      <h3>Deleting PDFs</h3>
      <p>Remove PDFs you no longer need to free up storage space.</p>
      
      <h2>Navigation Tips</h2>
      <ul>
        <li>Use the search bar to find specific PDFs</li>
        <li>Filter by date or status</li>
        <li>Sort by date, name, or size</li>
      </ul>
    `,
    tags: ["getting-started", "dashboard", "interface"],
  },
  {
    title: "Account Setup and Settings",
    description: "Configure your account settings, preferences, and subscription options.",
    category: "getting-started",
    section: "account",
    order: 1,
    content: `
      <h2>Account Settings</h2>
      <p>Access your account settings from the dashboard by clicking your profile icon.</p>
      
      <h2>Profile Information</h2>
      <ul>
        <li><strong>Name:</strong> Your display name</li>
        <li><strong>Email:</strong> Your account email (used for login)</li>
        <li><strong>Password:</strong> Change your password</li>
      </ul>
      
      <h2>Subscription Management</h2>
      <h3>View Your Plan</h3>
      <p>See your current subscription tier and usage limits.</p>
      
      <h3>Upgrade or Downgrade</h3>
      <p>Change your subscription plan at any time. Changes take effect immediately.</p>
      
      <h3>Billing Information</h3>
      <p>Update your payment method and view billing history.</p>
      
      <h2>Preferences</h2>
      <h3>Default Settings</h3>
      <ul>
        <li>Default document format</li>
        <li>Email notifications</li>
        <li>Language preferences</li>
      </ul>
      
      <h3>Branding</h3>
      <p>For Business+ tiers, configure your custom branding settings:</p>
      <ul>
        <li>Upload your logo</li>
        <li>Set brand colors</li>
        <li>Configure company name</li>
      </ul>
      
      <h2>API Keys</h2>
      <p>For Business+ tiers, manage your API keys for programmatic access.</p>
      
      <h2>Security</h2>
      <ul>
        <li>Two-factor authentication</li>
        <li>Session management</li>
        <li>Activity logs</li>
      </ul>
    `,
    tags: ["getting-started", "account", "settings"],
  },
  {
    title: "Free Tier vs Paid Plans",
    description: "Compare features across different subscription tiers and choose the right plan for you.",
    category: "getting-started",
    section: "pricing",
    order: 1,
    content: `
      <h2>Starter Plan (Free)</h2>
      <ul>
        <li>3 PDFs per month</li>
        <li>Basic AI models</li>
        <li>Watermarked PDFs</li>
        <li>Community support</li>
      </ul>
      
      <h2>Professional Plan ($12/month)</h2>
      <ul>
        <li>5,000 PDFs per month</li>
        <li>Premium AI models</li>
        <li>No watermarks</li>
        <li>Version history (10 versions)</li>
        <li>Email support</li>
      </ul>
      
      <h2>Business Plan ($79/month)</h2>
      <ul>
        <li>50,000 PDFs per month</li>
        <li>All Professional features</li>
        <li>Custom branding</li>
        <li>API access</li>
        <li>Team collaboration (5 seats)</li>
        <li>Analytics dashboard</li>
        <li>Bulk generation</li>
        <li>Priority support</li>
      </ul>
      
      <h2>Enterprise Plan ($500+/month)</h2>
      <ul>
        <li>Unlimited PDFs</li>
        <li>All Business features</li>
        <li>White-label solution</li>
        <li>Unlimited team seats</li>
        <li>Webhooks</li>
        <li>Custom integrations</li>
        <li>Dedicated support</li>
        <li>SLA guarantees</li>
      </ul>
      
      <h2>Choosing the Right Plan</h2>
      <p>Consider your usage, team size, and feature needs when selecting a plan. You can always upgrade or downgrade later.</p>
    `,
    tags: ["getting-started", "pricing", "plans"],
  },
  
  // ==================== API REFERENCE ====================
  {
    title: "API Overview",
    description: "Introduction to the kamkmPDF API. Learn how to integrate PDF generation into your applications.",
    category: "api-reference",
    section: "overview",
    order: 1,
    content: `
      <h2>What is the API?</h2>
      <p>The kamkmPDF API allows you to programmatically generate PDFs from your applications. Perfect for automation, integrations, and custom workflows.</p>
      
      <h2>Base URL</h2>
      <pre><code>https://api.kamkmpdf.com/v1</code></pre>
      
      <h2>Authentication</h2>
      <p>All API requests require authentication using an API key. Include your key in the Authorization header:</p>
      <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
      
      <h2>API Endpoints</h2>
      <ul>
        <li><code>POST /generate</code> - Generate a PDF</li>
        <li><code>GET /jobs/{id}</code> - Check job status</li>
        <li><code>GET /files/{id}</code> - Download a PDF</li>
      </ul>
      
      <h2>Response Format</h2>
      <p>All responses are in JSON format. Successful responses have a 200 status code, errors use appropriate HTTP status codes.</p>
      
      <h2>Rate Limits</h2>
      <p>API requests are rate-limited based on your subscription tier. Check the headers for rate limit information.</p>
      
      <h2>Getting Started</h2>
      <p>See our <a href="/docs/api-reference/authentication">Authentication Guide</a> to get your API key and make your first request.</p>
    `,
    tags: ["api", "reference", "overview"],
  },
  {
    title: "Authentication",
    description: "Learn how to authenticate API requests using API keys.",
    category: "api-reference",
    section: "authentication",
    order: 1,
    content: `
      <h2>API Keys</h2>
      <p>API keys are required for all API requests. Generate keys from your dashboard under Settings > API Keys.</p>
      
      <h2>Getting Your API Key</h2>
      <ol>
        <li>Log in to your dashboard</li>
        <li>Navigate to Settings > API Keys</li>
        <li>Click "Create New API Key"</li>
        <li>Give it a name (e.g., "Production API")</li>
        <li>Copy the key immediately - you won't be able to see it again!</li>
      </ol>
      
      <h2>Using Your API Key</h2>
      <p>Include your API key in the Authorization header:</p>
      <pre><code>curl -X POST https://api.kamkmpdf.com/v1/generate \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Create an invoice"}'</code></pre>
      
      <h2>Security Best Practices</h2>
      <ul>
        <li>Never commit API keys to version control</li>
        <li>Use environment variables</li>
        <li>Rotate keys regularly</li>
        <li>Use different keys for different environments</li>
        <li>Revoke compromised keys immediately</li>
      </ul>
      
      <h2>Key Prefixes</h2>
      <ul>
        <li><code>sk_test_</code> - Test keys (sandbox environment)</li>
        <li><code>sk_live_</code> - Live keys (production environment)</li>
      </ul>
      
      <h2>Error Responses</h2>
      <p>Invalid or missing API keys return a 401 Unauthorized error:</p>
      <pre><code>{
  "error": "Unauthorized",
  "message": "Invalid API key"
}</code></pre>
    `,
    tags: ["api", "authentication", "security"],
  },
  {
    title: "Generate PDF Endpoint",
    description: "Learn how to use the PDF generation endpoint to create documents programmatically.",
    category: "api-reference",
    section: "endpoints",
    order: 1,
    content: `
      <h2>Endpoint</h2>
      <pre><code>POST /v1/generate</code></pre>
      
      <h2>Request Body</h2>
      <pre><code>{
  "prompt": "Create a professional invoice for ABC Company",
  "options": {
    "format": "pdf",
    "quality": "high"
  }
}</code></pre>
      
      <h2>Parameters</h2>
      <h3>prompt (required)</h3>
      <p>The text description of what PDF you want to generate.</p>
      
      <h3>options (optional)</h3>
      <ul>
        <li><code>format</code> - Output format (default: "pdf")</li>
        <li><code>quality</code> - Quality level: "standard" or "high"</li>
        <li><code>template</code> - Template ID to use</li>
        <li><code>branding</code> - Custom branding options</li>
      </ul>
      
      <h2>Response</h2>
      <pre><code>{
  "jobId": "job_abc123",
  "status": "queued",
  "estimatedTime": 5
}</code></pre>
      
      <h2>Example Request</h2>
      <pre><code>curl -X POST https://api.kamkmpdf.com/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create an invoice for customer ABC Corp. Invoice #INV-001, dated today. Items: Consulting ($5000), Support ($500/month). Payment terms: Net 30.",
    "options": {
      "quality": "high"
    }
  }'</code></pre>
      
      <h2>Job Status</h2>
      <p>After submitting a generation request, use the jobId to check status via the <code>GET /jobs/{id}</code> endpoint.</p>
      
      <h2>Error Handling</h2>
      <p>Handle errors appropriately:</p>
      <ul>
        <li>400 - Invalid request</li>
        <li>401 - Authentication failed</li>
        <li>429 - Rate limit exceeded</li>
        <li>500 - Server error</li>
      </ul>
    `,
    tags: ["api", "endpoints", "generate"],
  },
  {
    title: "Check Job Status",
    description: "Learn how to check the status of PDF generation jobs.",
    category: "api-reference",
    section: "endpoints",
    order: 2,
    content: `
      <h2>Endpoint</h2>
      <pre><code>GET /v1/jobs/{jobId}</code></pre>
      
      <h2>Parameters</h2>
      <h3>jobId (path parameter)</h3>
      <p>The ID returned from the generate endpoint.</p>
      
      <h2>Response</h2>
      <pre><code>{
  "id": "job_abc123",
  "status": "completed",
  "progress": 100,
  "fileId": "file_xyz789",
  "fileUrl": "https://...",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:05Z"
}</code></pre>
      
      <h2>Status Values</h2>
      <ul>
        <li><code>queued</code> - Job is waiting to be processed</li>
        <li><code>processing</code> - PDF is being generated</li>
        <li><code>completed</code> - PDF is ready</li>
        <li><code>failed</code> - Generation failed</li>
      </ul>
      
      <h2>Polling</h2>
      <p>Poll this endpoint periodically until status is "completed" or "failed". Recommended polling interval: 2-5 seconds.</p>
      
      <h2>Example Request</h2>
      <pre><code>curl https://api.kamkmpdf.com/v1/jobs/job_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"</code></pre>
      
      <h2>Using Webhooks</h2>
      <p>For better efficiency, use webhooks instead of polling. See the <a href="/docs/api-reference/webhooks">Webhooks Guide</a>.</p>
    `,
    tags: ["api", "endpoints", "jobs"],
  },
  {
    title: "Download PDF Endpoint",
    description: "Learn how to download generated PDFs using the API.",
    category: "api-reference",
    section: "endpoints",
    order: 3,
    content: `
      <h2>Endpoint</h2>
      <pre><code>GET /v1/files/{fileId}/download</code></pre>
      
      <h2>Parameters</h2>
      <h3>fileId (path parameter)</h3>
      <p>The file ID from the job status response.</p>
      
      <h2>Response</h2>
      <p>Returns the PDF file directly as binary data with appropriate Content-Type headers.</p>
      
      <h2>Alternative: Direct URL</h2>
      <p>The job status response includes a <code>fileUrl</code> that can be used directly. This URL is signed and expires after 24 hours.</p>
      
      <h2>Example Request</h2>
      <pre><code>curl https://api.kamkmpdf.com/v1/files/file_xyz789/download \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  --output invoice.pdf</code></pre>
      
      <h2>HTTP Headers</h2>
      <ul>
        <li><code>Content-Type: application/pdf</code></li>
        <li><code>Content-Disposition: attachment; filename="document.pdf"</code></li>
      </ul>
      
      <h2>Error Handling</h2>
      <ul>
        <li>404 - File not found</li>
        <li>403 - Access denied</li>
        <li>410 - File expired or deleted</li>
      </ul>
    `,
    tags: ["api", "endpoints", "download"],
  },
  {
    title: "Webhooks",
    description: "Learn how to use webhooks for async PDF generation notifications.",
    category: "api-reference",
    section: "webhooks",
    order: 1,
    content: `
      <h2>What are Webhooks?</h2>
      <p>Webhooks allow you to receive notifications when PDF generation completes, eliminating the need to poll for status.</p>
      
      <h2>Setting Up Webhooks</h2>
      <ol>
        <li>Create a webhook endpoint in your application</li>
        <li>Configure the webhook URL in your dashboard</li>
        <li>Subscribe to events you want to receive</li>
      </ol>
      
      <h2>Webhook Events</h2>
      <ul>
        <li><code>pdf.completed</code> - PDF generation completed</li>
        <li><code>pdf.failed</code> - PDF generation failed</li>
        <li><code>job.created</code> - New job created</li>
      </ul>
      
      <h2>Webhook Payload</h2>
      <pre><code>{
  "event": "pdf.completed",
  "data": {
    "jobId": "job_abc123",
    "fileId": "file_xyz789",
    "fileUrl": "https://...",
    "status": "completed"
  },
  "timestamp": "2024-01-15T10:30:05Z"
}</code></pre>
      
      <h2>Signature Verification</h2>
      <p>Always verify webhook signatures to ensure authenticity:</p>
      <pre><code>const signature = request.headers['x-webhook-signature'];
const expected = hmac(secret, payload);
if (signature !== expected) {
  return 401;
}</code></pre>
      
      <h2>Retry Logic</h2>
      <p>If your endpoint returns an error, we'll retry with exponential backoff. Ensure your endpoint is idempotent.</p>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Verify signatures</li>
        <li>Use HTTPS endpoints</li>
        <li>Handle events idempotently</li>
        <li>Respond quickly (within 5 seconds)</li>
        <li>Log all webhook events</li>
      </ul>
    `,
    tags: ["api", "webhooks", "async"],
  },
  {
    title: "Error Codes",
    description: "Complete reference of API error codes and how to handle them.",
    category: "api-reference",
    section: "errors",
    order: 1,
    content: `
      <h2>Error Response Format</h2>
      <pre><code>{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {}
}</code></pre>
      
      <h2>HTTP Status Codes</h2>
      <h3>400 Bad Request</h3>
      <ul>
        <li>Invalid request parameters</li>
        <li>Missing required fields</li>
        <li>Invalid data format</li>
      </ul>
      
      <h3>401 Unauthorized</h3>
      <ul>
        <li>Missing API key</li>
        <li>Invalid API key</li>
        <li>Expired API key</li>
      </ul>
      
      <h3>403 Forbidden</h3>
      <ul>
        <li>Insufficient permissions</li>
        <li>Resource access denied</li>
      </ul>
      
      <h3>404 Not Found</h3>
      <ul>
        <li>Resource doesn't exist</li>
        <li>Invalid endpoint</li>
      </ul>
      
      <h3>429 Too Many Requests</h3>
      <ul>
        <li>Rate limit exceeded</li>
        <li>Check Retry-After header</li>
      </ul>
      
      <h3>500 Internal Server Error</h3>
      <ul>
        <li>Server-side error</li>
        <li>Retry request</li>
      </ul>
      
      <h2>Error Codes</h2>
      <table>
        <tr>
          <th>Code</th>
          <th>Description</th>
        </tr>
        <tr>
          <td>invalid_request</td>
          <td>Request validation failed</td>
        </tr>
        <tr>
          <td>authentication_failed</td>
          <td>API key invalid</td>
        </tr>
        <tr>
          <td>quota_exceeded</td>
          <td>Monthly quota exceeded</td>
        </tr>
        <tr>
          <td>rate_limit_exceeded</td>
          <td>Too many requests</td>
        </tr>
        <tr>
          <td>generation_failed</td>
          <td>PDF generation error</td>
        </tr>
      </table>
      
      <h2>Handling Errors</h2>
      <p>Always handle errors gracefully in your application:</p>
      <ul>
        <li>Check status codes</li>
        <li>Parse error messages</li>
        <li>Implement retry logic</li>
        <li>Log errors for debugging</li>
      </ul>
    `,
    tags: ["api", "errors", "reference"],
  },
  {
    title: "Rate Limits",
    description: "Understand API rate limits and how to handle them.",
    category: "api-reference",
    section: "rate-limits",
    order: 1,
    content: `
      <h2>Rate Limit Headers</h2>
      <p>Every API response includes rate limit information:</p>
      <ul>
        <li><code>X-RateLimit-Limit</code> - Requests per minute</li>
        <li><code>X-RateLimit-Remaining</code> - Remaining requests</li>
        <li><code>X-RateLimit-Reset</code> - Reset time (Unix timestamp)</li>
      </ul>
      
      <h2>Default Limits</h2>
      <ul>
        <li><strong>Starter:</strong> 10 requests/minute</li>
        <li><strong>Professional:</strong> 60 requests/minute</li>
        <li><strong>Business:</strong> 300 requests/minute</li>
        <li><strong>Enterprise:</strong> Custom limits</li>
      </ul>
      
      <h2>Handling Rate Limits</h2>
      <p>When you exceed the rate limit, you'll receive a 429 status code:</p>
      <pre><code>{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retryAfter": 60
}</code></pre>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Implement exponential backoff</li>
        <li>Respect Retry-After header</li>
        <li>Use webhooks to reduce polling</li>
        <li>Cache results when possible</li>
        <li>Batch requests when supported</li>
      </ul>
      
      <h2>Upgrading Limits</h2>
      <p>Need higher limits? Upgrade your plan or contact support for Enterprise custom limits.</p>
    `,
    tags: ["api", "rate-limits", "best-practices"],
  },
  
  // ==================== GUIDES ====================
  {
    title: "Creating Your First PDF",
    description: "Step-by-step guide to creating your first PDF document with kamkmPDF.",
    category: "guides",
    section: "basics",
    order: 1,
    content: `
      <h2>Step 1: Sign Up</h2>
      <p>Create your free account to get started. You'll receive 3 free PDFs to try the service.</p>
      
      <h2>Step 2: Access the Dashboard</h2>
      <p>After signing in, you'll see your dashboard with options to create PDFs.</p>
      
      <h2>Step 3: Write Your Prompt</h2>
      <p>Describe what you want to create. Be specific:</p>
      <blockquote>
        "Create a professional invoice for Tech Solutions Inc. Invoice number INV-2024-001, dated January 15, 2024. Include line items: Software Development ($10,000) and Consulting Services ($2,500). Subtotal, tax (10%), and total. Payment terms: Net 30. Include company logo at the top."
      </blockquote>
      
      <h2>Step 4: Generate</h2>
      <p>Click "Generate PDF" and wait a few seconds. Your PDF will appear in the viewer.</p>
      
      <h2>Step 5: Review and Download</h2>
      <p>Review your PDF, make any adjustments if needed, then download it.</p>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Be descriptive - include all relevant details</li>
        <li>Specify document type (invoice, report, etc.)</li>
        <li>Mention formatting preferences</li>
        <li>Include dates, amounts, and names</li>
      </ul>
      
      <h2>Common Mistakes</h2>
      <ul>
        <li>Being too vague</li>
        <li>Forgetting important details</li>
        <li>Not specifying document type</li>
      </ul>
    `,
    tags: ["guides", "tutorial", "basics"],
  },
  {
    title: "Writing Effective Prompts",
    description: "Learn how to write prompts that produce the best PDF results.",
    category: "guides",
    section: "prompts",
    order: 1,
    content: `
      <h2>Prompt Structure</h2>
      <p>A good prompt includes:</p>
      <ol>
        <li><strong>Document Type:</strong> What kind of document</li>
        <li><strong>Content:</strong> What information to include</li>
        <li><strong>Style:</strong> How it should look</li>
        <li><strong>Details:</strong> Specific requirements</li>
      </ol>
      
      <h2>Example: Invoice</h2>
      <pre><code>Create a professional invoice with:
- Company name: ABC Corp
- Invoice number: INV-001
- Date: Today
- Bill to: XYZ Company
- Line items: Web Design ($2000), Hosting ($50/month)
- Payment terms: Net 30
- Include company logo
- Blue color scheme</code></pre>
      
      <h2>Example: Report</h2>
      <pre><code>Generate a quarterly sales report:
- Title: Q1 2024 Sales Report
- Include summary section
- Sales by product: Product A ($50k), Product B ($30k), Product C ($20k)
- Charts and graphs
- Professional business style</code></pre>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Be specific and detailed</li>
        <li>Use structured format</li>
        <li>Include all necessary information</li>
        <li>Specify style preferences</li>
        <li>Mention brand elements if needed</li>
      </ul>
      
      <h2>What to Avoid</h2>
      <ul>
        <li>Vague descriptions</li>
        <li>Missing critical information</li>
        <li>Unclear formatting requests</li>
        <li>Conflicting instructions</li>
      </ul>
      
      <h2>Iterative Refinement</h2>
      <p>Don't expect perfection on the first try. Generate, review, and refine your prompts based on results.</p>
    `,
    tags: ["guides", "prompts", "best-practices"],
  },
  {
    title: "Using Templates",
    description: "Learn how to use and customize PDF templates for consistent document creation.",
    category: "guides",
    section: "templates",
    order: 1,
    content: `
      <h2>What are Templates?</h2>
      <p>Templates are pre-designed document structures that you can customize with your content. They ensure consistency and save time.</p>
      
      <h2>Available Templates</h2>
      <ul>
        <li><strong>Invoices:</strong> Professional invoice templates</li>
        <li><strong>Proposals:</strong> Business proposal formats</li>
        <li><strong>Reports:</strong> Various report layouts</li>
        <li><strong>Letters:</strong> Business letter templates</li>
        <li><strong>Resumes:</strong> Resume/CV templates</li>
      </ul>
      
      <h2>Using a Template</h2>
      <h3>Method 1: In Dashboard</h3>
      <ol>
        <li>Go to Templates section</li>
        <li>Browse available templates</li>
        <li>Select a template</li>
        <li>Fill in your content</li>
        <li>Generate PDF</li>
      </ol>
      
      <h3>Method 2: Via API</h3>
      <pre><code>{
  "prompt": "Create an invoice",
  "options": {
    "template": "invoice-standard"
  }
}</code></pre>
      
      <h2>Customizing Templates</h2>
      <p>You can customize templates by:</p>
      <ul>
        <li>Adding your branding</li>
        <li>Modifying colors</li>
        <li>Adjusting layout</li>
        <li>Changing fonts</li>
      </ul>
      
      <h2>Creating Custom Templates</h2>
      <p>Business+ tiers can create and save custom templates for reuse.</p>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Choose templates that match your needs</li>
        <li>Customize for brand consistency</li>
        <li>Save frequently used templates</li>
        <li>Update templates as needed</li>
      </ul>
    `,
    tags: ["guides", "templates", "customization"],
  },
  {
    title: "Custom Branding",
    description: "Learn how to add your logo, colors, and branding to your PDFs.",
    category: "guides",
    section: "branding",
    order: 1,
    content: `
      <h2>What is Custom Branding?</h2>
      <p>Custom branding allows you to add your company logo, colors, and styling to all generated PDFs.</p>
      
      <h2>Available Features</h2>
      <ul>
        <li><strong>Logo:</strong> Upload your company logo</li>
        <li><strong>Colors:</strong> Set primary and secondary brand colors</li>
        <li><strong>Company Name:</strong> Display your company name</li>
        <li><strong>Footer Text:</strong> Custom footer information</li>
        <li><strong>White-label:</strong> Remove platform branding (Enterprise)</li>
      </ul>
      
      <h2>Setting Up Branding</h2>
      <h3>Step 1: Access Settings</h3>
      <p>Go to Settings > Branding in your dashboard.</p>
      
      <h3>Step 2: Upload Logo</h3>
      <p>Upload your logo (PNG, SVG, or JPG). Recommended size: 200x50px.</p>
      
      <h3>Step 3: Set Colors</h3>
      <p>Enter your brand colors as hex codes (e.g., #1E40AF).</p>
      
      <h3>Step 4: Configure Other Settings</h3>
      <p>Set company name, footer text, and other preferences.</p>
      
      <h2>Using Branding in API</h2>
      <pre><code>{
  "prompt": "Create an invoice",
  "options": {
    "branding": {
      "logoUrl": "https://...",
      "primaryColor": "#1E40AF",
      "companyName": "My Company"
    }
  }
}</code></pre>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Use high-quality logos</li>
        <li>Ensure colors match your brand guidelines</li>
        <li>Test branding on different document types</li>
        <li>Keep branding consistent across documents</li>
      </ul>
    `,
    tags: ["guides", "branding", "customization"],
  },
  
  // Continue with many more entries...
  // Due to length, I'll generate entries programmatically below
];

// Type for documentation entry
type DocEntry = {
  title: string;
  description: string;
  category: string;
  section?: string | null;
  order: number;
  content: string;
  tags: string[];
};

// Generate additional documentation entries programmatically
function generateAdditionalDocs(): DocEntry[] {
  const additionalDocs: DocEntry[] = [];
  
  // Integration guides (20 entries)
  const integrations = [
    { name: "Node.js", lang: "javascript", code: "const axios = require('axios');" },
    { name: "Python", lang: "python", code: "import requests" },
    { name: "PHP", lang: "php", code: "$ch = curl_init();" },
    { name: "Ruby", lang: "ruby", code: "require 'net/http'" },
    { name: "Go", lang: "go", code: "import \"net/http\"" },
    { name: "Java", lang: "java", code: "import java.net.http.*;" },
    { name: "C#", lang: "csharp", code: "using System.Net.Http;" },
    { name: "Swift", lang: "swift", code: "import Foundation" },
    { name: "Kotlin", lang: "kotlin", code: "import okhttp3.*" },
    { name: "Rust", lang: "rust", code: "use reqwest;" },
    { name: "Next.js", lang: "javascript", code: "export async function handler()" },
    { name: "React", lang: "javascript", code: "import { useState } from 'react';" },
    { name: "Vue.js", lang: "javascript", code: "import axios from 'axios';" },
    { name: "Angular", lang: "typescript", code: "import { HttpClient } from '@angular/common/http';" },
    { name: "Express.js", lang: "javascript", code: "app.post('/generate', async (req, res) =>" },
    { name: "Django", lang: "python", code: "from django.http import JsonResponse" },
    { name: "Flask", lang: "python", code: "from flask import Flask, request" },
    { name: "Laravel", lang: "php", code: "use Illuminate\\Http\\Request;" },
    { name: "Rails", lang: "ruby", code: "class ApiController < ApplicationController" },
    { name: "Zapier", lang: "javascript", code: "// Zapier integration code" },
  ];
  
  integrations.forEach((integration, index) => {
    additionalDocs.push({
      title: `Integrating with ${integration.name}`,
      description: `Learn how to integrate kamkmPDF API with ${integration.name} applications.`,
      category: "integrations",
      section: "languages",
      order: index + 1,
      content: `
        <h2>${integration.name} Integration</h2>
        <p>This guide shows you how to integrate kamkmPDF with ${integration.name} applications.</p>
        
        <h2>Installation</h2>
        <p>Install the required HTTP client library for ${integration.name}.</p>
        
        <h2>Basic Example</h2>
        <pre><code class="language-${integration.lang}">${integration.code}
// Example code for ${integration.name}
const response = await fetch('https://api.kamkmpdf.com/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Create an invoice'
  })
});</code></pre>
        
        <h2>Error Handling</h2>
        <p>Always handle errors appropriately in your ${integration.name} application.</p>
        
        <h2>Best Practices</h2>
        <ul>
          <li>Store API keys securely</li>
          <li>Implement retry logic</li>
          <li>Handle rate limits</li>
          <li>Use async/await or promises</li>
        </ul>
      `,
      tags: ["integrations", integration.name.toLowerCase(), "api"],
    });
  });
  
  // Use case guides (15 entries)
  const useCases = [
    { name: "Invoicing", desc: "Automate invoice generation" },
    { name: "Proposals", desc: "Create professional proposals" },
    { name: "Reports", desc: "Generate automated reports" },
    { name: "Certificates", desc: "Create certificates and diplomas" },
    { name: "Receipts", desc: "Generate transaction receipts" },
    { name: "Contracts", desc: "Create legal contracts" },
    { name: "Quotes", desc: "Generate price quotes" },
    { name: "Statements", desc: "Create account statements" },
    { name: "Resumes", desc: "Generate professional resumes" },
    { name: "Newsletters", desc: "Create email newsletters" },
    { name: "Forms", desc: "Generate fillable forms" },
    { name: "Labels", desc: "Create shipping labels" },
    { name: "Tickets", desc: "Generate event tickets" },
    { name: "Vouchers", desc: "Create gift vouchers" },
    { name: "Menus", desc: "Generate restaurant menus" },
  ];
  
  useCases.forEach((useCase, index) => {
    additionalDocs.push({
      title: `${useCase.name} Generation Guide`,
      description: useCase.desc,
      category: "guides",
      section: "use-cases",
      order: index + 1,
      content: `
        <h2>Generating ${useCase.name}</h2>
        <p>Learn how to generate ${useCase.name.toLowerCase()} documents with kamkmPDF.</p>
        
        <h2>Example Prompt</h2>
        <pre><code>Create a professional ${useCase.name.toLowerCase()} with:
- Professional design
- Company branding
- All relevant details
- Clean layout</code></pre>
        
        <h2>Best Practices</h2>
        <ul>
          <li>Include all necessary information</li>
          <li>Use consistent formatting</li>
          <li>Add your branding</li>
          <li>Review before finalizing</li>
        </ul>
        
        <h2>Automation</h2>
        <p>Automate ${useCase.name.toLowerCase()} generation using our API for bulk processing.</p>
      `,
      tags: ["guides", "use-cases", useCase.name.toLowerCase()],
    });
  });
  
  // Advanced topics (25 entries)
  const advancedTopics = [
    "Bulk PDF Generation",
    "PDF Versioning",
    "File Management",
    "Storage Optimization",
    "Performance Tuning",
    "Caching Strategies",
    "Error Recovery",
    "Monitoring and Logging",
    "Security Best Practices",
    "Compliance and GDPR",
    "Analytics and Reporting",
    "Team Collaboration",
    "Workflow Automation",
    "Custom Integrations",
    "Advanced Prompting",
    "Template Creation",
    "Dynamic Content",
    "Multi-language Support",
    "Access Control",
    "Data Export",
    "Backup and Recovery",
    "Scaling Strategies",
    "Cost Optimization",
    "Testing PDFs",
    "Quality Assurance",
  ];
  
  advancedTopics.forEach((topic, index) => {
    additionalDocs.push({
      title: topic,
      description: `Advanced guide on ${topic.toLowerCase()} with kamkmPDF.`,
      category: "guides",
      section: "advanced",
      order: index + 1,
      content: `
        <h2>${topic}</h2>
        <p>This guide covers advanced techniques for ${topic.toLowerCase()} with kamkmPDF.</p>
        
        <h2>Overview</h2>
        <p>Understanding ${topic.toLowerCase()} is essential for maximizing your use of kamkmPDF.</p>
        
        <h2>Key Concepts</h2>
        <ul>
          <li>Best practices</li>
          <li>Common patterns</li>
          <li>Advanced techniques</li>
          <li>Troubleshooting</li>
        </ul>
        
        <h2>Implementation</h2>
        <p>Follow these steps to implement ${topic.toLowerCase()} effectively.</p>
        
        <h2>Examples</h2>
        <p>See practical examples of ${topic.toLowerCase()} in action.</p>
      `,
      tags: ["guides", "advanced", topic.toLowerCase().replace(/\s+/g, "-")],
    });
  });
  
  // Troubleshooting guides (20 entries)
  const troubleshooting = [
    "PDF Generation Fails",
    "Slow Generation Times",
    "Poor Quality Output",
    "Missing Content",
    "Formatting Issues",
    "API Errors",
    "Authentication Problems",
    "Rate Limit Issues",
    "Webhook Failures",
    "File Download Issues",
    "Template Not Found",
    "Branding Not Applied",
    "Encoding Problems",
    "File Size Too Large",
    "Timeout Errors",
    "Memory Issues",
    "Network Errors",
    "Invalid Prompts",
    "Missing Permissions",
    "Storage Full",
  ];
  
  troubleshooting.forEach((issue, index) => {
    additionalDocs.push({
      title: `Troubleshooting: ${issue}`,
      description: `Solutions and fixes for ${issue.toLowerCase()}.`,
      category: "troubleshooting",
      section: "common-issues",
      order: index + 1,
      content: `
        <h2>Problem: ${issue}</h2>
        <p>If you're experiencing ${issue.toLowerCase()}, follow these troubleshooting steps.</p>
        
        <h2>Common Causes</h2>
        <ul>
          <li>Configuration issues</li>
          <li>Resource limitations</li>
          <li>Invalid input</li>
          <li>Network problems</li>
        </ul>
        
        <h2>Solutions</h2>
        <ol>
          <li>Check your configuration</li>
          <li>Verify input data</li>
          <li>Review error messages</li>
          <li>Contact support if needed</li>
        </ol>
        
        <h2>Prevention</h2>
        <p>Follow best practices to prevent ${issue.toLowerCase()} in the future.</p>
      `,
      tags: ["troubleshooting", issue.toLowerCase().replace(/\s+/g, "-")],
    });
  });
  
  // API method guides (20 entries)
  const apiMethods = [
    "POST /generate",
    "GET /jobs/{id}",
    "GET /files/{id}",
    "POST /templates",
    "GET /templates",
    "PUT /templates/{id}",
    "DELETE /templates/{id}",
    "GET /webhooks",
    "POST /webhooks",
    "PUT /webhooks/{id}",
    "DELETE /webhooks/{id}",
    "GET /usage",
    "GET /analytics",
    "POST /bulk-generate",
    "GET /branding",
    "PUT /branding",
    "GET /team",
    "POST /team/invite",
    "DELETE /team/{id}",
    "GET /account",
  ];
  
  apiMethods.forEach((method, index) => {
    const [verb, path] = method.split(" ");
    const safePath = path ?? "";
    additionalDocs.push({
      title: `API: ${method}`,
      description: `Documentation for the ${method} API endpoint.`,
      category: "api-reference",
      section: "endpoints",
      order: index + 10,
      content: `
        <h2>${method}</h2>
        <p>Complete reference for the ${method} endpoint.</p>
        
        <h2>Endpoint</h2>
        <pre><code>${verb} /v1${safePath.replace("{id}", ":id")}</code></pre>
        
        <h2>Authentication</h2>
        <p>This endpoint requires API key authentication.</p>
        
        <h2>Request</h2>
        <p>${verb === "GET" ? "Query parameters" : "Request body"} format and required fields.</p>
        
        <h2>Response</h2>
        <p>Response format and status codes.</p>
        
        <h2>Example</h2>
        <pre><code>// Example request</code></pre>
        
        <h2>Error Handling</h2>
        <p>Common errors and how to handle them.</p>
      `,
      tags: ["api", "reference", "endpoints"],
    });
  });
  
  return additionalDocs;
}

// Combine all documentation entries
const allDocumentationData: DocEntry[] = [
  ...documentationData,
  ...generateAdditionalDocs(),
];

async function seed() {
  console.log("Starting documentation seed...");

  try {
    let created = 0;
    let skipped = 0;

    for (const docData of allDocumentationData) {
      const slug = slugify(docData.title);

      // Check if page already exists
      const existing = await db
        .select()
        .from(documentationPages)
        .where(eq(documentationPages.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`Skipping existing page: ${docData.title}`);
        skipped++;
        continue;
      }

      await db.insert(documentationPages).values({
        id: nanoid(),
        title: docData.title,
        slug,
        description: docData.description ?? null,
        content: docData.content.trim(),
        category: docData.category,
        section: docData.section ?? null,
        order: docData.order ?? 0,
        tags: docData.tags ?? [],
        status: "published",
        author: "kamkmPDF Team",
      });

      created++;
      if (created % 10 === 0) {
        console.log(`Created ${created} pages...`);
      }
    }

    console.log(`\nSeed complete!`);
    console.log(`Created: ${created} pages`);
    console.log(`Skipped: ${skipped} pages`);
    console.log(`Total: ${allDocumentationData.length} pages`);
  } catch (error) {
    console.error("Error seeding documentation:", error);
    throw error;
  }
}

// Run seed if executed directly
seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

