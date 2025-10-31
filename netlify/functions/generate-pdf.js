// Arabic-safe PDF generation via Puppeteer + Sparticuz Chromium
// - Loads an Arabic-capable webfont (Noto Naskh Arabic) from Google Fonts
// - Waits for document.fonts to be ready before printing to PDF
// - Uses packaged Chromium on Netlify; full Puppeteer locally

export const handler = async function handler() {
  // Ensure fontconfig (when present) searches default task paths
  if (!process.env.FONTCONFIG_PATH) {
    process.env.FONTCONFIG_PATH = '/var/task';
  }

  const isLocal = !!process.env.NETLIFY_LOCAL || !!process.env.NETLIFY_DEV;

  const chromiumModule = await import('@sparticuz/chromium');
  const chromium = chromiumModule.default;

  const puppeteer = isLocal
    ? (await import('puppeteer')).default
    : (await import('puppeteer-core')).default;

  const launchOptions = {
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
    ],
    headless: typeof chromium.headless === 'string' && chromium.headless === 'new' ? 'new' : Boolean(chromium.headless),
    defaultViewport: chromium.defaultViewport,
    executablePath: isLocal ? undefined : await chromium.executablePath(),
  };

  // @ts-expect-error - chromium types may not match puppeteer types exactly
  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();

    const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>Arabic PDF Test</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Noto Naskh Arabic', serif; font-size: 20px; }
      p { line-height: 1.6; }
    </style>
  </head>
  <body>
    <p>لما كان تناسي حقوق الإنسان وازدراؤها قد أفضيا إلى أعمال همجية</p>
  </body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    // Small delay to ensure fonts are fully rendered
    await new Promise(resolve => setTimeout(resolve, 200));

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // Convert Buffer to base64 string for Netlify function response
    const base64Body = Buffer.isBuffer(pdfBuffer) 
      ? pdfBuffer.toString('base64') 
      : Buffer.from(pdfBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/pdf' },
      body: base64Body,
      isBase64Encoded: true,
    };
  } catch (error) {
    return { statusCode: 500, body: String(error) };
  } finally {
    await browser.close();
  }
}


