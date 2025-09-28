"use client";

import React from "react";
import DashboardLayout from "../../../_components/DashboardLayout";
import { templates } from "./templates";
import Link from "next/link";
import Image from "next/image";

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Browse Templates
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Choose a template to get started with your CV or resume.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/dashboard/templates/${template.id}`}
            >
              <div className="group block h-full cursor-pointer rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
