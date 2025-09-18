import fs from "fs";
import path from "path";
import { describe, it, expect, afterAll } from "vitest";
import generatePdfToPath from "./pdf";

const TMP = path.join(process.cwd(), "tmp_test");

describe("generatePdfToPath", () => {
  const filePath = path.join(TMP, "test.pdf");

  afterAll(async () => {
    try {
      await fs.promises.rm(TMP, { recursive: true, force: true });
    } catch {}
  });

  it("creates a non-empty PDF file", async () => {
    await generatePdfToPath(filePath, {
      jobId: "job-test",
      prompt: "Hello world from test",
    });
    const stat = await fs.promises.stat(filePath);
    expect(stat.size).toBeGreaterThan(0);
  }, 20000);
});
