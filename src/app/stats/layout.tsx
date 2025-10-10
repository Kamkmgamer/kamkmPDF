import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats | kamkmPDF",
  description: "Usage statistics and platform insights.",
  alternates: { canonical: "/stats" },
  openGraph: {
    title: "Stats | kamkmPDF",
    description: "Usage statistics and platform insights",
    url: "/stats",
    images: ["/og/stats.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stats | kamkmPDF",
    description: "Usage statistics and platform insights",
    images: ["/og/stats.png"],
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
