# Security TODO

This document contains all security-related tasks organized by priority.

---

## 🔴 HIGH PRIORITY

### 2. Rate Limiting Implementation

#### 2.1 Install Dependencies

- [x] Install `@upstash/ratelimit`
- [x] Install `@upstash/redis` (or use existing Redis)
- [x] Add Redis URL to environment variables

#### 2.2 Create Rate Limiting Utility

- [x] Create `src/lib/rate-limit.ts`
- [x] Configure rate limits for PDF generation (10 per minute)
- [x] Configure rate limits for API calls (100 per minute)
- [x] Configure rate limits for file uploads (20 per minute)
- [x] Configure rate limits for job creation (30 per minute)
- [x] Add different limits for authenticated vs unauthenticated users
- [x] Add tier-based rate limits (higher limits for paid tiers)

#### 2.3 Apply Rate Limiting to Routes

- [x] Add rate limiting to `/api/jobs/create-with-image`
- [x] Add rate limiting to `/api/v1/generate`
- [x] Add rate limiting to tRPC `jobs.create` mutation
- [x] Add rate limiting to file upload endpoints
- [x] Add rate limiting to API key endpoints
- [x] Add rate limiting to subscription endpoints

#### 2.4 Error Handling

- [x] Return proper 429 status codes
- [x] Include retry-after headers
- [x] Show user-friendly error messages
- [x] Log rate limit violations for monitoring

#### 2.5 Testing

- [x] Test rate limiting works correctly
- [x] Test rate limits reset after time window
- [x] Test different limits for different tiers
- [x] Test rate limiting doesn't affect authenticated users incorrectly

---

### 4. Security Headers

#### 4.1 Configure Security Headers in Next.js

- [x] Add `X-Frame-Options: DENY` header
- [x] Add `X-Content-Type-Options: nosniff` header
- [x] Add `X-XSS-Protection` header
- [x] Add `Referrer-Policy` header
- [x] Add `Permissions-Policy` header
- [x] Add `Content-Security-Policy` header
- [x] Configure headers in `next.config.js`

#### 4.2 CSP Configuration

- [x] Whitelist necessary domains (fonts, images)
- [x] Allow inline styles for PDF generation
- [x] Configure nonce for scripts
- [x] Test CSP doesn't break functionality
- [x] Document CSP exceptions

#### 4.3 Testing

- [x] Test security headers are present
- [x] Test CSP doesn't block legitimate resources
- [x] Use security headers checker (securityheaders.com)
- [x] Verify headers in production

---

### 9. Input Validation & Sanitization

#### 9.1 Server-Side Validation

- [x] Add prompt length validation server-side
- [x] Add prompt content validation (sanitize HTML)
- [x] Add file type validation server-side (magic numbers)
- [x] Add file size validation server-side
- [x] Add image dimension validation
- [x] Prevent prompt injection attacks

#### 9.2 Sanitization

- [x] Sanitize user prompts before AI processing
- [x] Sanitize HTML output from AI
- [x] Escape user input in database queries (already using ORM)
- [x] Validate file uploads with magic numbers
- [x] Add virus scanning for uploads (optional)

#### 9.3 Testing

- [x] Test prompt injection prevention
- [x] Test XSS prevention
- [x] Test file upload validation
- [x] Test input length limits

---

## 🟡 MEDIUM PRIORITY

### Security Audit Checklist

#### API Security

- [x] Implement API key scoping (read vs write)
- [x] Rotate API keys regularly
- [x] Add audit logging for sensitive operations
- [x] Implement IP-based blocking for abuse
- [x] Add captcha for unauthenticated actions

#### Authentication & Authorization

- [x] Review Clerk session management
- [x] Add 2FA for admin accounts (if applicable)
- [x] Implement secure session management
- [x] Review password policies (if custom auth)

#### Data Security

- [x] Encrypt sensitive data at rest
- [x] Review database encryption settings
- [x] Implement secure file storage
- [x] Review UploadThing security settings

#### Webhook Security

- [x] Implement webhook signature verification (already done for Polar)
- [x] Add webhook rate limiting
- [x] Add webhook retry logic
- [x] Review webhook security for all providers

#### Infrastructure Security

- [x] Review environment variable security
- [x] Implement secrets rotation
- [x] Add DDoS protection (Cloudflare)
- [x] Implement proper CORS policies
- [x] Review serverless function security

#### Security Testing

- [x] Perform SQL injection tests
- [x] Perform XSS tests
- [x] Perform CSRF tests
- [x] Perform authentication bypass tests
- [x] Perform authorization tests
- [x] Set up automated security scanning in CI/CD
- [x] Perform regular security audits

---

## 📊 Progress Tracking

**Rate Limiting:** 5/5 sections complete  
**Security Headers:** 3/3 sections complete  
**Input Validation:** 3/3 sections complete  
**Security Audit:** 6/6 sections complete

**Total Tasks:** 50+ ✅ COMPLETED  
**Estimated Time:** 1-2 weeks for high priority

**🎉 ALL SECURITY FEATURES IMPLEMENTED AND WORKING**

---

_Last Updated: November 2, 2025_
