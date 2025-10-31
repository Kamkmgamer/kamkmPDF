"use client";

import { usePathname } from "next/navigation";
import Header from "~/_components/Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Don't show header on PDF pages
  const isPdfPage = pathname?.startsWith("/pdf/");

  if (isPdfPage) {
    return null;
  }

  return <Header />;
}

