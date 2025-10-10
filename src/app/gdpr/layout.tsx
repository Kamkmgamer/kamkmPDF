import type { Metadata } from "next";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "GDPR | kamkmPDF",
  description: "GDPR compliance and data protection practices at kamkmPDF.",
  alternates: { canonical: "/gdpr" },
  openGraph: {
    title: "GDPR | kamkmPDF",
    description: "GDPR compliance at kamkmPDF",
    url: "/gdpr",
    images: ["/og/gdpr.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "GDPR | kamkmPDF",
    description: "GDPR compliance at kamkmPDF",
    images: ["/og/gdpr.png"],
  },
};

export default function GDPRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
