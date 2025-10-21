import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "Status | kamkmPDF",
  description: "Service status and uptime for kamkmPDF.",
  alternates: { canonical: "/status" },
  openGraph: {
    title: "Status | kamkmPDF",
    description: "Service status and uptime for kamkmPDF",
    url: "/status",
    images: ["/og/status.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Status | kamkmPDF",
    description: "Service status and uptime for kamkmPDF",
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
