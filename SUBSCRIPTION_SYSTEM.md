# Subscription Tier System

## Overview

This document describes the subscription tier system implemented for the PDF generation SaaS platform. The system includes 4 tiers (Starter, Professional, Business, Enterprise) with quota enforcement, usage tracking, and tier-based AI model selection.

## Architecture

### Database Schema

#### `pdfprompt_user_subscription`

Stores user subscription information:

- `tier`: Current subscription tier (starter, professional, business, enterprise)
- `status`: Subscription status (active, cancelled, expired)
- `pdfsUsedThisMonth`: Counter for PDFs generated in current billing period
- `storageUsedBytes`: Total storage used by user
- `periodStart` / `periodEnd`: Billing period dates
- `cancelAtPeriodEnd`: Flag for scheduled cancellations

#### `pdfprompt_usage_history`

Logs all usage events for analytics:

- `action`: Type of action (pdf_generated, tier_upgraded, etc.)
- `amount`: Quantity of resource used
- `metadata`: Flexible JSON field for additional context

### Tier Configuration

Located in `src/server/subscription/tiers.ts`, defines:

- **Quotas**: PDFs per month, storage limits, file size limits
- **Features**: Watermarks, processing speed, AI models, collaboration tools
- **Pricing**: Monthly and yearly rates
- **Models**: OpenRouter model IDs for each tier

## Subscription Tiers

### 🆓 Starter (Free)

**Target**: Students, job seekers, casual users

**Quotas**:

- 5 PDFs/month
- 50 MB storage (30-day retention)
- 2 MB max file size

**Features**:

- ✅ Free AI models (13 fallback models)
- ✅ Basic templates (3)
- ❌ Watermark on exports
- ❌ 2-5 minute processing time
- ❌ Community support only

**AI Models**: All free OpenRouter models (deepseek, grok, qwen, etc.)

---

### 💼 Professional ($12/month)

**Target**: Freelancers, consultants, professionals

**Quotas**:

- 50 PDFs/month
- 2 GB storage (permanent)
- 10 MB max file size

**Features**:

- ✅ Premium AI models (GPT-4 class)
- ✅ 20+ premium templates
- ✅ No watermarks
- ✅ <60 second processing
- ✅ Version history (10 versions)
- ✅ Email support (24-48h)

**AI Models**: Sonoma-dusk, Sonoma-sky, best free models

**Cost Justification**: $1 model costs + $2 infrastructure = $9 margin (75%)

---

### 🏢 Business ($79/month)

**Target**: Small teams (5-20 people), agencies, HR departments

**Quotas**:

- 500 PDFs/month (pooled)
- 50 GB storage
- 25 MB max file size
- 5 team seats (+$8/seat)

**Features**:

- ✅ Everything in Professional
- ✅ Team collaboration (shared folders, comments)
- ✅ Custom branding (remove platform branding)
- ✅ Bulk generation (CSV upload)
- ✅ Analytics dashboard
- ✅ API access (beta)
- ✅ <30 second processing
- ✅ Priority support (live chat)

**AI Models**: Premium models with priority queue

**Cost Justification**: $10 model costs + $5 infrastructure = $64 margin (81%)

---

### 🏛️ Enterprise (Custom, $500+/month)

**Target**: Large corporations, government agencies

**Quotas**:

- Unlimited PDFs
- Unlimited storage
- 100 MB max file size
- Unlimited seats

**Features**:

- ✅ Everything in Business
- ✅ White-label options
- ✅ SLA guarantee (99.9% uptime)
- ✅ Dedicated account manager
- ✅ Custom integrations (SSO, HRIS)
- ✅ Advanced security (SOC 2, GDPR)
- ✅ Custom AI training
- ✅ <15 second processing

**AI Models**: Best available + custom fine-tuned models

---

## Implementation Flow

### 1. User Creates Job

```typescript
// src/server/api/routers/jobs.ts
jobs.create() {
  // Check subscription exists (create if not)
  // Check quota not exceeded
  // Create job if allowed
  // Throw error if quota exceeded
}
```

### 2. Worker Processes Job

```typescript
// src/server/jobs/worker.ts
processJob() {
  // Get user's subscription tier
  // Determine watermark setting
  // Pass tier to PDF generation
  // Generate PDF with tier-specific models
  // Increment usage counters
  // Log usage history
}
```

### 3. PDF Generation

```typescript
// src/server/ai/openrouter.ts
generateHtmlFromPrompt({ tier }) {
  // Select models based on tier
  // Free tier: 13 free models
  // Paid tiers: Premium models first
}

wrapHtmlDocument(html, title, addWatermark) {
  // Add watermark for free tier
  // Clean output for paid tiers
}
```

### 4. Usage Tracking

```typescript
// Automatic on successful PDF generation
- Increment pdfsUsedThisMonth
- Add to storageUsedBytes
- Log to usage_history
```

## API Endpoints (tRPC)

### `subscription.getCurrent`

