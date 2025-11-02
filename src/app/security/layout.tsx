import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "Security | KamkmPDF",
  description:
    "Secure cloud document storage with encryption at rest and in transit, access controls, and audit logs.",
  alternates: { canonical: "/security" },
  openGraph: {
    title: "Security | KamkmPDF",
    description: "Security and compliance at KamkmPDF",
    url: "/security",
    images: ["/og/security.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Security | KamkmPDF",
    description: "Security and compliance at KamkmPDF",
    images: ["/og/security.png"],
  },
};

export default function SecurityLayout({
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
