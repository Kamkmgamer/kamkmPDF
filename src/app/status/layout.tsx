import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "Status | KamkmPDF",
  description: "Service status and uptime for KamkmPDF.",
  alternates: { canonical: "/status" },
  openGraph: {
    title: "Status | KamkmPDF",
    description: "Service status and uptime for KamkmPDF",
    url: "/status",
    images: ["/og/status.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Status | KamkmPDF",
    description: "Service status and uptime for KamkmPDF",
    images: ["/og/status.png"],
  },
};

export default function StatusLayout({
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
