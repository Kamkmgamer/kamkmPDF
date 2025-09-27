"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "../../../_components/DashboardLayout";
import { api } from "~/trpc/react";

export default function NewPromptPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"cover" | "inline">("inline");
  const [submitting, setSubmitting] = React.useState(false);

  const createJob = api.jobs.create.useMutation();

  React.useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
        const el = document.getElementById(
          "submit-btn",
        ) as HTMLButtonElement | null;
        el?.click();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

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

  const charCount = prompt.length;
  const maxChars = 2000; // aligned with jobs.create zod schema
  const tooLong = charCount > maxChars;
  const tooShort = prompt.trim().length === 0;

  // Frontend validation constraints
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
  const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);

  function resetImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setImageError(null);
  }

  async function validateAndSetImage(file: File) {
    setImageError(null);
    if (!ACCEPTED_TYPES.has(file.type)) {
      setImageError("Unsupported file type. Use PNG or JPEG.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      setImageError("File too large. Max 8MB.");
      return;
    }
    // Basic dimension check
    const url = URL.createObjectURL(file);
    try {
      const dims = await new Promise<{ w: number; h: number }>(
        (resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          const imgElement = new (window as any).Image();
           
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          imgElement.onload = () =>
            resolve({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              w: imgElement.naturalWidth,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              h: imgElement.naturalHeight,
            });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          imgElement.onerror = () => reject(new Error("Failed to load image"));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          imgElement.src = url;
        },
      );
      if (dims.w < 16 || dims.h < 16) {
        URL.revokeObjectURL(url);
        setImageError("Image too small. Minimum 16x16.");
        return;
      }
      if (dims.w > 20000 || dims.h > 20000) {
        URL.revokeObjectURL(url);
        setImageError("Image dimensions too large.");
        return;
      }
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(url);
      setImageFile(file);
    } catch {
      URL.revokeObjectURL(url);
      setImageError("Could not read image.");
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) void validateAndSetImage(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  const templates: { title: string; text: string }[] = [
    {
      title: "Professional Resume",
      text: "Create a clean, one‑page professional resume for a Senior Frontend Engineer. Include sections for Summary, Skills, Experience (3 roles), Education, and Projects.",
    },
    {
      title: "Product One‑Pager",
      text: "Generate a concise product one‑pager for a B2B SaaS tool called DataPilot. Include value proposition, key features (3‑5), customer quotes, pricing tiers, and a call‑to‑action.",
    },
    {
      title: "Project Proposal",
      text: "Draft a project proposal for redesigning a company website. Include overview, goals, scope, timeline (milestones), team, and acceptance criteria.",
    },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (tooShort) {
      setError("Please enter a prompt.");
      return;
    }
    if (tooLong) {
      setError(`Prompt is too long. Maximum ${maxChars} characters.`);
      return;
    }
    // If we have an image, use multipart API; else use existing tRPC flow
    if (imageFile) {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.set("prompt", prompt.trim());
        fd.set("mode", mode);
        fd.set("image", imageFile);
        const res = await fetch("/api/jobs/create-with-image", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data?.error ?? `Upload failed (${res.status})`);
        }
        const data = (await res.json()) as { ok: boolean; id?: string };
        if (data?.id) router.push(`/pdf/${data.id}`);
        else throw new Error("No job id returned");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || "Failed to create job.");
      } finally {
        setSubmitting(false);
      }
      return;
    } else {
      try {
        const job = await createJob.mutateAsync({ prompt: prompt.trim() });
        if (job?.id) router.push(`/pdf/${job.id}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || "Failed to create job.");
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create a New PDF
            </h1>
            <p className="text-sm text-[--color-text-muted]">
              Describe what you want. We’ll generate a polished PDF from your
              prompt.
            </p>
          </div>
          <div className="text-xs text-[--color-text-muted]">
            Press Ctrl/Cmd + Enter to convert
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Editor & Templates */}
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    Prompt
                  </label>
                  <div
                    className={`text-xs ${tooLong ? "text-rose-600" : "text-[--color-text-muted]"}`}
                  >
                    {charCount}/{maxChars}
                  </div>
                </div>
                <textarea
                  id="prompt"
                  aria-label="prompt"
                  className={`mt-1 block w-full resize-y rounded-md border px-3 py-2 transition outline-none focus:ring-2 focus:ring-[--color-primary] ${
                    tooLong ? "border-rose-400" : "border-[--color-border]"
                  }`}
                  rows={10}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Describe the document you want to generate…"
                />
                {((touched && tooShort) || tooLong || error) && (
                  <div className="mt-2 text-sm text-rose-600">
                    {tooShort && "Please enter a prompt."}
                    {tooLong &&
                      !tooShort &&
                      `Prompt is too long. Maximum ${maxChars} characters.`}
                    {!tooShort && !tooLong && error}
                  </div>
                )}
                {/* Image Upload */}
                <div className="mt-4">
                  <label className="text-sm font-medium">Optional image</label>
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="mt-2 flex items-center justify-center rounded-md border border-dashed border-[--color-border] bg-[var(--color-base)] p-4 text-center"
                  >
                    <div className="w-full">
                      {imagePreview ? (
                        <div className="flex items-center gap-3">
                          <Image
                            src={imagePreview}
                            alt="preview"
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded object-cover"
                          />
                          <div className="flex-1 text-left">
                            <div className="text-xs text-[--color-text-muted]">
                              Selected image
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                              <div className="inline-flex items-center gap-2 rounded border border-[--color-border] px-2 py-1 text-xs">
                                <label className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name="mode"
                                    value="inline"
                                    checked={mode === "inline"}
                                    onChange={() => setMode("inline")}
                                  />
                                  <span className="ml-1">Inline</span>
                                </label>
                                <label className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name="mode"
                                    value="cover"
                                    checked={mode === "cover"}
                                    onChange={() => setMode("cover")}
                                  />
                                  <span className="ml-1">Cover</span>
                                </label>
                              </div>
                              <button
                                type="button"
                                onClick={resetImage}
                                className="rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[var(--color-surface)]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-[--color-text-muted]">
                          Drag and drop an image here, or
                          <label className="ml-1 cursor-pointer text-[--color-primary] underline">
                            <input
                              type="file"
                              accept="image/png,image/jpeg"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void validateAndSetImage(f);
                              }}
                            />
                            browse
                          </label>
                          . PNG or JPEG, up to 8MB.
                        </div>
                      )}
                    </div>
                  </div>
                  {imageError && (
                    <div className="mt-2 text-sm text-rose-600">
                      {imageError}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    id="submit-btn"
                    type="submit"
                    disabled={
                      createJob.isPending || submitting || tooShort || tooLong
                    }
                    aria-disabled={
                      createJob.isPending || submitting || tooShort || tooLong
                    }
                    aria-busy={createJob.isPending || submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-on-primary)] shadow-sm transition hover:opacity-95 focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    title="Convert (Ctrl/Cmd + Enter)"
                  >
                    {(createJob.isPending || submitting) && (
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                    <span>
                      {createJob.isPending || submitting
                        ? "Converting…"
                        : "Convert to PDF"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("");
                      resetImage();
                    }}
                    className="rounded-md border border-[--color-border] px-4 py-2 text-sm hover:bg-[var(--color-base)]"
                  >
                    Clear
                  </button>
                  <a
                    href="/dashboard"
                    className="rounded-md border border-[--color-border] px-4 py-2 text-sm hover:bg-[var(--color-base)]"
                  >
                    Cancel
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-medium">Prompt Templates</h2>
                  <button
                    type="button"
                    onClick={() =>
                      setPrompt(
                        (p) => (p ? `${p}\n\n` : "") + templates[0]!.text,
                      )
                    }
                    className="text-xs text-[--color-primary] hover:underline"
                  >
                    Quick apply first template
                  </button>
                </div>
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {templates.map((t) => (
                    <li key={t.title}>
                      <button
                        type="button"
                        onClick={() => setPrompt(t.text)}
                        className="block w-full rounded-lg border border-[--color-border] bg-[var(--color-base)] p-3 text-left transition hover:border-[--color-primary] hover:bg-[var(--color-surface)]"
                        title="Apply template"
                      >
                        <div className="font-medium">{t.title}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-[--color-text-muted]">
                          {t.text}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </form>
          </div>

          {/* Right: Preview & Tips */}
          <div className="space-y-4 lg:col-span-5 xl:col-span-4">
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
              <h2 className="text-sm font-medium">Preview</h2>
              <div className="mt-2 rounded-md border border-dashed border-[--color-border] p-4">
                {prompt.trim() ? (
                  <div className="space-y-2">
                    <div className="text-xs tracking-wide text-[--color-text-muted] uppercase">
                      First lines
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-[--color-text]">
                      {prompt.slice(0, 600)}
                      {prompt.length > 600 ? "…" : ""}
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-[--color-text-muted]">
                    Enter a prompt to see a live preview here.
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-[--color-text-muted]">
                <div className="rounded-md border border-[--color-border] p-2">
                  <div className="text-[11px] uppercase">Characters</div>
                  <div
                    className={`text-sm ${tooLong ? "text-rose-600" : "text-[--color-text]"}`}
                  >
                    {charCount}
                  </div>
                </div>
                <div className="rounded-md border border-[--color-border] p-2">
                  <div className="text-[11px] uppercase">Limit</div>
                  <div className="text-sm">{maxChars}</div>
                </div>
                <div className="rounded-md border border-[--color-border] p-2">
                  <div className="text-[11px] uppercase">Estimated</div>
                  <div className="text-sm">1 page</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
              <h2 className="text-sm font-medium">Tips for Great PDFs</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[--color-text-muted]">
                <li>
                  <span className="font-medium text-[--color-text]">
                    Be specific:
                  </span>{" "}
                  outline sections and style (e.g., headings, bullets).
                </li>
                <li>
                  <span className="font-medium text-[--color-text]">
                    Keep it concise:
                  </span>{" "}
                  shorter prompts produce more focused output.
                </li>
                <li>
                  <span className="font-medium text-[--color-text]">
                    Add context:
                  </span>{" "}
                  product name, audience, tone, constraints.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
