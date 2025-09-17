import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      <header className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-bold">
            Prompt-to-PDF
          </Link>
          <nav>
            <Link href="/dashboard" className="mr-4">
              Dashboard
            </Link>
            <Link href="/account">Account</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">{children}</main>
      <footer className="py-6 text-center text-sm text-[--color-text-muted]">
        © Prompt-to-PDF
      </footer>
    </div>
  );
}
