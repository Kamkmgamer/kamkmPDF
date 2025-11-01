# Arabic Font Support on Netlify

## How It Works

The Arabic font support uses a **multi-layer fallback strategy** that ensures fonts work both locally and on Netlify:

### Layer 1: Base64 Embedded Fonts (Best Performance)

- Tries to read font files from file system and embed as base64
- Works in local development
- May work in Netlify if fonts are accessible via `included_files`

### Layer 2: URL-Based Local Fonts (Netlify CDN)

- Falls back to `/fonts/*.ttf` URLs pointing to `public/fonts/`
- **On Netlify, these files are served via CDN** (configured in `netlify.toml`)
- Works reliably because Netlify serves `public/` folder as static assets

### Layer 3: Google Fonts (Ultimate Fallback)

- If local fonts fail, Google Fonts URLs are used
- Guaranteed to work if network is available

## Netlify Configuration

The `netlify.toml` includes:

```toml
[functions]
  included_files = ["public/fonts/**/*"]

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"
```

This ensures:

1. Font files are included in function builds (for potential base64 access)
2. Fonts are served via CDN with proper caching headers
3. CORS headers allow fonts to load in PDF generation context

## Why It Will Work on Netlify

1. **Public folder is served**: Netlify automatically serves the `public/` folder as static assets
2. **URL-based fonts work**: Even if file system access fails, `/fonts/*.ttf` URLs will resolve via CDN
3. **Font loading is handled**: The code waits for `document.fonts.ready` before generating PDFs
4. **Multiple fallbacks**: Base64 → Local URLs → Google Fonts ensures something always works

## Testing on Netlify

After deployment, test:

1. `/api/debug/pdf-arabic` - Should generate PDF with Arabic text
2. Create a job with Arabic text - Should render correctly
3. Check server logs for "Arabic font checks" to verify font loading

## Font Files Location

Fonts are stored in `public/fonts/`:

- `NotoNaskhArabic-Regular.ttf`
- `NotoSansArabic-Regular.ttf`
- `Amiri-Regular.ttf`

These files are:

- Committed to git (so they're available in Netlify builds)
- Served via Netlify CDN at `/fonts/*.ttf`
- Included in function builds via `included_files`

## Troubleshooting

If Arabic text doesn't render on Netlify:

1. **Check font URLs**: Verify `/fonts/*.ttf` URLs are accessible (should return font files)
2. **Check logs**: Look for "Arabic font checks" in server logs
3. **Try bypass**: Set `PDFPROMPT_BYPASS_AI_FOR_RTL=1` to bypass AI and render prompt verbatim
4. **Verify fonts**: The debug route `/api/debug/pdf-arabic` uses only local fonts
