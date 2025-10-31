Place Arabic-capable TTF/OTF fonts in this directory (e.g., NotoNaskhArabic-Regular.ttf or Amiri-Regular.ttf).

At runtime in Netlify Functions, this folder is available at /var/task/.fonts and is searched by fontconfig/Chromium.

No code changes needed once the font files are present.

