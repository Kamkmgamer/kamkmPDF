# Custom Branding Feature Specification

**Author:** Khalil Abd AlMageed Khalil Mohammed
**Date:** 2025-10-02
**Version:** 1.0
**Status:** Partially Implemented

## 1. Overview

The Custom Branding feature enables users to personalize their generated PDFs with their own logos, fonts, colors, and company information. This allows for professional, brand-consistent documents that enhance corporate identity and build trust with recipients. The core of this feature is the "Brand Kit," a reusable collection of branding assets and settings that can be applied to various PDF templates.

**Current Implementation Status:**

- ✅ Subscription tier configuration includes `customBranding` feature flag
- ✅ Business and Enterprise tiers have `customBranding: true`
- ✅ Basic PDF generation supports `brandName` parameter for watermarking
- ❌ Brand Kit database schema not implemented
- ❌ Brand Kit management UI not implemented
- ❌ Full branding injection in PDF generation not implemented
- ❌ API endpoints for Brand Kit CRUD operations not implemented

## 2. User Stories

- **As a freelancer,** I want to add my personal logo and contact information to the proposals and invoices I generate, so my clients have a professional and consistent experience.
- **As a small business owner,** I want all my reports to use my company's color scheme and official font to ensure brand consistency across all communications.
- **As a marketing manager at a large company,** I need to create multiple Brand Kits for different product lines and ensure that all generated PDFs strictly adhere to our corporate branding guidelines, including logo placement and custom fonts.

## 3. Functional Requirements

### 3.1. Brand Kit Management

- Users can create, edit, and delete "Brand Kits" from their dashboard.
- Each user can have one or more Brand Kits, based on their subscription tier.
- **Current Status:** Not implemented. Directory structure exists at `/dashboard/branding/[id]` but no components.

### 3.2. Logo Upload and Configuration

- **Supported Formats:** `PNG`, `JPG`, `SVG`.
- **Upload:** A file uploader with a client-side size limit (e.g., 5MB).
- **Positioning:** Users can select one of the following placements for their logo:
  - Header (Left, Center, Right)
  - Footer (Left, Center, Right)
  - Watermark (Centered, Tiled)
  - Cover Page (Prominently centered)
- **Controls:**
  - **Size:** A slider or input field to control the logo's width (e.g., 20% - 100% of the header/footer content area).
  - **Opacity:** A slider for watermark opacity (e.g., 10% - 50%).
- **Current Status:** Not implemented. UploadThing infrastructure exists for file uploads.

### 3.3. Font Selection

- **Built-in Fonts:** A curated list of professional, licensed fonts will be available to all users with branding access (e.g., Lato, Roboto, Montserrat, Open Sans, Merriweather).
- **Custom Font Uploads:**
  - **Supported Formats:** `TTF`, `OTF`, `WOFF2`.
  - **Application:** Users can assign fonts to "Headings" and "Body Text".
  - **Disclaimer:** The UI must include a checkbox and text stating, "I confirm I have the necessary licenses to use this font."
- **Current Status:** Not implemented.

### 3.4. Color Schemes

- **Predefined Themes:** A selection of 5-7 professionally designed themes (e.g., "Corporate Blue," "Modern Minimalist," "Elegant Onyx").
- **Custom Colors:** Users can define custom colors using a color picker for:
  - **Primary Color:** Used for main headings and links.
  - **Secondary Color:** Used for subheadings and accents.
  - **Accent Color:** Used for borders, quote blocks, and other decorative elements.
- **Current Status:** Not implemented.

### 3.5. Company Information

- Users can input the following text-based information into their Brand Kit:
  - Company Name
  - Tagline or Slogan
  - Contact Information (Address, Phone, Email, Website)
- **Placement:** This information can be dynamically inserted into headers, footers, or sidebars, as defined by the chosen PDF template.
- **Current Status:** Not implemented.

## 4. UI/UX Flow

### 4.1. Entry Point

- A new "Branding" section should be added to the main navigation within the user's `Dashboard`.
- **Current Status:** Navigation link not added to `Header.tsx`.

### 4.2. Brand Kit Gallery

- This page displays the user's existing Brand Kits as cards.
- A prominent "Create New Brand Kit" button is visible.
- **Current Status:** Page component not implemented.

### 4.3. Brand Kit Editor

- A dedicated page for creating or editing a Brand Kit.
- The page is organized into tabs or accordions: `Logo`, `Colors & Fonts`, `Company Info`.
- **Logo Tab:** Contains the file uploader, a visual preview of the PDF, and controls for position and size.
- **Colors & Fonts Tab:** Shows color pickers for primary/secondary/accent colors and dropdowns for selecting heading/body fonts. An "Upload Custom Font" button opens a modal for font file uploads.
- **Company Info Tab:** Provides text fields for company details.
- A "Save Brand Kit" button persists the changes.
- **Current Status:** Not implemented.

### 4.4. Applying a Brand Kit

