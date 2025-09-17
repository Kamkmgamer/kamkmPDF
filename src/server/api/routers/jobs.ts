// Minimal tRPC router stub. Wire into your existing tRPC server.
type Job = {
  id: string;
  prompt: string;
  status: string;
  createdAt: string;
  resultFileId?: string;
};

export const jobsRouter = {
  listRecent: async (): Promise<Job[]> => {
    return [
      {
        id: "1",
        prompt: "Example prompt",
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    ];
  },
  create: async (input: { prompt: string }): Promise<Job> => {
    return {
      id: "new-job",
      status: "queued",
      prompt: input.prompt,
      createdAt: new Date().toISOString(),
    };
  },
  get: async (id: string): Promise<Job> => {
    return {
      id,
      status: "completed",
      resultFileId: "file-123",
      prompt: "Example",
      createdAt: new Date().toISOString(),
    };
  },
};
