export type JobStatus = "queued" | "processing" | "completed" | "failed";

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
}

export interface File {
  id: string;
  jobId: string | null;
  path: string | null;
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
