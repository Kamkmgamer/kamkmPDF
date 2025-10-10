import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Pricing | kamkmPDF",
  description:
    "Simple, transparent pricing for AI-powered PDF generation and automation. Monthly and yearly plans. Start free.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | kamkmPDF",
    description:
      "Simple, transparent pricing for AI-powered PDF generation and automation.",
    url: "/pricing",
    images: ["/og/pricing.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | kamkmPDF",
    description:
      "Simple, transparent pricing for AI-powered PDF generation and automation.",
    images: ["/og/pricing.png"],
  },
};

export default function PricingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // FAQPage JSON-LD matching visible content in pricing page
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I change plans anytime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I exceed my quota?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You'll receive notifications at 80% usage. If you hit your limit, you can upgrade instantly or wait until next month's reset.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer refunds?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods do you accept?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="ld-pricing-faq"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(faq)}
      </Script>
      {children}
    </>
  );
}
