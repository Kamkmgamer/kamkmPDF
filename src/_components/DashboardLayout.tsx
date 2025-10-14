import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const washRef = React.useRef<HTMLDivElement | null>(null);
  const gridRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onScroll() {
      const y = window.scrollY || 0;
      // Subtle parallax: opposite directions with small factors
      if (washRef.current)
        washRef.current.style.transform = `translateY(${y * 0.02}px)`;
      if (gridRef.current)
        gridRef.current.style.transform = `translateY(${-y * 0.015}px)`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="bg-[--color-bg] text-[--color-text-primary]">
      {/* Soft gradient and grid background (with dark mode + subtle motion) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Radial color washes */}
        <div
          ref={washRef}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.14),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.1),transparent_55%)] bg-fixed transition-transform duration-700 ease-out dark:bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.08),transparent_55%)]"
        />
        {/* Subtle grid with vignette mask */}
        <div
          ref={gridRef}
          className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] [background-size:24px_24px] bg-fixed transition-transform duration-700 ease-out dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
        />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
