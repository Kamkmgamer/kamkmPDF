import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import ThemeProvider from "~/providers/ThemeProvider";
import Header from "~/_components/Header";
import UsageWarningBanner from "~/_components/UsageWarningBanner";

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
            <Header />
            <UsageWarningBanner />
            <div className="flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
