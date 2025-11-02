import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import ThemeProvider from "~/providers/ThemeProvider";
import ConditionalHeader from "~/_components/ConditionalHeader";
import UsageWarningBanner from "~/_components/UsageWarningBanner";
import ConditionalFooter from "~/_components/ConditionalFooter";

export default function AppGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        layout: {
          socialButtonsVariant: "blockButton",
        },
        variables: {
          colorBackground: "#0a0a0a",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          colorPrimary: "#3b82f6",
          colorDanger: "#ef4444",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "bg-[#0a0a0a] border border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton:
            "bg-[#1a1a1a] border border-zinc-800 text-white hover:bg-[#252525]",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          footerActionLink: "text-blue-500 hover:text-blue-400",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-blue-500",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-[#1a1a1a] border-zinc-800 text-white",
          dividerLine: "bg-zinc-800",
          dividerText: "text-zinc-500",
        },
      }}
    >
      <TRPCReactProvider>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <ConditionalHeader />
            <UsageWarningBanner />
            <div className="flex-1">{children}</div>
            <ConditionalFooter />
          </div>
        </ThemeProvider>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
