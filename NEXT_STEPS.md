# Next Steps: Subscription System Implementation

## ✅ What's Been Built

The complete subscription tier system is now implemented with:

1. **Database Schema** (`src/server/db/schema.ts`)
   - `userSubscriptions` table for tier management
   - `usageHistory` table for analytics
   - Migration file ready: `drizzle/0003_add_subscription_tiers.sql`

2. **Tier Configuration** (`src/server/subscription/tiers.ts`)
   - 4 tiers: Starter (free), Professional ($12), Business ($79), Enterprise ($500+)
   - Quota definitions, feature flags, pricing, AI model lists
   - Helper functions for quota checking and upgrade suggestions

3. **API Layer** (`src/server/api/routers/subscription.ts`)
   - `getCurrent`: Get user subscription with usage stats
   - `canGeneratePdf`: Check quota before generation
   - `incrementPdfUsage`: Track usage after generation
   - `getAllTiers`: Get tier comparison data
   - `upgradeTier`: Simulate tier changes (for testing)
   - `getUsageHistory`: Analytics and audit logs

4. **Quota Enforcement**
   - Job creation checks quota (`src/server/api/routers/jobs.ts`)
   - Worker increments usage after successful generation (`src/server/jobs/worker.ts`)
   - Clear error messages when quota exceeded

5. **Tier-Based Features**
   - AI model selection based on tier (`src/server/ai/openrouter.ts`)
   - Watermark for free tier users
   - Premium models for paid tiers

## 🚀 To Deploy

### 1. Run Database Migration

```bash
# Push schema changes to database
pnpm drizzle-kit push

# Or apply the SQL migration directly
psql $DATABASE_URL -f drizzle/0003_add_subscription_tiers.sql
```

### 2. Test the System

```bash
# Start the development server
pnpm dev

# Test subscription endpoints
# 1. Generate a PDF (creates starter subscription automatically)
# 2. Check usage: api.subscription.getCurrent.query()
# 3. Try to exceed quota (generate 6 PDFs)
# 4. Upgrade tier: api.subscription.upgradeTier.mutate({ newTier: "professional" })
# 5. Verify no watermark on professional tier
```

### 3. Verify Free Models Work

The system uses **only free OpenRouter models** for development:

- Starter tier: 13 free models (deepseek, grok, qwen, etc.)
- Professional/Business: Best free models prioritized
- No paid API costs during development

## 📋 TODO: Frontend UI Components

You'll need to build these React components:

### Priority 1: Essential

- [ ] **Pricing Page** (`/pricing`)
  - Display all 4 tiers in comparison table
  - "Upgrade" buttons for each tier
  - Feature comparison matrix

- [ ] **Usage Dashboard** (`/dashboard/usage`)
  - Show current tier and status
  - Progress bars for PDF quota and storage
  - Upgrade suggestions when near limits

- [ ] **Quota Exceeded Modal**
  - Triggered when user hits limit
  - Clear message with upgrade CTA
  - "View Plans" button

### Priority 2: User Experience

- [ ] **Watermark Notice**
  - Banner on free tier PDFs
  - "Upgrade to remove watermark" link

- [ ] **Upgrade Flow**
  - Tier selection page
  - Payment integration `paypal`
  - Success confirmation

- [ ] **Settings Page**
  - Current plan details
  - Usage history table
  - Cancel/downgrade options

### Priority 3: Business Features

- [ ] **Team Management** (Business tier)
  - Invite team members
  - Manage seats
  - Role assignment

- [ ] **API Keys Page** (Business tier)
  - Generate API keys
  - Usage tracking per key
  - Documentation link

- [ ] **Analytics Dashboard** (Business tier)
  - Charts for PDF generation over time
  - Team usage breakdown
  - Template popularity

## 🔌 Integration Points

### Payment Provider (Stripe Recommended)

