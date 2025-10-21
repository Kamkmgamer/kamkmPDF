import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "Cookies | kamkmPDF",
  description: "Cookie policy and preferences for kamkmPDF.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookies | kamkmPDF",
    description: "Cookie policy and preferences",
    url: "/cookies",
    images: ["/og/cookies.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookies | kamkmPDF",
    description: "Cookie policy and preferences",
    images: ["/og/cookies.png"],
  },
};

export default function CookiesLayout({
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
