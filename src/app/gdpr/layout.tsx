import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "GDPR | KamkmPDF",
  description: "GDPR compliance and data protection practices at KamkmPDF.",
  alternates: { canonical: "/gdpr" },
  openGraph: {
    title: "GDPR | KamkmPDF",
    description: "GDPR compliance at KamkmPDF",
    url: "/gdpr",
    images: ["/og/gdpr.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "GDPR | KamkmPDF",
    description: "GDPR compliance at KamkmPDF",
    images: ["/og/gdpr.png"],
  },
};

export default function GDPRLayout({
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