```typescript
// Example: Create checkout session
import Stripe from "stripe";

export async function createCheckoutSession(userId: string, tier: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: TIER_PRICE_IDS[tier], // Create these in Stripe dashboard
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/pricing`,
  });

  return session.url;
}
```

### Webhook Handler

```typescript
// Handle Stripe subscription events
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
      // Update user tier in database
      break;
    case "customer.subscription.updated":
      // Handle plan changes
      break;
    case "customer.subscription.deleted":
      // Downgrade to free tier
      break;
  }
}
```

## 📊 Monitoring Setup

### Key Metrics to Track

```typescript
// Add these to your analytics dashboard
- Conversion rate: Free → Pro (target: 5-8%)
- Conversion rate: Pro → Business (target: 10-15%)
- Churn rate by tier (target: <5% monthly)
- Average PDFs per user per month
- Quota utilization (% of users hitting limits)
```

### Cost Monitoring

```typescript
// Track actual costs vs. revenue
- OpenRouter API costs per tier
- Storage costs (UploadThing)
- Infrastructure costs (Netlify, Neon)
- Profit margin by tier (target: >70%)
```

## 🧪 Testing Checklist

Run these tests before launch:

```bash
# Test 1: Free tier quota enforcement
- [ ] Create 5 PDFs successfully
- [ ] 6th PDF blocked with error message
- [ ] Watermark visible on all free PDFs

# Test 2: Upgrade flow
- [ ] Upgrade to Professional
- [ ] Quota increases to 50
- [ ] Watermark removed
- [ ] Premium models used

# Test 3: Usage tracking
- [ ] pdfsUsedThisMonth increments correctly
- [ ] storageUsedBytes updates
- [ ] usageHistory logs created

# Test 4: Period reset
- [ ] Manually set periodEnd to past date
- [ ] Call checkAndResetIfNeeded
- [ ] Verify quota resets to 0

# Test 5: Upgrade suggestions
- [ ] Generate 4 PDFs (80% of free quota)
- [ ] Check getCurrent response
- [ ] Verify upgradeSuggestion.shouldUpgrade = true
```

## 🎨 UI/UX Recommendations

### Pricing Page Design

- Use the tier comparison table from `SUBSCRIPTION_SYSTEM.md`
- Highlight "Professional" as most popular
- Add "Save 17%" badge on yearly plans
- Include FAQ section addressing common concerns

### Upgrade Prompts

- **Soft prompts** at 50% quota: "You're halfway through your monthly PDFs"
- **Medium prompts** at 80% quota: Banner with upgrade CTA
- **Hard block** at 100% quota: Modal requiring upgrade or wait

### Watermark Design

- Fixed position (bottom-right corner)
- Subtle but visible
- Link to `/pricing` page
- Professional appearance (not spammy)

## 🔒 Security Considerations

- [ ] Validate tier changes server-side (never trust client)
- [ ] Rate limit subscription API endpoints
- [ ] Verify payment webhook signatures (Stripe)
- [ ] Audit log all tier changes
- [ ] Prevent quota manipulation (atomic DB updates)

## 📚 Documentation

All documentation is in `SUBSCRIPTION_SYSTEM.md`:

- Architecture overview
- Tier details with pricing
- API endpoint reference
- Implementation flow diagrams
- Testing procedures

## 🎯 Launch Readiness

Before going live:

1. ✅ Database migration applied
2. ⏳ Payment provider integrated (Stripe/Paddle)
3. ⏳ Frontend pricing page built
4. ⏳ Upgrade flow tested end-to-end
5. ⏳ Webhook handlers deployed
6. ⏳ Monitoring dashboards set up
7. ⏳ Legal: Terms of Service, Privacy Policy updated
8. ⏳ Support: FAQ and help docs created

## 💡 Quick Wins

Start with these to get immediate value:

1. **Deploy migration** → Users auto-get starter tier
2. **Add quota check** → Prevents abuse of free tier
3. **Show usage stats** → Users see their consumption
4. **Add watermark** → Creates upgrade incentive
5. **Build pricing page** → Enables self-service upgrades

---

**Current Status**: Backend complete, ready for frontend integration and payment provider setup.

**Estimated Time to Launch**: 2-3 weeks with frontend + payment integration.

**Next Immediate Step**: Run `pnpm drizzle-kit push` to apply database migration.
