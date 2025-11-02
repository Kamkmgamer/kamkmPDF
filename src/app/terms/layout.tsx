import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | KamkmPDF",
  description: "Read the KamkmPDF Terms of Service.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | KamkmPDF",
    description: "Read the KamkmPDF Terms of Service",
    url: "/terms",
    images: ["/og/terms.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | KamkmPDF",
    description: "Read the KamkmPDF Terms of Service",
    images: ["/og/terms.png"],
  },
};

export default function TermsLayout({
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
