export const filesRouter = {
  getDownloadUrl: async (fileId: string) => {
    // In production, generate a signed URL (S3, GCS, etc.)
    return {
      url: `https://example.com/download/${fileId}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    };
  },
  createShareLink: async (fileId: string, expiresInSeconds = 3600) => {
    return {
      url: `https://share.example.com/${fileId}?exp=${expiresInSeconds}`,
    };
  },
};
