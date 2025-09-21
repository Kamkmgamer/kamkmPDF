"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../_components/DashboardLayout";
import { api } from "~/trpc/react";

export default function NewPromptPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const createJob = api.jobs.create.useMutation();

  // Show loading state while auth is being determined
  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[--color-primary]"></div>
            <p className="mt-2 text-[--color-text-muted]">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    router.push("/sign-in?redirect_url=/dashboard/new");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Create a new Prompt</h1>
        <form
          className="mt-4 max-w-3xl space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!prompt.trim()) {
              setError("Please enter a prompt.");
              return;
            }
            try {
              const job = await createJob.mutateAsync({
                prompt: prompt.trim(),
              });
              if (job?.id) {
                router.push(`/pdf/${job.id}`);
              }
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              setError(msg || "Failed to create job.");
            }
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">Prompt</span>
            <textarea
              aria-label="prompt"
              className="mt-1 block w-full rounded-md border p-2"
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createJob.isPending}
              className="rounded-md bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {createJob.isPending ? "Creating…" : "Convert"}
            </button>
            <a
              href="/dashboard"
              className="rounded-md border px-4 py-2 hover:bg-[--color-surface]"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
