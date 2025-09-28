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

  const [loading, setLoading] = React.useState(false);
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

  const fillSample = () => {
    setFormData({
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 012-3456",
      linkedin: "https://www.linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      summary:
        "Product-minded software engineer with 6+ years experience building web apps. Passionate about performance, accessibility, and great UX.",
      experience:
        "Senior Software Engineer, Acme Inc. (2021–Present)\n- Led migration to Next.js, improving TTFB by 35% and Core Web Vitals to green.\n- Built PDF generation service reducing support workload by 20%.\n\nSoftware Engineer, Beta Co. (2018–2021)\n- Implemented role-based access control; reduced auth bugs by 60%.",
      education:
        "B.Sc. in Computer Science, State University (2014–2018)\nGoogle Cloud Associate Engineer (2020)",
      skills: "TypeScript, React, Next.js, Node.js, SQL, Tailwind, Testing",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
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
      setLoading(true);
      const job = await createJob.mutateAsync({ prompt });
      if (job?.id) router.push(`/pdf/${job.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(msg);
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {template.name}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {template.description}
          </p>
          {Array.isArray(template.tags) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {template.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 ring-inset dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
            <p className="font-medium">How it works</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
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
              <details className="mt-3">
                <summary className="cursor-pointer text-blue-700 underline select-none dark:text-blue-300">
                  What this template emphasizes
                </summary>
                <pre className="mt-2 rounded-md bg-white/60 p-3 text-xs leading-relaxed whitespace-pre-wrap text-gray-800 ring-1 ring-blue-200 ring-inset dark:bg-gray-800/40 dark:text-gray-200 dark:ring-gray-700">
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    id="linkedin"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="github"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    id="github"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="summary"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Summary
                </label>
                <textarea
                  name="summary"
                  id="summary"
                  rows={4}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Work Experience
                </label>
                <textarea
                  name="experience"
                  id="experience"
                  rows={6}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="education"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Education
                </label>
                <textarea
                  name="education"
                  id="education"
                  rows={4}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Skills
                </label>
                <textarea
                  name="skills"
                  id="skills"
                  rows={4}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                >
                  Generate PDF
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
