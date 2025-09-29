"use client";

import { useState, useRef } from "react";

interface ApiResponse {
  error?: string;
  message?: string;
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false); // Reset success state

    const formData = new FormData(event.currentTarget);
    const firstNameEntry = formData.get("first-name");
    const lastNameEntry = formData.get("last-name");

    const firstName = typeof firstNameEntry === "string" ? firstNameEntry : "";
    const lastName = typeof lastNameEntry === "string" ? lastNameEntry : "";

    const name = `${firstName} ${lastName}`.trim();
    const email = formData.get("email") as string;
    const subject =
      (formData.get("subject") as string) || "Contact Form Submission";
    const message = formData.get("message") as string;

    // Client-side validation
    if (!name || !email || !message) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Submitting contact form with data:", {
        name,
        email,
        subject,
        message,
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = (await response.json()) as ApiResponse;
      console.log("API response:", {
        ok: response.ok,
        status: response.status,
        data,
      });

      if (!response.ok) {
        throw new Error(
          data.error ?? `Failed to send message (Status: ${response.status})`,
        );
      }

      setSuccess(true);
      // Reset form using ref
      formRef.current?.reset();

      // No redirect - show success message inline
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while sending your message. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // No URL param check needed since we're handling success inline

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Contact Us
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Have a question? We&apos;d love to hear from you.
        </p>
      </div>

      {error && (
        <div className="mx-auto mt-6 max-w-xl rounded-md bg-red-50 p-4 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mx-auto mt-6 max-w-xl rounded-md bg-green-50 p-4 text-center">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-green-800">Thank You!</h2>
            <p className="mt-2 text-green-700">
              Your message has been sent successfully. We&apos;ll get back to
              you soon.
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setError(null);
            }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700"
          >
            Send Another Message
          </button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mx-auto mt-12 max-w-xl"
      >
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium">
              First name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="first-name"
                id="first-name"
                autoComplete="given-name"
                required
                className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-md border px-3 py-2 shadow-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm font-medium">
              Last name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="last-name"
                id="last-name"
                autoComplete="family-name"
                required
                className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-md border px-3 py-2 shadow-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-md border px-3 py-2 shadow-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="subject" className="block text-sm font-medium">
              Subject (Optional)
            </label>
            <div className="mt-1">
              <input
                id="subject"
                name="subject"
                type="text"
                autoComplete="subject"
                className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-md border px-3 py-2 shadow-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="border-border bg-card/60 placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-foreground/30 block w-full rounded-md border px-3 py-2 shadow-sm"
              ></textarea>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="focus:ring-foreground/30 w-full rounded-md bg-[var(--color-primary)] px-8 py-4 text-lg font-bold text-[var(--color-on-primary)] shadow transition-colors duration-300 hover:bg-[var(--color-primary-700)] hover:shadow-lg focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}
