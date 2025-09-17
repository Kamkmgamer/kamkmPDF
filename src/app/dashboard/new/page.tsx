import React from "react";
import DashboardLayout from "../../../_components/DashboardLayout";

export default function NewPromptPage() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Create a new Prompt</h1>
        <form className="mt-4 max-w-3xl space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Prompt</span>
            <textarea
              aria-label="prompt"
              className="mt-1 block w-full rounded-md border p-2"
              rows={8}
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-sky-500 px-4 py-2 text-white"
            >
              Convert
            </button>
            <a href="/dashboard" className="rounded-md border px-4 py-2">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
