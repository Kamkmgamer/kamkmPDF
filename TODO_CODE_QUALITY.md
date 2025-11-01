# Code Quality & Architecture TODO

This document contains all code quality, refactoring, and architecture improvement tasks.

---

## 🟡 MEDIUM PRIORITY

### 6. Refactor Large Components

#### 6.1 Refactor `src/app/(app)/page.tsx` (950 lines)

- [ ] Extract `PromptEditor` component
- [ ] Extract `ToneSelector` component
- [ ] Extract `ImageUploader` component
- [ ] Extract `FrequentlyGeneratedPDFs` component
- [ ] Extract `SoftUpgradeCTA` component
- [ ] Extract `MobileSuggestionCard` component
- [ ] Extract hooks (`useAutosave`, `useUnloadWarning`, `useImageHandling`)
- [ ] Move hooks to `src/hooks/` directory
- [ ] Test refactored components work correctly

#### 6.2 Refactor `src/app/(app)/dashboard/page.tsx` (201 lines)

- [ ] Extract `WelcomeHeader` component
- [ ] Extract `QuickActions` component
- [ ] Extract `ActionCard` component (already extracted, verify)
- [ ] Extract `RecentDocuments` component
- [ ] Simplify component structure

#### 6.3 Extract Shared Components

- [ ] Create `src/components/ui/` directory
- [ ] Extract reusable button components
- [ ] Extract reusable input components
- [ ] Extract reusable modal components
- [ ] Extract reusable loading components
- [ ] Document component API

---

### 7. Service Layer Implementation

#### 7.1 Create Service Layer Structure

- [ ] Create `src/server/services/` directory
- [ ] Create `JobService.ts`
- [ ] Create `SubscriptionService.ts`
- [ ] Create `PdfService.ts`
- [ ] Create `FileService.ts`
- [ ] Create `UserService.ts`
- [ ] Create `ApiKeyService.ts`

#### 7.2 Implement Job Service

- [ ] Move job creation logic from router to service
- [ ] Move job processing logic to service
- [ ] Move job query logic to service
- [ ] Add job service tests
- [ ] Update routers to use service

#### 7.3 Implement Subscription Service

- [ ] Move subscription logic from router to service
- [ ] Move quota checking to service
- [ ] Move tier configuration to service
- [ ] Add subscription service tests
- [ ] Update routers to use service

#### 7.4 Implement PDF Service

- [ ] Move PDF generation logic to service
- [ ] Move caching logic to service
- [ ] Move fallback logic to service
- [ ] Add PDF service tests
- [ ] Update routers to use service

#### 7.5 Create Repository Layer (Optional)

- [ ] Create `src/server/repositories/` directory
- [ ] Create `JobRepository.ts`
- [ ] Create `UserRepository.ts`
- [ ] Create `FileRepository.ts`
- [ ] Abstract database access
- [ ] Add repository tests

---

### 8. API Documentation

#### 8.1 Generate OpenAPI Documentation

- [ ] Install `trpc-openapi` or similar
- [ ] Generate OpenAPI spec from tRPC routes
- [ ] Add descriptions to all procedures
- [ ] Add examples to all procedures
- [ ] Add error responses to documentation

#### 8.2 Set Up API Documentation UI

- [ ] Install Swagger UI or Redoc
- [ ] Serve documentation at `/api-docs`
- [ ] Add authentication to docs (if needed)
- [ ] Style documentation to match brand
- [ ] Add API versioning

#### 8.3 Document API Endpoints

- [ ] Document all tRPC procedures
- [ ] Document REST API endpoints (`/api/v1/*`)
- [ ] Document webhook endpoints
- [ ] Document authentication methods
- [ ] Add code examples for each endpoint
- [ ] Add rate limiting information
- [ ] Document error codes

#### 8.4 Maintain Documentation

- [ ] Set up automatic docs generation in CI
- [ ] Add docs generation to pre-commit hook
- [ ] Create docs update checklist for PRs

---

### 20. Code Quality Improvements

#### 20.1 Remove Code Smells

- [ ] Remove excessive `eslint-disable` comments
- [ ] Refactor code with `any` types
- [ ] Fix inconsistent error handling
- [ ] Remove duplicate code
- [ ] Improve type safety

#### 20.2 Improve Error Messages

- [ ] Centralize error messages
- [ ] Create error message constants
- [ ] Make error messages user-friendly
- [ ] Add error codes
- [ ] Document error codes

#### 20.3 Improve Code Consistency

- [ ] Standardize naming conventions
- [ ] Standardize file structure
- [ ] Standardize import order
- [ ] Add code style guide
- [ ] Enforce code style in CI

#### 20.4 Type Safety Improvements

- [ ] Review all `any` types
- [ ] Add strict null checks
- [ ] Improve type inference
- [ ] Add branded types where appropriate
- [ ] Document complex types

---

## 🟢 LOW PRIORITY

### Architecture Improvements

#### Clean Architecture Patterns

- [ ] Implement dependency inversion
- [ ] Add domain layer (if needed)
- [ ] Separate infrastructure from business logic
- [ ] Add adapter pattern for external services
- [ ] Document architectural decisions (ADRs)

#### Code Organization

- [ ] Review folder structure
- [ ] Group related files together
- [ ] Create index files for exports
- [ ] Document module boundaries
- [ ] Review circular dependencies

---

## 📊 Progress Tracking

**Component Refactoring:** 0/3 sections complete  
**Service Layer:** 0/5 sections complete  
**API Documentation:** 0/4 sections complete  
**Code Quality:** 0/4 sections complete

**Total Tasks:** 60+  
**Estimated Time:** 3-4 weeks

---

_Last Updated: November 1, 2025_
