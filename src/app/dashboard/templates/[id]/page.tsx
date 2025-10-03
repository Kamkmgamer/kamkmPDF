"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../../_components/DashboardLayout";
import { templates, type Template } from "../templates";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function TemplateDetailPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === "string" ? params.id : "";
  const template: Template | undefined = templates.find((t) => t.id === id);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const createJob = api.jobs.create.useMutation();

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^^\s@]+\.[^\s@]+$/.test(formData.email))
      nextErrors.email = "Please enter a valid email address.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const prompt = `
Create a ${template.name} resume using the following candidate information. Adhere strictly to the template's layout and tone.

TEMPLATE INSTRUCTIONS:
${template.promptInstructions ?? ""}
TEMPLATE TAGS: ${template.tags ? template.tags.join(", ") : ""}

CANDIDATE DETAILS:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
LinkedIn: ${formData.linkedin}
GitHub: ${formData.github}

Summary:
${formData.summary}

Work Experience:
${formData.experience}

Education:
${formData.education}

Skills:
${formData.skills}
`;

    try {
      const job = await createJob.mutateAsync({ prompt });
      if (job?.id) router.push(`/pdf/${job.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(msg);
    }
  };

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isSignedIn) {
    router.push(`/sign-in?redirect_url=/dashboard/templates/${id}`);
    return null;
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Template not found</h1>
          <p className="text-gray-600">
            The requested template could not be found.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Modern Header */}
        <div className="mb-10">
          <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-4xl font-bold text-transparent">
            {template.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {template.description}
          </p>
          {Array.isArray(template.tags) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {template.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/50 ring-inset dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200 dark:ring-blue-800/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-sm text-blue-900 shadow-xl shadow-blue-500/10 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-100">
            <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
              How it works
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700 dark:text-gray-300">
              <li>
                Fill in your details below. Keep it simple — bullet points work
                great.
              </li>
              <li>
                Click Generate PDF. We’ll format it using this template
                automatically.
              </li>
              <li>You can always come back and try another template.</li>
            </ol>
            {template.promptInstructions && (
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold text-blue-700 underline transition-colors select-none hover:text-indigo-600 dark:text-blue-300 dark:hover:text-indigo-400">
                  What this template emphasizes
                </summary>
                <pre className="mt-3 rounded-2xl bg-white/80 p-4 text-xs leading-relaxed whitespace-pre-wrap text-gray-800 shadow-lg ring-1 ring-blue-200/50 backdrop-blur-sm ring-inset dark:bg-gray-800/60 dark:text-gray-200 dark:ring-gray-700/50">
                  {template.promptInstructions}
                </pre>
              </details>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name) || undefined}
                    className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email) || undefined}
                    className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    id="linkedin"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="github"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    id="github"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="summary"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Summary
                </label>
                <textarea
                  name="summary"
                  id="summary"
                  rows={4}
                  onChange={handleChange}
                  className="mt-1 block w-full resize-y rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Work Experience
                </label>
                <textarea
                  name="experience"
                  id="experience"
                  rows={6}
                  onChange={handleChange}
                  className="mt-1 block w-full resize-y rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="education"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Education
                </label>
                <textarea
                  name="education"
                  id="education"
                  rows={4}
                  onChange={handleChange}
                  className="mt-1 block w-full resize-y rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Skills
                </label>
                <textarea
                  name="skills"
                  id="skills"
                  rows={4}
                  onChange={handleChange}
                  className="mt-1 block w-full resize-y rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative inline-flex justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 focus:ring-4 focus:ring-blue-500/50 focus:outline-none active:scale-95"
                >
                  <span className="relative z-10">Generate PDF</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                </button>
              </div>
            </form>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
            <Image
              src={template.imageUrl}
              alt={template.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
