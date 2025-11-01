# Testing TODO

This document contains all testing-related tasks organized by priority.

---

## 🔴 HIGH PRIORITY

### 1. Testing Infrastructure

#### 1.1 Set Up Testing Framework

- [x] Configure Vitest for unit tests
- [x] Set up Playwright for E2E tests
- [x] Create test database setup script
- [x] Configure test environment variables
- [x] Add test scripts to package.json
- [x] Set up test coverage reporting (v8 coverage)
- [x] Configure CI/CD to run tests on PRs

#### 1.2 Integration Tests - Job Creation Flow

- [x] Test: Create job as authenticated user
- [x] Test: Create job as unauthenticated user
- [x] Test: Job queues correctly
- [ ] Test: Job processes successfully
- [ ] Test: Job fails gracefully
- [x] Test: Job deduplication works
- [x] Test: Quota enforcement works
- [ ] Test: Job status updates via SSE

#### 1.3 Integration Tests - PDF Generation

- [ ] Test: Generate PDF from simple text prompt
- [ ] Test: Generate PDF with image (cover mode)
- [ ] Test: Generate PDF with image (inline mode)
- [ ] Test: Generate PDF with RTL text (Arabic)
- [ ] Test: Generate PDF with CJK text (Chinese)
- [ ] Test: Generate PDF with multiple languages
- [ ] Test: PDF generation fallback to Puppeteer
- [ ] Test: PDF generation fallback to PDFKit
- [ ] Test: Watermark added for free tier
- [ ] Test: Watermark removed for paid tier

#### 1.4 Integration Tests - Payment Flows

- [ ] Test: Subscribe to paid tier (Professional)
- [ ] Test: Subscribe to paid tier (Business)
- [ ] Test: Purchase credits
- [ ] Test: Polar webhook handling (subscription created)
- [ ] Test: Polar webhook handling (subscription cancelled)
- [ ] Test: Polar webhook handling (payment failed)
- [ ] Test: Credit deduction on PDF generation
- [ ] Test: Quota enforcement after subscription

#### 1.5 Unit Tests - tRPC Routers

- [ ] Test: `jobsRouter.create` mutation
- [ ] Test: `jobsRouter.get` query
- [ ] Test: `jobsRouter.recreate` mutation
- [ ] Test: `jobsRouter.listRecent` query
- [ ] Test: `subscriptionRouter.getCurrent` query
- [ ] Test: `filesRouter.getSignedUrl` query
- [ ] Test: `apiKeysRouter.create` mutation
- [ ] Test: `apiKeysRouter.list` query
- [ ] Test: `apiKeysRouter.revoke` mutation
- [ ] Test: `referralsRouter.create` mutation
- [ ] Test: `referralsRouter.getRewards` query

#### 1.6 Unit Tests - Business Logic

- [ ] Test: `generateHtmlFromPrompt` (OpenRouter)
- [ ] Test: `generatePdfBuffer` function
- [ ] Test: `checkForDuplicateJob` function
- [ ] Test: `hasExceededQuota` function
- [ ] Test: `getTierConfig` function
- [ ] Test: `verifyApiKey` function
- [ ] Test: Cache operations (get/set/del)
- [ ] Test: Request deduplication logic
- [ ] Test: Round-robin API key rotation

#### 1.7 E2E Tests - User Journeys

- [ ] Test: New user signs up → creates first PDF
- [ ] Test: Free user hits quota → sees upgrade prompt
- [ ] Test: Free user upgrades to Professional
- [ ] Test: Paid user generates 100 PDFs successfully
- [ ] Test: User refers friend → earns credits
- [ ] Test: User uploads image → generates PDF with image
- [ ] Test: User regenerates PDF with modifications
- [ ] Test: User downloads PDF successfully
- [ ] Test: User shares PDF via share link

#### 1.8 Test Coverage Goals

- [ ] Achieve >70% overall code coverage
- [ ] Achieve >90% coverage for critical paths
- [ ] Achieve >80% coverage for business logic
- [ ] Add coverage badge to README
- [ ] Configure coverage thresholds in Vitest

---

## 📊 Progress Tracking

**Testing Infrastructure:** 0/8 sections complete  
**Total Tasks:** 60+  
**Estimated Time:** 2-3 weeks

---

_Last Updated: November 1, 2025_
