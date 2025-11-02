import type { Metadata } from "next";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR for marketing page

export const metadata: Metadata = {
  title: "Contact | KamkmPDF",
  description:
    "Contact the KamkmPDF team for support, sales, and partnerships.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | KamkmPDF",
    description: "Contact the KamkmPDF team",
    url: "/contact",
    images: ["/og/contact.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | KamkmPDF",
    description: "Contact the KamkmPDF team",
    images: ["/og/contact.png"],
  },
};

export default function ContactLayout({
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
