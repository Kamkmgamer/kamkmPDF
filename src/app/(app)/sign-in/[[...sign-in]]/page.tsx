import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawRedirect = resolvedSearchParams?.redirect_url;
  const redirectUrl =
    typeof rawRedirect === "string" && rawRedirect.length > 0
      ? decodeURIComponent(rawRedirect)
      : "/dashboard";
  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-bg] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[--color-text-primary]">
            Welcome back
          </h1>
          <p className="mt-2 text-[--color-text-muted]">
            Sign in to your account to continue
          </p>
        </div>
        <SignIn
          forceRedirectUrl={redirectUrl}
          fallbackRedirectUrl="/dashboard"
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: "hsl(var(--color-primary))",
              colorBackground: "hsl(var(--color-bg))",
              colorInputBackground: "hsl(var(--color-surface))",
              colorInputText: "hsl(var(--color-text-primary))",
              colorText: "hsl(var(--color-text-primary))",
              borderRadius: "0.5rem",
            },
            elements: {
              formButtonPrimary:
                "bg-[--color-primary] hover:bg-[--color-primary]/90",
              card: "bg-[--color-surface] border-[--color-border]",
              headerTitle: "text-[--color-text-primary]",
              headerSubtitle: "text-[--color-text-muted]",
              socialButtonsBlockButton:
                "border-[--color-border] text-[--color-text-primary] hover:bg-[--color-surface]",
              formFieldInput:
                "bg-[--color-surface] border-[--color-border] text-[--color-text-primary]",
              formFieldLabel: "text-[--color-text-primary]",
              footerActionText: "text-[--color-text-muted]",
              footerActionLink:
                "text-[--color-primary] hover:text-[--color-primary]/80",
            },
          }}
        />
      </div>
    </div>
  );
}
