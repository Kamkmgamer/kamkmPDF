import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | kamkmPDF",
  description: "Read the kamkmPDF Privacy Policy.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | kamkmPDF",
    description: "Read the kamkmPDF Privacy Policy",
    url: "/privacy",
    images: ["/og/privacy.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | kamkmPDF",
    description: "Read the kamkmPDF Privacy Policy",
    images: ["/og/privacy.png"],
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
