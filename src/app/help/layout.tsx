import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | kamkmPDF",
  description:
    "Guides and tutorials: AI document creation, templates, API integration, and billing.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Help Center | kamkmPDF",
    description: "Guides and tutorials",
    url: "/help",
    images: ["/og/help.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Center | kamkmPDF",
    description: "Guides and tutorials",
    images: ["/og/help.png"],
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
