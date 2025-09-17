import React from "react";
import DashboardLayout from "../../_components/DashboardLayout";
import RecentJobs from "../../_components/RecentJobs";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <section>
          <h2 className="text-lg font-medium">Quick Actions</h2>
          <div className="mt-3">
            <a
              href="/dashboard/new"
              className="inline-block rounded-md bg-sky-500 px-4 py-2 text-white"
            >
              New Prompt
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium">Recent Jobs</h2>
          <RecentJobs />
        </section>
      </div>
    </DashboardLayout>
  );
}
