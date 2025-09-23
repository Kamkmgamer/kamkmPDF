import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";

import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import ThemeProvider from "~/providers/ThemeProvider";
import Header from "~/_components/Header";

export const metadata: Metadata = {
  title: "Prompt‑to‑PDF — Generate polished PDFs from natural language",
  description:
    "Turn plain prompts into professional, branded PDFs in seconds. Create proposals, reports and more with AI-powered precision.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
        <head>
          {/* Pre-hydration theme setter to avoid FOUC and ensure correct theme on first paint */}
          <Script id="theme-setter" strategy="beforeInteractive">
            {`
              try {
                var saved = localStorage.getItem('theme');
                var theme = saved || 'light';
                var root = document.documentElement;
                root.setAttribute('data-theme', theme);
                try { root.style.colorScheme = theme; } catch (e) {}
                // Ensure Tailwind dark: variants activate via the class strategy
                var isDark = theme === 'dark';
                try {
                  root.classList.toggle('dark', isDark);
                  if (document.body) document.body.classList.toggle('dark', isDark);
                } catch (e) {}
              } catch (e) {}
            `}
          </Script>
        </head>
        <body
          suppressHydrationWarning
          className="bg-[--color-bg] text-[--color-text-primary]"
        >
          {/* Skip to content for keyboard users */}
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[--color-surface] focus:px-3 focus:py-2 focus:shadow focus:outline-none"
          >
            Skip to content
          </a>
          <TRPCReactProvider>
            <ThemeProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <div id="content" className="flex-1">
                  {children}
                </div>
              </div>
            </ThemeProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
