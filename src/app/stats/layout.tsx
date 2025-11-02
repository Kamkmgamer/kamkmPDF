import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "Stats | KamkmPDF",
  description: "Usage statistics and platform insights.",
  alternates: { canonical: "/stats" },
  openGraph: {
    title: "Stats | KamkmPDF",
    description: "Usage statistics and platform insights",
    url: "/stats",
    images: ["/og/stats.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stats | KamkmPDF",
    description: "Usage statistics and platform insights",
    images: ["/og/stats.png"],
  },
};

export default function StatsLayout({
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
