import React from "react";

export default async function PdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams?.id ?? "unknown";
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">PDF Viewer</h1>
      <p className="text-sm text-[--color-text-muted]">Viewing PDF job: {id}</p>
      <div className="mt-4 flex h-[600px] items-center justify-center border border-[--color-border] bg-[--color-surface]">
        <span className="text-[--color-text-muted]">
          PDF viewer placeholder for {id}
        </span>
      </div>
    </div>
  );
}
