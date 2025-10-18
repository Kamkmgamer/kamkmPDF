# Tier-Specific Features Implementation Guide

This document describes all the tier-specific features implemented for Pro, Business, and Enterprise tiers.

## Table of Contents

1. [Version History](#version-history)
2. [Custom Branding](#custom-branding)
3. [Analytics Dashboard](#analytics-dashboard)
4. [API Access](#api-access)
5. [Team Collaboration](#team-collaboration)
6. [Bulk PDF Generation](#bulk-pdf-generation)
7. [Webhooks (Enterprise)](#webhooks-enterprise)
8. [Database Schema](#database-schema)

---

## Version History

**Available:** Classic (5 versions), Professional (10 versions), Business (50 versions), Enterprise (unlimited)

### Features

- **Automatic versioning**: Each PDF regeneration creates a new version
- **Version browsing**: View all previous versions of a PDF
- **Restoration**: Restore any previous version as the current version
- **Storage management**: Automatically cleanup old versions based on tier limits

### API Endpoints

#### Get File Versions

```typescript
const versions = await api.versions.getFileVersions.query({
  fileId: "file_123",
});
```

#### Create Version (automatic on regeneration)

```typescript
const result = await api.versions.createVersion.mutate({
  fileId: "file_123",
  jobId: "job_456",
  prompt: "Updated resume with new skills",
  fileKey: "storage_key",
  fileUrl: "https://...",
  fileSize: 123456,
});
```

#### Restore Previous Version

```typescript
await api.versions.restoreVersion.mutate({
  versionId: "version_789",
});
```

---

## Custom Branding

**Available:** Business, Enterprise

### Features

- **Logo upload**: Custom company logo
- **Color scheme**: Primary and secondary brand colors
- **Company name**: Replace platform branding with your company name
- **Custom domain**: Use your own domain (Enterprise)
- **Hide platform branding**: Remove all KamkmPDF branding
- **Custom footer text**: Add your own footer content

### API Endpoints

#### Get Branding Settings

```typescript
const branding = await api.branding.get.query();
```

#### Update Branding

```typescript
await api.branding.update.mutate({
  logoUrl: "https://example.com/logo.png",
  companyName: "Acme Corporation",
  primaryColor: "#FF5733",
  secondaryColor: "#3498DB",
  hidePlatformBranding: true,
  footerText: "© 2024 Acme Corp. All rights reserved.",
});
```

#### Reset to Defaults

```typescript
await api.branding.reset.mutate();
```

### Usage in PDF Generation

Branding settings are automatically applied when generating PDFs for Business+ users:

- Logo appears in header
- Colors used in templates
- Company name replaces platform name
- Custom footer text included

---

## Analytics Dashboard

**Available:** Business, Enterprise

### Features

- **Usage overview**: Total PDFs, completion rate, storage used
- **Trend analysis**: Daily/weekly/monthly PDF generation trends
- **Performance metrics**: Average processing time
- **Top prompts**: Most frequently used prompts
- **Action breakdown**: Usage by action type
- **Data export**: Export analytics as JSON/CSV

### API Endpoints

#### Get Overview

```typescript
const overview = await api.analytics.getOverview.query({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});

// Returns:
{
  totalPdfs: 450,
  completedPdfs: 432,
  failedPdfs: 18,
  successRate: 96.0,
  storageUsedBytes: 52428800,
  avgProcessingTimeSeconds: 45.2
}
```

#### Get Trends

```typescript
const trends = await api.analytics.getTrends.query({
  interval: "day", // 'day' | 'week' | 'month'
});

// Returns array of:
[
  { period: "2024-01-15", total: 23, completed: 22, failed: 1 },
  { period: "2024-01-16", total: 31, completed: 30, failed: 1 },
];
```

#### Get Top Prompts

```typescript
const topPrompts = await api.analytics.getTopPrompts.query({
  limit: 10,
});
```

#### Export Data

```typescript
const exportData = await api.analytics.exportData.query({
  type: "all", // 'jobs' | 'usage' | 'all'
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
});
```

---

## API Access

**Available:** Business (beta), Enterprise (full)

### Features

- **API key management**: Create, revoke, and manage multiple API keys
- **Permission system**: Granular permissions (pdf:create, pdf:read, etc.)
- **Key expiration**: Set expiration dates for keys
- **Usage tracking**: Monitor API key usage
- **Secure storage**: Keys hashed with SHA-256

### API Key Management

#### List API Keys

```typescript
const keys = await api.apiKeys.list.query();
```

#### Create New Key

```typescript
const { key } = await api.apiKeys.create.mutate({
  name: "Production API Key",
  permissions: ["pdf:create", "pdf:read"],
  expiresAt: new Date("2025-12-31"),
});

// ⚠️ Save 'key' immediately - it won't be shown again!
```

#### Revoke Key

```typescript
await api.apiKeys.revoke.mutate({ keyId: "key_123" });
```

#### Delete Key

```typescript
await api.apiKeys.delete.mutate({ keyId: "key_123" });
```

### REST API Usage

#### Generate PDF

```bash
curl -X POST https://yourdomain.com/api/v1/generate \
  -H "Authorization: Bearer sk_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a professional resume for John Doe"}'

# Response:
{
  "id": "job_123",
  "status": "queued",
  "message": "PDF generation job created successfully"
}
```

#### Get Job Status

```bash
curl https://yourdomain.com/api/v1/jobs/job_123 \
  -H "Authorization: Bearer sk_live_your_api_key"

# Response:
{
  "id": "job_123",
  "status": "completed",
  "progress": 100,
  "resultFileId": "file_456",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Permissions

Available permissions:

- `pdf:create` - Create new PDF generation jobs
- `pdf:read` - Read job status and results
- `pdf:delete` - Delete PDFs
- `*` - All permissions (use with caution)

---

## Team Collaboration

**Available:** Business (5 seats), Enterprise (unlimited)

### Features

- **Team invitations**: Invite members via email
- **Role-based access**: Admin, Member, Viewer roles
- **Shared resources**: Access team PDFs and templates
- **Usage pooling**: Share quota across team
- **Member management**: Add, remove, update roles

### API Endpoints

#### List Team Members

```typescript
const team = await api.teams.listMembers.query();

// Returns:
{
  members: [...],
  limit: 5,
  used: 3
}
```

#### Invite Member

```typescript
await api.teams.inviteMember.mutate({
  email: "colleague@example.com",
  role: "member", // 'admin' | 'member' | 'viewer'
});
```

#### Remove Member

```typescript
await api.teams.removeMember.mutate({
  memberId: "member_123",
});
```

#### Update Member Role

```typescript
await api.teams.updateMemberRole.mutate({
  memberId: "member_123",
  role: "admin",
});
```

#### Accept Invitation (as invitee)

```typescript
await api.teams.acceptInvitation.mutate({
  inviteId: "invite_123",
});
```

### Roles & Permissions

| Role       | Create PDFs | View PDFs | Delete PDFs | Manage Team |
| ---------- | ----------- | --------- | ----------- | ----------- |
| **Admin**  | ✅          | ✅        | ✅          | ✅          |
| **Member** | ✅          | ✅        | ❌          | ❌          |
| **Viewer** | ❌          | ✅        | ❌          | ❌          |

---

## Bulk PDF Generation

**Available:** Business, Enterprise

### Features

- **CSV upload**: Upload CSV file with multiple prompts
- **Batch processing**: Generate multiple PDFs in one request
- **Progress tracking**: Monitor bulk job status
- **Quota validation**: Ensures sufficient quota before starting
- **History**: View past bulk operations

### API Endpoints

#### Parse CSV

```typescript
const parsed = await api.bulk.parseCSV.mutate({
  csvContent: "prompt,name\nCreate resume,John Doe\n..."
});

// Returns:
{
  prompts: [
    { prompt: "Create resume", metadata: { name: "John Doe" } }
  ],
  count: 1
}
```

#### Create Bulk Jobs

```typescript
const result = await api.bulk.createBulk.mutate({
  prompts: [
    { prompt: "Create resume for John", metadata: {} },
    { prompt: "Create resume for Jane", metadata: {} }
  ]
});

// Returns:
{
  success: true,
  jobIds: ["job_1", "job_2"],
  count: 2
}
```

#### Get Bulk Status

```typescript
const status = await api.bulk.getBulkStatus.query({
  jobIds: ["job_1", "job_2"]
});

// Returns:
{
  jobs: [...],
  summary: {
    total: 2,
    completed: 1,
    failed: 0,
    processing: 1
  }
}
```

### CSV Format

```csv
prompt,metadata_field1,metadata_field2
"Create professional resume for software engineer",John Doe,Senior
"Create cover letter for marketing position",Jane Smith,Manager
```

Requirements:

- Must have a `prompt` or `text` column
- Other columns become metadata
- CSV should be UTF-8 encoded

---

## Webhooks (Enterprise)

**Available:** Enterprise only

### Features

- **Event subscriptions**: Listen to specific events
- **Signature verification**: Secure webhook payloads
- **Automatic retries**: Failed webhooks retry with exponential backoff
- **Failure monitoring**: Auto-disable after 10 consecutive failures
- **Test endpoint**: Send test events to verify webhook

### Available Events

- `pdf.created` - New PDF job created
- `pdf.completed` - PDF generation completed
- `pdf.failed` - PDF generation failed
- `subscription.updated` - Subscription tier changed
- `subscription.cancelled` - Subscription cancelled
- `team.member_added` - Team member added
- `team.member_removed` - Team member removed

### API Endpoints

#### List Webhooks

```typescript
const webhooks = await api.webhooks.list.query();
```

#### Create Webhook

```typescript
const webhook = await api.webhooks.create.mutate({
  url: "https://yourapp.com/webhooks",
  events: ["pdf.completed", "pdf.failed"],
});

// ⚠️ Save 'secret' - needed for signature verification
```

#### Test Webhook

```typescript
const result = await api.webhooks.test.mutate({
  webhookId: "webhook_123",
});
```

#### Update Webhook

```typescript
await api.webhooks.update.mutate({
  webhookId: "webhook_123",
  events: ["pdf.completed"],
  isActive: true,
});
```

### Receiving Webhooks

```typescript
// Verify webhook signature
import { createHash } from "crypto";

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = createHash("sha256")
    .update(payload + secret)
    .digest("hex");

  return signature === expectedSignature;
}

// Handle webhook
export async function POST(req: Request) {
  const signature = req.headers.get("x-webhook-signature");
  const payload = await req.text();

  if (!verifyWebhookSignature(payload, signature, YOUR_SECRET)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(payload);

  switch (event.event) {
    case "pdf.completed":
      // Handle completed PDF
      break;
    case "pdf.failed":
      // Handle failed PDF
      break;
  }

  return new Response("OK", { status: 200 });
}
```

### Webhook Payload Format

```json
{
  "event": "pdf.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "jobId": "job_123",
    "fileId": "file_456",
    "userId": "user_789"
  }
}
```

---

## Database Schema

### New Tables

#### `pdfprompt_file_version`

Stores version history for PDFs.

```sql
CREATE TABLE pdfprompt_file_version (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES pdfprompt_file(id),
  user_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  job_id TEXT REFERENCES pdfprompt_job(id),
  prompt TEXT,
  file_key TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### `pdfprompt_team_member`

Manages team collaboration.

```sql
CREATE TABLE pdfprompt_team_member (
  id TEXT PRIMARY KEY,
  team_owner_id TEXT NOT NULL,
  member_user_id TEXT NOT NULL,
  role VARCHAR(32) DEFAULT 'member' NOT NULL,
  invite_email TEXT,
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### `pdfprompt_api_key`

Stores API keys for programmatic access.

```sql
CREATE TABLE pdfprompt_api_key (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name VARCHAR(128) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### `pdfprompt_webhook`

Manages webhooks for Enterprise tier.

```sql
CREATE TABLE pdfprompt_webhook (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### `pdfprompt_branding_setting`

Custom branding settings for Business+ tiers.

```sql
CREATE TABLE pdfprompt_branding_setting (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  company_name VARCHAR(256),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  custom_domain TEXT,
  hide_platform_branding BOOLEAN DEFAULT false NOT NULL,
  footer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Migration

Run the Drizzle migration to create these tables:

```bash
pnpm drizzle-kit push
```

---

## Next Steps

### For Developers

1. **Run migrations**: `pnpm drizzle-kit push`
2. **Test features**: Use the tRPC playground or create test cases
3. **Build UI components**: Create dashboard UI for each feature
4. **Add permissions checks**: Ensure tier restrictions in UI

### For Product

1. **Update pricing page**: Ensure all features are listed correctly
2. **Create tutorials**: Video/text guides for each feature
3. **Customer communication**: Announce new features to existing users
4. **Upgrade prompts**: Add CTAs in UI for locked features

### For Support

1. **Document common issues**: FAQ for each feature
2. **Create support templates**: Responses for tier-related questions
3. **Monitor usage**: Track adoption of new features
4. **Collect feedback**: Gather user feedback on features

---

## Support

For questions or issues:

- Check feature-specific documentation above
- Review tier configuration in `src/server/subscription/tiers.ts`
- Test endpoints using tRPC playground
- Check logs for error details