- When creating a new PDF (e.g., on the `/dashboard/new` page or a template page), a dropdown menu titled "Apply Brand Kit" will appear.
- The dropdown lists the user's saved Brand Kits (e.g., "Default Brand," "Product Line B").
- Selecting a Brand Kit should ideally update the PDF preview in real-time to reflect the new branding.
- **Current Status:** No Brand Kit selection UI in PDF creation flow.

## 5. Technical Implementation

### 5.1. Database Schema

A new table, `brand_kits`, is required.

```sql
CREATE TABLE brand_kits (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  logo_position VARCHAR(50) DEFAULT 'header-right', -- e.g., 'header-left', 'watermark-center'
  logo_size_percent INT DEFAULT 50,
  colors JSONB, -- { "primary": "#0F172A", "secondary": "#475569", "accent": "#3B82F6" }
  fonts JSONB, -- { "heading": "Lato", "body": "custom_font_url.ttf" }
  company_info JSONB, -- { "name": "...", "tagline": "...", "contact": "..." }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Current Status:** Not implemented. Schema exists in `drizzle/schema.ts` but no brand_kits table.

### 5.2. Asset Storage

- **Logos and Custom Fonts:** These files should be uploaded to a cloud storage provider (like AWS S3 or Cloudflare R2), leveraging the existing `uploadthing` infrastructure. The resulting URL will be stored in the `brand_kits` table.
- **Security:** Use signed URLs for uploads to ensure security.
- **Current Status:** UploadThing is configured and used for other file uploads.

### 5.3. API Endpoints

The existing tRPC API should be extended with a new router for `brandKits`.

- `brandKits.create(data)`: Creates a new Brand Kit.
- `brandKits.list()`: Lists all Brand Kits for the authenticated user.
- `brandKits.update(id, data)`: Updates a specific Brand Kit.
- `brandKits.delete(id)`: Deletes a Brand Kit.

**Current Status:** Not implemented. No brandKits router in `src/server/api/routers/`.

### 5.4. PDF Generation Logic (`/src/server/jobs/htmlToPdf.ts`)

- The PDF generation function must be modified to accept an optional `brandKitId`.
- If a `brandKitId` is provided:
  1.  Fetch the corresponding Brand Kit from the database.
  2.  Dynamically inject the branding into the HTML template before it's passed to the PDF renderer (e.g., Puppeteer).
  3.  **Colors:** Inject CSS variables into the `:root` of the document.
      ```css
      :root {
        --primary-color: ${brandKit.colors.primary};
        --secondary-color: ${brandKit.colors.secondary};
      }
      ```
  4.  **Fonts:** If a custom font is used, inject an `@font-face` rule pointing to the font's URL in cloud storage.
  5.  **Logo:** Conditionally render an `<img>` tag in the appropriate header, footer, or as a background element for watermarks.
  6.  **Company Info:** Populate designated template placeholders with the `company_info` data.

**Current Status:** Basic `brandName` parameter exists for watermarking, but full Brand Kit integration not implemented.

## 6. Tiered Access & Monetization

This feature is a strong incentive for users to upgrade. Access should be gated based on subscription plans.

- **Free Plan (Starter):**
  - No access to Custom Branding.
  - All generated PDFs include a "Made with Kamkm PDF" watermark.
- **Pro / Standard Plan (Professional):**
  - **1** Brand Kit allowed.
  - Access to all built-in fonts.
  - No custom font uploads.
- **Business / Enterprise Plan (Business/Enterprise):**
  - **Unlimited** Brand Kits.
  - Full access to all features, including custom font uploads.
  - Access to premium, branding-ready templates (e.g., complex reports, proposals).

**Current Status:** Tier configuration implemented in `src/server/subscription/tiers.ts` with correct feature flags.

## 7. Implementation Roadmap

### Phase 1: Core Infrastructure

1. Create `brand_kits` database table and migration
2. Implement tRPC router for Brand Kit CRUD operations
3. Add Brand Kit selection to PDF creation flow
4. Basic logo upload and positioning

### Phase 2: Enhanced Branding

1. Color scheme customization
2. Font selection (built-in fonts)
3. Company information fields
4. Real-time PDF preview with branding

### Phase 3: Advanced Features

1. Custom font uploads
2. Multiple Brand Kits per user
3. Template-specific branding rules
4. Brand Kit sharing/collaboration (Enterprise)

### Phase 4: Polish & Optimization

1. UI/UX refinements
2. Performance optimizations
3. Analytics and usage tracking
4. Premium template integration

## 8. Dependencies

- Database migration for `brand_kits` table
- UploadThing configuration for logo/font uploads
- UI components for color pickers, font selectors
- PDF template modifications to support dynamic branding
- Subscription tier enforcement in API endpoints

## 9. Testing Considerations

- Brand Kit creation, editing, deletion
- Logo upload with various formats and sizes
- PDF generation with different Brand Kit configurations
- Subscription tier access control
- Real-time preview functionality
- Cross-browser compatibility for font rendering
- Mobile responsiveness of branding UI
