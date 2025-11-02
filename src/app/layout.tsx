import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://KamkmPDF.com",
  ),
  title: "KamkmPDF — AI PDF Generator & Document Automation",
  description:
    "Generate professional PDFs with AI. Templates, branding, collaboration, and a developer-friendly PDF API. Start free.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "KamkmPDF — AI PDF Generator & Document Automation",
    description:
      "Generate professional PDFs with AI. Templates, branding, collaboration, and a developer-friendly PDF API.",
    url: "/",
    siteName: "KamkmPDF",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "KamkmPDF - AI PDF Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@KamkmPDF",
    creator: "@KamkmPDF",
    title: "KamkmPDF — AI PDF Generator & Document Automation",
    description: "Generate professional PDFs with AI.",
    images: ["/og/home.png"],
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        {/* Pre-hydration theme setter to avoid FOUC and ensure correct theme on first paint */}
        <Script id="theme-setter" strategy="beforeInteractive">
          {`
            try {
              var saved = localStorage.getItem('theme');
              var theme = saved || 'light';
              var root = document.documentElement;
              root.setAttribute('data-theme', theme);
              try { root.style.colorScheme = theme; } catch (e) {}
              // Ensure Tailwind dark: variants activate via the class strategy
              var isDark = theme === 'dark';
              try {
                root.classList.toggle('dark', isDark);
                if (document.body) document.body.classList.toggle('dark', isDark);
              } catch (e) {}
            } catch (e) {}
          `}
        </Script>
        {/* Organization JSON-LD */}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "KamkmPDF",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://KamkmPDF.com",
            logo:
              (process.env.NEXT_PUBLIC_SITE_URL ?? "https://KamkmPDF.com") +
              "/favicon.ico",
            sameAs: [
              "https://twitter.com/KamkmPDF",
              "https://www.linkedin.com/company/KamkmPDF",
              "https://github.com/Kamkmgamer/KamkmPDF",
            ],
          })}
        </Script>
        {/* SaaSProduct JSON-LD */}
        <Script
          id="ld-saas"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "KamkmPDF",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "USD",
              lowPrice: "0",
              highPrice: "500",
              offers: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "0",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Professional",
                  price: "12",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Business",
                  price: "79",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Enterprise",
                  price: "500",
                  priceCurrency: "USD",
                },
              ],
            },
            description:
              "AI-powered PDF generation with templates, branding, collaboration and a developer-friendly API.",
          })}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className="bg-[--color-bg] text-[--color-text-primary]"
      >
        {/* Skip to content for keyboard users */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[--color-surface] focus:px-3 focus:py-2 focus:shadow focus:outline-none"
        >
          Skip to content
        </a>
        <div id="content" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
