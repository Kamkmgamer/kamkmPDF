import AuthFlowTest from "../../_components/test-auth-flow";

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      <div className="container mx-auto py-8">
        <AuthFlowTest />
      </div>
    </div>
  );
}
