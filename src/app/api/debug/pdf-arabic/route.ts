export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generatePdfFromHtml } from "~/lib/pdf-generator";
import { getLocalArabicFontFacesCss } from "~/server/utils/multilingualText";

export async function GET() {
  try {
    const localFonts = getLocalArabicFontFacesCss({ base64: true });

    const html = `<!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <style>
          ${localFonts}
          body { font-family: 'Noto Naskh Arabic','Noto Sans Arabic','Amiri', Arial, sans-serif; margin: 40px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: right; }
        </style>
      </head>
      <body>
        <h1>اختبار عرض العربية</h1>
        <p>لما كان تناسي حقوق الإنسان وازدراؤها قد أفضيا إلى أعمال همجية...</p>
        <table>
          <thead><tr><th>أ</th><th>ب</th><th>ت</th></tr></thead>
          <tbody>
            <tr><td>١</td><td>٢</td><td>٣</td></tr>
            <tr><td>٤</td><td>٥</td><td>٦</td></tr>
          </tbody>
        </table>
      </body>
    </html>`;

    const result = await generatePdfFromHtml(html, {
      format: "A4",
      printBackground: true,
    });
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfData = new Uint8Array(result.buffer);
    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
