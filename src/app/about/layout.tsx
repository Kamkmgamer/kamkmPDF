import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "About | KamkmPDF",
  description:
    "Learn about KamkmPDF — AI-powered PDF generation and document automation platform.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | KamkmPDF",
    description: "About KamkmPDF",
    url: "/about",
    images: ["/og/about.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | KamkmPDF",
    description: "About KamkmPDF",
    images: ["/og/about.png"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
