import ThemeProvider from "~/providers/ThemeProvider";
import MarketingHeader from "./_components/MarketingHeader";
import Footer from "~/app/_components/Footer";

export const revalidate = 86400; // 24h ISR default for marketing subtree

export default function MarketingGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <MarketingHeader />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
