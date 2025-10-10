import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security | kamkmPDF",
  description:
    "Secure cloud document storage with encryption at rest and in transit, access controls, and audit logs.",
  alternates: { canonical: "/security" },
  openGraph: {
    title: "Security | kamkmPDF",
    description: "Security and compliance at kamkmPDF",
    url: "/security",
    images: ["/og/security.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Security | kamkmPDF",
    description: "Security and compliance at kamkmPDF",
    images: ["/og/security.png"],
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
