# Enhanced Regenerate PDF Feature

## Overview

The Regenerate PDF feature allows users to modify and improve existing PDFs through AI-powered editing. Instead of generating documents from scratch, the system uses the previously generated HTML as a base template, making edits more efficient and credit-friendly.

## Key Features

### ✨ **Smart Regeneration**

- **Base Template Editing**: Reuses existing HTML structure for faster, more accurate modifications
- **Two Modes**:
  - Same Prompt (1 credit): Regenerate with the original prompt
  - With New Content (0.5 credits): Add instructions or images

### 💳 **Credit-Aware System**

- Dynamic credit deduction based on regeneration mode
- Real-time credit balance display
- Quota checking before regeneration
- Prevents regeneration when insufficient credits

### 📝 **Flexible Editing Options**

- Add new text instructions to modify existing content
- Upload new images to replace placeholders
- Combine text and image modifications
- Drag-and-drop image upload support

### 🎨 **Modern UI/UX**

- Beautiful modal interface matching app design
- Real-time validation and error handling
- Progress indicators during regeneration
- Smooth animations with Framer Motion

## Architecture

### Database Schema

New fields added to `jobs` table:

```sql
- generatedHtml: text          -- Stores the HTML output for reuse
- imageUrls: jsonb             -- References to uploaded images
- regenerationCount: integer   -- Tracks number of regenerations
- parentJobId: text            -- Links to original job
```

### Components

#### RegenerateModal

**Location**: `src/app/(app)/pdf/[id]/_components/RegenerateModal.tsx`

Main modal component with:

- Prompt textarea for new instructions
- Image upload area with drag-and-drop
- Credit cost calculator
- Validation and error handling
- Two submission buttons (Same Prompt / With New Content)

**Props**:

```typescript
interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (data: RegenerateData) => Promise<void>;
  job: Job;
  userCredits?: number;
  isRegenerating?: boolean;
}
```

### API Routes

#### 1. **tRPC Mutation** (`jobs.recreate`)

**Location**: `src/server/api/routers/jobs.ts`

Handles text-only regeneration:

```typescript
input: {
  jobId: string;
  mode: "same" | "edit";
  newPrompt?: string;
  imageUrls?: string[];
}
```

**Features**:

- Credit deduction (0.5 or 1 credit)
- Quota validation
- HTML base template passing
- Parent job tracking

#### 2. **Image Upload API**

**Location**: `src/app/api/jobs/regenerate-with-images/route.ts`

Handles regeneration with image uploads:

- Validates image files (PNG/JPEG, max 8MB)
- Saves to temporary storage
- Creates new job with images
- Updates credit balance

### Credit System

| Regeneration Mode | Credit Cost | Description                     |
| ----------------- | ----------- | ------------------------------- |
| Same Prompt       | 1 credit    | Regenerate with original prompt |
| With New Content  | 0.5 credits | Add new instructions or images  |

**Credit Calculation**:

```typescript
const creditCost = mode === "edit" ? 0.5 : 1;
const effectivePdfCount = pdfsUsedThisMonth + creditCost;
```

## Usage Flow

### 1. **User Clicks Regenerate Button**

```tsx
<Toolbar onRegenerate={() => setShowRegenerateModal(true)} />
```

### 2. **Modal Opens with Options**

- Displays original prompt
- Shows textarea for new instructions
- Provides image upload area
- Displays credit cost and balance

### 3. **User Makes Selection**

**Option A: Same Prompt**

- Reuse original prompt without changes
- Costs 1 full credit
- Quick regeneration

**Option B: With New Content**

- Add new text instructions
- Upload replacement images
- Costs 0.5 credits (50% discount)
- AI merges changes with base template

### 4. **System Processes Request**

```typescript
const handleRegenerate = async (data: RegenerateData) => {
  if (data.images && data.images.length > 0) {
    // Use FormData API for image uploads
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("mode", data.mode);
    if (data.newPrompt) {
      formData.append("newPrompt", data.newPrompt);
    }
    data.images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fetch("/api/jobs/regenerate-with-images", {
      method: "POST",
      body: formData,
    });
  } else {
    // Use tRPC for text-only
    const result = await regenerateMutation.mutateAsync({
      jobId,
      mode: data.mode,
      newPrompt: data.newPrompt,
    });
  }
};
```

### 5. **Backend Processing**

1. Validates user authentication
2. Checks credit balance/quota
3. Retrieves original job and HTML
4. Processes uploaded images (if any)
5. Constructs final prompt with edits
6. Creates new job with base HTML
7. Deducts credits
8. Triggers worker for PDF generation
9. Returns new job ID

### 6. **User Redirected to New PDF**

```typescript
router.push(`/pdf/${newJobId}`);
```

## Integration Points

### PDFViewerPage Component

**Location**: `src/app/(app)/pdf/[id]/_components/PDFViewerPage.tsx`

Updated to:

- Import `RegenerateModal` instead of `ConfirmModal`
- Pass subscription data for credit calculation
- Handle both image and text regeneration
- Navigate to new job after regeneration

### Subscription Context

```typescript
const { data: subscription } = api.subscription.getCurrent.useQuery();
const userCredits = subscription
  ? subscription.tierConfig.quotas.pdfsPerMonth - subscription.pdfsUsedThisMonth
  : 0;
```

## Error Handling

### Client-Side Validation

- Empty prompt and no images → Error message
- Insufficient credits → Warning with upgrade prompt
- Invalid file types → File type error
- File too large → Size limit error

### Server-Side Validation

