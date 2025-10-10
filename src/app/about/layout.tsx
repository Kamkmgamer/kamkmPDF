import type { Metadata } from "next";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "About | kamkmPDF",
  description:
    "Learn about kamkmPDF — AI-powered PDF generation and document automation platform.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | kamkmPDF",
    description: "About kamkmPDF",
    url: "/about",
    images: ["/og/about.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | kamkmPDF",
    description: "About kamkmPDF",
    images: ["/og/about.png"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