Returns user's subscription with usage stats:

```typescript
{
  tier: "professional",
  status: "active",
  usage: {
    pdfs: { used: 12, limit: 50, percentage: 24 },
    storage: { usedGB: 0.5, limitGB: 2, percentage: 25 }
  },
  upgradeSuggestion: { shouldUpgrade: false, ... }
}
```

### `subscription.canGeneratePdf`

Checks if user can generate a PDF:

```typescript
{
  canGenerate: true,
  pdfsRemaining: 38,
  reason: ""
}
```

### `subscription.getAllTiers`

Returns all tier configurations for comparison page

### `subscription.upgradeTier`

Simulates tier upgrade (for testing - integrate with Stripe in production)

### `subscription.getUsageHistory`

Returns usage logs for analytics

## Quota Enforcement

### Creation Time

- Job creation checks quota before allowing new jobs
- Returns clear error message with upgrade CTA

### Processing Time

- Worker increments usage after successful generation
- Prevents race conditions with atomic updates

### Period Reset

- `checkAndResetIfNeeded` mutation checks if billing period ended
- Resets `pdfsUsedThisMonth` to 0
- Sets new `periodStart` and `periodEnd`

## Upgrade Logic

### Automatic Suggestions

System suggests upgrades when:

- User reaches 80% of PDF quota
- User reaches 80% of storage quota

### Upgrade Triggers

- Quota limit modal with "Upgrade Now" button
- Watermark with "Remove watermark" link
- Feature-locked UI elements (API access, team features)

## Development Setup

### 1. Run Migration

```bash
# Apply the subscription schema
pnpm drizzle-kit push
```

### 2. Test Tier System

```typescript
// Create a test user subscription
await api.subscription.upgradeTier.mutate({ newTier: "professional" });

// Check quota
const canGenerate = await api.subscription.canGeneratePdf.query();

// Generate PDF (will use professional tier models)
await api.jobs.create.mutate({ prompt: "Create a resume" });
```

### 3. Monitor Usage

```typescript
// View current usage
const sub = await api.subscription.getCurrent.query();
console.log(sub.usage);

// View history
const history = await api.subscription.getUsageHistory.query({ limit: 30 });
```

## Production Considerations

### Payment Integration

Currently using simulated upgrades. For production:

1. Integrate Stripe/Paddle for payment processing
2. Add webhook handlers for subscription events
3. Update `upgradeTier` to create Stripe checkout sessions
4. Handle subscription lifecycle (trial, active, past_due, cancelled)

### Cron Jobs

Set up scheduled tasks:

- **Monthly reset**: Reset quotas at period end
- **Usage alerts**: Email users at 80% quota
- **Expiration checks**: Mark expired subscriptions

### Analytics

Track key metrics:

- Free → Pro conversion rate (target: 5-8%)
- Pro → Business conversion rate (target: 10-15%)
- Churn rate by tier (target: <5% monthly)
- Average PDFs per user per month

### Cost Monitoring

- Track actual OpenRouter costs per tier
- Adjust pricing if margins drop below 70%
- Monitor storage costs (UploadThing)

## Testing Checklist

- [ ] Free user can generate 5 PDFs
- [ ] Free user sees watermark on PDFs
- [ ] Free user blocked at 6th PDF with upgrade message
- [ ] Professional user gets no watermark
- [ ] Professional user uses premium models
- [ ] Business user can access API
- [ ] Usage counters increment correctly
- [ ] Period reset works after 30 days
- [ ] Upgrade suggestions appear at 80% quota
- [ ] Usage history logs all actions

## File Structure

```
src/
├── server/
│   ├── subscription/
│   │   └── tiers.ts              # Tier configuration
│   ├── api/
│   │   └── routers/
│   │       ├── subscription.ts   # Subscription API
│   │       └── jobs.ts           # Updated with quota checks
│   ├── jobs/
│   │   ├── worker.ts             # Updated with tier logic
│   │   └── pdf.ts                # Updated with watermark
│   ├── ai/
│   │   └── openrouter.ts         # Updated with tier models
│   └── db/
│       └── schema.ts             # Database schema
└── drizzle/
    └── 0003_add_subscription_tiers.sql  # Migration

```

## Future Enhancements

### Phase 2

- [ ] Team management UI
- [ ] Role-based permissions
- [ ] Shared folders and collaboration
- [ ] Bulk PDF generation interface

### Phase 3

- [ ] API documentation and keys
- [ ] Webhook system for integrations
- [ ] Custom template builder
- [ ] Advanced analytics dashboard

### Phase 4

- [ ] White-label options
- [ ] SSO integration (SAML/OIDC)
- [ ] Custom AI model fine-tuning
- [ ] On-premise deployment option

---

## Support

For questions or issues with the subscription system:

1. Check this documentation
2. Review tier configuration in `src/server/subscription/tiers.ts`
3. Test with `subscription.getCurrent` to debug user state
4. Check usage history for audit trail
