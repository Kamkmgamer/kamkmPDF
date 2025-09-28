export type JobStatus = "queued" | "processing" | "completed" | "failed";

// Exact generation stages shown to users (must match UI copy)
export type GenerationStage =
  | "Processing PDF"
  | "Analyzing your request"
  | "Generating content"
  | "Formatting PDF"
  | "Finalizing document";

export interface Job {
  id: string;
  userId: string | null;
  prompt: string | null;
  status: string;
  attempts: number;
  resultFileId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  // Optional fields for live progress tracking (backend may not always supply)
  progress?: number; // 0-100
  stage?: string | null; // backend stores free-form label; UI maps to GenerationStage
}

export interface File {
  id: string;
  jobId: string | null;
  userId: string | null;
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface DownloadUrl {
  url: string;
  expiresAt: string;
}

export interface ShareLink {
  url: string;
}

export interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isLoading: boolean;
  error: string | null;
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
}
