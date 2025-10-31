"use client";

import { usePathname } from "next/navigation";
import Footer from "~/app/_components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on PDF pages or home page
  const isPdfPage = pathname?.startsWith("/pdf/");
  const isHomePage = pathname === "/";

  if (isPdfPage || isHomePage) {
    return null;
  }

  return <Footer />;
}
