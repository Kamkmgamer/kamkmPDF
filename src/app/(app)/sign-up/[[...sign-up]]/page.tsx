import SignUpForm from "./SignUpForm";

export default async function SignUpPage({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--color-bg] px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[--color-text-primary]">
          Create your account
        </h1>
        <p className="mt-2 text-[--color-text-muted]">
          Get started with Prompt-to-PDF
        </p>
      </div>
      <SignUpForm redirectUrl={redirectUrl} />
    </div>
  );
}
