# Security TODO

This document contains all security-related tasks organized by priority.

---

## 🔴 HIGH PRIORITY

### 2. Rate Limiting Implementation

#### 2.1 Install Dependencies

- [ ] Install `@upstash/ratelimit`
- [ ] Install `@upstash/redis` (or use existing Redis)
- [ ] Add Redis URL to environment variables

#### 2.2 Create Rate Limiting Utility

- [ ] Create `src/lib/rate-limit.ts`
- [ ] Configure rate limits for PDF generation (10 per minute)
- [ ] Configure rate limits for API calls (100 per minute)
- [ ] Configure rate limits for file uploads (20 per minute)
- [ ] Configure rate limits for job creation (30 per minute)
- [ ] Add different limits for authenticated vs unauthenticated users
- [ ] Add tier-based rate limits (higher limits for paid tiers)

#### 2.3 Apply Rate Limiting to Routes

- [ ] Add rate limiting to `/api/jobs/create-with-image`
- [ ] Add rate limiting to `/api/v1/generate`
- [ ] Add rate limiting to tRPC `jobs.create` mutation
- [ ] Add rate limiting to file upload endpoints
- [ ] Add rate limiting to API key endpoints
- [ ] Add rate limiting to subscription endpoints

#### 2.4 Error Handling

- [ ] Return proper 429 status codes
- [ ] Include retry-after headers
- [ ] Show user-friendly error messages
- [ ] Log rate limit violations for monitoring

#### 2.5 Testing

- [ ] Test rate limiting works correctly
- [ ] Test rate limits reset after time window
- [ ] Test different limits for different tiers
- [ ] Test rate limiting doesn't affect authenticated users incorrectly

---

### 4. Security Headers

#### 4.1 Configure Security Headers in Next.js

- [ ] Add `X-Frame-Options: DENY` header
- [ ] Add `X-Content-Type-Options: nosniff` header
- [ ] Add `X-XSS-Protection` header
- [ ] Add `Referrer-Policy` header
- [ ] Add `Permissions-Policy` header
- [ ] Add `Content-Security-Policy` header
- [ ] Configure headers in `next.config.js`

#### 4.2 CSP Configuration

- [ ] Whitelist necessary domains (fonts, images)
- [ ] Allow inline styles for PDF generation
- [ ] Configure nonce for scripts
- [ ] Test CSP doesn't break functionality
- [ ] Document CSP exceptions

#### 4.3 Testing

- [ ] Test security headers are present
- [ ] Test CSP doesn't block legitimate resources
- [ ] Use security headers checker (securityheaders.com)
- [ ] Verify headers in production

---

### 9. Input Validation & Sanitization

#### 9.1 Server-Side Validation

- [ ] Add prompt length validation server-side
- [ ] Add prompt content validation (sanitize HTML)
- [ ] Add file type validation server-side (magic numbers)
- [ ] Add file size validation server-side
- [ ] Add image dimension validation
- [ ] Prevent prompt injection attacks

#### 9.2 Sanitization

- [ ] Sanitize user prompts before AI processing
- [ ] Sanitize HTML output from AI
- [ ] Escape user input in database queries (already using ORM)
- [ ] Validate file uploads with magic numbers
- [ ] Add virus scanning for uploads (optional)

#### 9.3 Testing

- [ ] Test prompt injection prevention
- [ ] Test XSS prevention
- [ ] Test file upload validation
- [ ] Test input length limits

---

## 🟡 MEDIUM PRIORITY

### Security Audit Checklist

#### API Security

- [ ] Implement API key scoping (read vs write)
- [ ] Rotate API keys regularly
- [ ] Add audit logging for sensitive operations
- [ ] Implement IP-based blocking for abuse
- [ ] Add captcha for unauthenticated actions

#### Authentication & Authorization

- [ ] Review Clerk session management
- [ ] Add 2FA for admin accounts (if applicable)
- [ ] Implement secure session management
- [ ] Review password policies (if custom auth)

#### Data Security

- [ ] Encrypt sensitive data at rest
- [ ] Review database encryption settings
- [ ] Implement secure file storage
- [ ] Review UploadThing security settings

#### Webhook Security

- [ ] Implement webhook signature verification (already done for Polar)
- [ ] Add webhook rate limiting
- [ ] Add webhook retry logic
- [ ] Review webhook security for all providers

#### Infrastructure Security

- [ ] Review environment variable security
- [ ] Implement secrets rotation
- [ ] Add DDoS protection (Cloudflare)
- [ ] Implement proper CORS policies
- [ ] Review serverless function security

#### Security Testing

- [ ] Perform SQL injection tests
- [ ] Perform XSS tests
- [ ] Perform CSRF tests
- [ ] Perform authentication bypass tests
- [ ] Perform authorization tests
- [ ] Set up automated security scanning in CI/CD
- [ ] Perform regular security audits

---

## 📊 Progress Tracking

**Rate Limiting:** 0/5 sections complete  
**Security Headers:** 0/3 sections complete  
**Input Validation:** 0/3 sections complete  
**Security Audit:** 0/6 sections complete

**Total Tasks:** 50+  
**Estimated Time:** 1-2 weeks for high priority

---

_Last Updated: November 1, 2025_
