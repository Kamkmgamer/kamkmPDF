"use client";

import { usePathname } from "next/navigation";
import Footer from "~/app/_components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on PDF pages
  const isPdfPage = pathname?.startsWith("/pdf/");

  if (isPdfPage) {
    return null;
  }

  return <Footer />;
}
