$ErrorActionPreference = 'Stop'
$Path = "src/app/page.tsx"
if (-not (Test-Path -LiteralPath $Path)) { throw "File not found: $Path" }
$content = Get-Content -Raw -LiteralPath $Path
$marker = '            {/* Feature highlights with 3D depth - Bento Grid Style */}'
if ($content.IndexOf($marker) -lt 0) { throw "Marker not found: $marker" }
$insert = @'
            {/* Secondary internal links for SEO and quick navigation */}
            <div className="mt-2 mb-12 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/pricing" className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-white">
                See pricing
              </Link>
              <span className="mx-2">•</span>
              <Link href="/help" className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-white">
                Read docs
              </Link>
              <span className="mx-2">•</span>
              <Link href="/security" className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-white">
                Security
              </Link>
            </div>

'@
$new = $content.Replace($marker, $insert + $marker)
Set-Content -LiteralPath $Path -Value $new -NoNewline
