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
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
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
