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
  const [expanded, setExpanded] = React.useState(false);
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [templateQuery, setTemplateQuery] = React.useState("");
  const tones = [
    "Formal",
    "Friendly",
    "Technical",
    "Persuasive",
    "Concise",
  ] as const;
  const [selectedTone, setSelectedTone] = React.useState<
    null | (typeof tones)[number]
  >(null);

  const createJob = api.jobs.create.useMutation();

  function toneVisuals(t: (typeof tones)[number] | null) {
    if (!t) return { bg: "", caret: undefined as string | undefined };
    switch (t) {
      case "Friendly":
        return {
          bg: "bg-[linear-gradient(180deg,rgba(16,185,129,0.08),transparent)]",
          caret: "#10b981",
        };
      case "Technical":
        return {
          bg: "bg-[linear-gradient(180deg,rgba(56,189,248,0.10),transparent)]",
          caret: "#38bdf8",
        };
      case "Persuasive":
        return {
          bg: "bg-[linear-gradient(180deg,rgba(244,63,94,0.10),transparent)]",
          caret: "#f43f5e",
        };
      case "Concise":
        return {
          bg: "bg-[linear-gradient(180deg,rgba(245,158,11,0.10),transparent)]",
          caret: "#f59e0b",
        };
      case "Formal":
        return {
          bg: "bg-[linear-gradient(180deg,rgba(100,116,139,0.08),transparent)]",
          caret: "#64748b",
        };
    }
  }

  React.useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "enter") {
        const el = document.getElementById(
          "submit-btn",
        ) as HTMLButtonElement | null;
        el?.click();
      }
      if (e.altKey && key === "e") {
        e.preventDefault();
        const ta = document.getElementById(
          "prompt",
        ) as HTMLTextAreaElement | null;
        ta?.focus();
      }
      if (e.altKey && key === "x") {
        e.preventDefault();
        setExpanded((v) => !v);
      }
      if (e.altKey && key === "t") {
        e.preventDefault();
        setTemplateOpen(true);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  // Autosave draft prompt
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard:new:prompt");
      if (saved && !prompt) setPrompt(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem("dashboard:new:prompt", prompt);
    } catch {}
  }, [prompt]);

  // Warn before leaving with unsaved content
  React.useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!prompt.trim() || submitting) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [prompt, submitting]);

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
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
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

  function toneSystemPrefix(t: (typeof tones)[number]) {
    switch (t) {
      case "Formal":
        return "System: Use a formal, professional tone with precise language.";
      case "Friendly":
        return "System: Use a friendly, approachable tone with warm language.";
      case "Technical":
        return "System: Use a technical tone with accurate terminology and concise explanations.";
      case "Persuasive":
        return "System: Use a persuasive tone, emphasizing benefits and calls to action.";
      case "Concise":
        return "System: Use a concise tone, prioritize brevity and clarity.";
    }
  }

  function renderPreviewText(text: string) {
    // Lightweight structured preview: bullets and paragraphs
    const lines = text.split(/\n+/);
    const items: React.ReactNode[] = [];
    let list: string[] = [];
    function flushList() {
      if (list.length) {
        items.push(
          <ul className="ml-5 list-disc space-y-1" key={`ul-${items.length}`}>
            {list.map((li, i) => (
              <li key={i} className="text-sm">
                {li.replace(/^[-*]\s*/, "")}
              </li>
            ))}
          </ul>,
        );
        list = [];
      }
    }
    for (const ln of lines) {
      if (/^\s*[-*]\s+/.test(ln)) {
        list.push(ln);
      } else if (ln.trim()) {
        flushList();
        items.push(
          <p className="text-sm leading-relaxed" key={`p-${items.length}`}>
            {ln}
          </p>,
        );
      }
    }
    flushList();
    return items;
  }

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
    // Build final prompt, injecting tone as a hidden system prompt (not typed in the field)
    const finalPrompt = selectedTone
      ? `${toneSystemPrefix(selectedTone)}\n\n${prompt.trim()}`
      : prompt.trim();

    // If we have an image, use multipart API; else use existing tRPC flow
    if (imageFile) {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.set("prompt", finalPrompt);
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
        const job = await createJob.mutateAsync({ prompt: finalPrompt });
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
        {/* Hero header */}
        <div className="mb-6 rounded-2xl border border-[--color-border] bg-gradient-to-br from-[--color-surface] to-[--color-base] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create a New PDF
              </h1>
              <p className="text-sm text-[--color-text-muted]">
                Turn a short description into a beautiful, ready‑to‑share PDF.
                Add an optional image and choose placement.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[--color-text-muted]">
              <span className="hidden sm:inline">Shortcut:</span>
              <kbd className="rounded border border-[--color-border] bg-[--color-surface] px-1.5 py-0.5">
                Ctrl/Cmd
              </kbd>
              +
              <kbd className="rounded border border-[--color-border] bg-[--color-surface] px-1.5 py-0.5">
                Enter
              </kbd>
            </div>
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
                  className={`mt-1 block w-full resize-y rounded-md border px-3 py-2 transition outline-none focus:ring-2 ${
                    tooLong ? "border-rose-400" : "border-[--color-border]"
                  } ${
                    selectedTone === "Friendly"
                      ? "ring-1 ring-emerald-200/60 focus:ring-emerald-400/50"
                      : selectedTone === "Technical"
                        ? "ring-1 ring-sky-200/60 focus:ring-sky-400/50"
                        : selectedTone === "Persuasive"
                          ? "ring-1 ring-rose-200/60 focus:ring-rose-400/50"
                          : selectedTone === "Concise"
                            ? "ring-1 ring-amber-200/60 focus:ring-amber-400/50"
                            : selectedTone === "Formal"
                              ? "ring-1 ring-slate-200/60 focus:ring-slate-400/50"
                              : "focus:ring-[--color-primary]"
                  } ${toneVisuals(selectedTone).bg}`}
                  rows={10}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Describe the document you want to generate…"
                  style={{ caretColor: toneVisuals(selectedTone).caret }}
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

                {/* Tone/style presets as toggles (do not modify prompt text) */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {tones.map((t) => {
                    const active = selectedTone === t;
                    const toneHue =
                      t === "Formal"
                        ? "ring-slate-300"
                        : t === "Friendly"
                          ? "ring-emerald-300"
                          : t === "Technical"
                            ? "ring-sky-300"
                            : t === "Persuasive"
                              ? "ring-rose-300"
                              : "ring-amber-300"; // Concise
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedTone(active ? null : t)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          active
                            ? `border-transparent bg-[--color-surface] text-[--color-text] ring-2 ${toneHue}`
                            : "border-[--color-border] bg-[--color-base] text-[--color-text-muted] hover:bg-[--color-surface]"
                        }`}
                        aria-pressed={active}
                      >
                        {t}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setTemplateOpen(true)}
                    className="ml-auto rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[--color-base]"
                    aria-haspopup="dialog"
                  >
                    Browse Templates… (Alt+T)
                  </button>
                </div>
                {/* Image Upload */}
                <div className="mt-4">
                  <label className="text-sm font-medium">Optional image</label>
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-[--color-border] bg-[var(--color-base)] p-4 text-center transition hover:bg-[--color-surface]"
                  >
                    <div className="w-full">
                      {imagePreview ? (
                        <div className="flex items-center gap-3">
                          <Image
                            src={imagePreview}
                            alt="preview"
                            width={96}
                            height={96}
                            className="h-24 w-24 rounded object-cover ring-1 ring-[--color-border]"
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
                {/* Sticky actions */}
                <div className="sticky bottom-2 z-10 mt-3 flex flex-wrap items-center gap-2 bg-gradient-to-t from-[--color-surface]/80 to-transparent px-1 py-1 backdrop-blur">
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
          <div className="space-y-4 self-start lg:sticky lg:top-4 lg:col-span-5 xl:col-span-4">
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
              <h2 className="text-sm font-medium">Preview</h2>
              <div className="mt-2 rounded-md border border-dashed border-[--color-border] p-4">
                {prompt.trim() ? (
                  <div className="space-y-2">
                    <div className="text-xs tracking-wide text-[--color-text-muted] uppercase">
                      Structure preview
                    </div>
                    <div className="space-y-2 text-[--color-text]">
                      {renderPreviewText(prompt.slice(0, 800))}
                    </div>
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
                  <div className="text-[11px] uppercase">Words</div>
                  <div className="text-sm">{wordCount}</div>
                </div>
                <div className="rounded-md border border-[--color-border] p-2">
                  <div className="text-[11px] uppercase">Estimated</div>
                  <div className="text-sm">~{readingTime} min read</div>
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
      {/* Template Picker Modal */}
      {templateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setTemplateOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-xl border border-[--color-border] bg-[--color-surface] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[--color-border] px-4 py-3">
              <div className="font-medium">Browse Templates</div>
              <button
                onClick={() => setTemplateOpen(false)}
                className="rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[--color-base]"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <input
                value={templateQuery}
                onChange={(e) => setTemplateQuery(e.target.value)}
                placeholder="Search templates..."
                className="mb-3 w-full rounded-md border border-[--color-border] bg-[--color-base] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[--color-primary]"
              />
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {templates
                  .filter(
                    (t) =>
                      !templateQuery.trim() ||
                      t.title
                        .toLowerCase()
                        .includes(templateQuery.toLowerCase()) ||
                      t.text
                        .toLowerCase()
                        .includes(templateQuery.toLowerCase()),
                  )
                  .map((t) => (
                    <li key={t.title}>
                      <button
                        type="button"
                        onClick={() => {
                          setPrompt(t.text);
                          setTemplateOpen(false);
                        }}
                        className="group block w-full rounded-lg border border-[--color-border] bg-[var(--color-base)] p-3 text-left transition hover:-translate-y-0.5 hover:border-[--color-primary] hover:bg-[var(--color-surface)] hover:shadow-sm"
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
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
