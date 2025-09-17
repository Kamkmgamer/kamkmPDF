import React from "react";

// Placeholder component for recent jobs. Replace tRPC hooks with your project's hooks.
export default function RecentJobs() {
  // Example: const { data, isLoading } = trpc.jobs.listRecent.useQuery()
  const mock = [
    {
      id: "1",
      prompt: "Create a one-page resume",
      status: "completed",
      createdAt: "2025-09-18",
    },
    {
      id: "2",
      prompt: "Marketing one-pager for Product X",
      status: "processing",
      createdAt: "2025-09-17",
    },
  ];

  return (
    <div className="mt-3">
      <ul className="space-y-3">
        {mock.map((job) => (
          <li
            key={job.id}
            className="flex items-center justify-between rounded-md bg-[--color-surface] p-3 shadow-sm"
          >
            <div>
              <div className="font-medium">{job.prompt}</div>
              <div className="text-sm text-[--color-text-muted]">
                {job.createdAt} • {job.status}
              </div>
            </div>
            <div>
              <a href={`/pdf/${job.id}`} className="text-[--color-primary]">
                View
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