```typescript
// Quota check
if (effectivePdfCount > tierConfig.quotas.pdfsPerMonth) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Monthly limit reached. Please upgrade.",
  });
}

// Image validation
if (!ACCEPTED_TYPES.has(mime)) {
  return { error: "Unsupported file type. Use PNG or JPEG." };
}
```

## UI/UX Features

### Modal Design

- **Modern glassmorphism effect** with backdrop blur
- **Responsive layout** (mobile, tablet, desktop)
- **Smooth animations** using Framer Motion
- **Dark mode support** matching app theme
- **Accessibility** with keyboard navigation and ARIA labels

### Visual Feedback

- Loading spinners during regeneration
- Success/error toasts
- Credit cost preview
- Image thumbnails with remove buttons
- Drag-and-drop visual states

### Mobile Optimization

- Touch-friendly buttons and controls
- Responsive grid for image previews
- Collapsible sections on small screens
- Optimized modal height for mobile

## Testing

### Test Scenarios

**1. Same Prompt Regeneration**

```
1. Open PDF viewer
2. Click "Regenerate" button
3. Click "Same Prompt" without changes
4. Verify 1 credit deducted
5. Verify navigation to new PDF
```

**2. Edit with New Instructions**

```
1. Open PDF viewer
2. Click "Regenerate"
3. Enter new prompt: "Add a summary section"
4. Click "With New Content"
5. Verify 0.5 credits deducted
6. Verify PDF includes summary
```

**3. Image Upload**

```
1. Open PDF viewer
2. Click "Regenerate"
3. Drag and drop images
4. Click "With New Content"
5. Verify images uploaded
6. Verify 0.5 credits deducted
```

**4. Insufficient Credits**

```
1. Use account with 0 credits
2. Click "Regenerate"
3. Verify buttons disabled
4. Verify warning message shown
```

### Development Testing

**Reset credits for testing**:

```sql
UPDATE pdfprompt_user_subscription
SET pdfsUsedThisMonth = 0
WHERE userId = 'your_user_id';
```

**Check job regeneration chain**:

```sql
SELECT id, parentJobId, regenerationCount, prompt
FROM pdfprompt_job
WHERE userId = 'your_user_id'
ORDER BY createdAt DESC;
```

## Configuration

### Environment Variables

No new environment variables required. Uses existing:

- `NEXT_PUBLIC_APP_URL` - Base URL for worker triggers
- `PDFPROMPT_WORKER_SECRET` - Worker authentication

### Credit Costs

To modify credit costs, update in `src/server/api/routers/jobs.ts`:

```typescript
const creditCost = input.mode === "edit" ? 0.5 : 1;
```

## Migration

### Running the Migration

```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:push

# Or manually run SQL
psql $DATABASE_URL < drizzle/0003_add_html_storage.sql
```

### Backward Compatibility

- Existing jobs without `generatedHtml` will regenerate from scratch
- `regenerationCount` defaults to 0 for existing jobs
- No breaking changes to existing API endpoints

## Future Enhancements

### Potential Improvements

1. **Multiple image support** - Allow uploading several images at once
2. **Version history** - View and restore previous versions
3. **Side-by-side comparison** - Compare old and new PDFs
4. **Batch regeneration** - Regenerate multiple PDFs with same edits
5. **Template saving** - Save common edit patterns as templates
6. **AI suggestions** - Suggest improvements based on content
7. **Collaborative editing** - Multiple users editing same document
8. **Cost estimation** - Preview AI token usage before regeneration

### Optimization Opportunities

- **Incremental HTML patching** - Only regenerate changed sections
- **Caching strategy** - Cache base HTML for faster access
- **Batch processing** - Queue multiple regenerations efficiently
- **Delta compression** - Store only HTML differences

## Troubleshooting

### Common Issues

**Issue**: Modal doesn't open

- **Check**: `showRegenerateModal` state management
- **Check**: Modal z-index and positioning
- **Fix**: Verify `isOpen` prop is true

**Issue**: Credits not deducting

- **Check**: Subscription query returns data
- **Check**: Database update query executes
- **Fix**: Verify `effectivePdfCount` calculation

**Issue**: Images not uploading

- **Check**: File size under 8MB
- **Check**: File type is PNG or JPEG
- **Check**: Temp storage directory exists
- **Fix**: Check browser console for errors

**Issue**: Regeneration fails

- **Check**: Worker is running
- **Check**: Base HTML exists in original job
- **Check**: Database transaction completed
- **Fix**: Check server logs for errors

### Debug Mode

Enable verbose logging:

```typescript
console.log("Regenerating job:", {
  jobId,
  mode: data.mode,
  hasNewPrompt: !!data.newPrompt,
  imageCount: data.images?.length ?? 0,
  creditCost,
});
```

## Performance Considerations

### Optimization Strategies

1. **Lazy load images** in modal for faster open
2. **Debounce prompt input** to reduce re-renders
3. **Compress images** before upload
4. **Cache subscription data** to reduce API calls
5. **Use React.memo** for RegenerateModal components

### Metrics to Monitor

- Modal open time
- Image upload speed
- API response time
- Credit deduction accuracy
- Regeneration success rate

## Security

### Security Measures

- ✅ Authentication required (Clerk)
- ✅ User ownership validation
- ✅ Quota enforcement
- ✅ File type validation
- ✅ File size limits
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ XSS protection (Next.js sanitization)

### Best Practices

- Always validate user owns the job
- Sanitize prompt input before storage
- Verify image MIME types server-side
- Rate limit regeneration requests
- Log all regeneration attempts

## Support

For issues or questions about the Regenerate PDF feature:

1. Check this documentation
2. Review server logs
3. Test with different subscription tiers
4. Verify database schema is up to date
5. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready
