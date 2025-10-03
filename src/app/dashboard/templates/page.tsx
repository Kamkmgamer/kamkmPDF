"use client";

import React from "react";
import DashboardLayout from "../../../_components/DashboardLayout";
import { templates, type Template } from "./templates";
import Link from "next/link";
import Image from "next/image";

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Modern Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
            Browse Templates
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Choose a professional template to get started with your CV or resume.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template: Template) => (
            <Link
              key={template.id}
              href={`/dashboard/templates/${template.id}`}
              className="group/template relative block h-full"
            >
              {/* Card glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-0 group-hover/template:opacity-100 blur-lg transition-all duration-500"></div>
              
              <div className="relative h-full cursor-pointer rounded-3xl border border-gray-200/80 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-gray-900/5 transition-all duration-300 group-hover/template:shadow-2xl group-hover/template:shadow-gray-900/10 group-hover/template:-translate-y-1">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-500 group-hover/template:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/0 opacity-0 transition-opacity duration-300 group-hover/template:opacity-100" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/template:bg-gradient-to-r group-hover/template:from-blue-600 group-hover/template:to-indigo-600 group-hover/template:bg-clip-text group-hover/template:text-transparent transition-all duration-300">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                  {Array.isArray(template.tags) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {template.tags?.slice(0, 4).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/50 ring-inset dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200 dark:ring-blue-800/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
