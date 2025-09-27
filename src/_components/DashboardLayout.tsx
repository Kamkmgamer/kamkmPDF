import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
