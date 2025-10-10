import { notFound } from "next/navigation";
import { PDFViewerPage } from "~/app/(app)/pdf/[id]/_components/PDFViewerPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PDFPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <PDFViewerPage jobId={id} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `PDF Viewer - ${id}`,
    description: "View and download your generated PDF",
  };
}
