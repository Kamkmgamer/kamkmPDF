import fs from "fs";
import path from "path";
import os from "os";

export type ImageMode = "cover" | "inline";

export function getJobTempDir(jobId: string): string {
  const base =
    process.env.PDFPROMPT_TMP_DIR ?? path.join(os.tmpdir(), "pdfprompt");
  return path.join(base, jobId);
}

export function getJobTempImagePath(
  jobId: string,
  ext: ".png" | ".jpg" | ".jpeg" = ".png",
): string {
  const dir = getJobTempDir(jobId);
  return path.join(dir, `image${ext}`);
}

export async function ensureJobTempDir(jobId: string) {
  const dir = getJobTempDir(jobId);
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveJobTempImage(
  jobId: string,
  data: Buffer,
  mime: string,
) {
  const ext =
    mime === "image/jpeg" ? ".jpg" : mime === "image/png" ? ".png" : ".bin";
  const dir = await ensureJobTempDir(jobId);
  const filePath = path.join(dir, `image${ext}`);
  await fs.promises.writeFile(filePath, data);
  return filePath;
}

export async function readJobTempImage(
  jobId: string,
): Promise<{ path: string; mime: string } | null> {
  const dir = getJobTempDir(jobId);
  const candidates: Array<{ name: string; mime: string }> = [
    { name: "image.png", mime: "image/png" },
    { name: "image.jpg", mime: "image/jpeg" },
    { name: "image.jpeg", mime: "image/jpeg" },
  ];
  for (const c of candidates) {
    const p = path.join(dir, c.name);
    try {
      const stat = await fs.promises.stat(p);
      if (stat.isFile()) return { path: p, mime: c.mime };
    } catch {
      // ignore
    }
  }
  return null;
}

export async function saveJobTempMeta(
  jobId: string,
  meta: { mode?: ImageMode },
) {
  const dir = await ensureJobTempDir(jobId);
  const metaPath = path.join(dir, "meta.json");
  const data = JSON.stringify({ mode: meta.mode ?? "inline" });
  await fs.promises.writeFile(metaPath, data, "utf8");
  return metaPath;
}

export async function readJobTempMeta(
  jobId: string,
): Promise<{ mode: ImageMode } | null> {
  const dir = getJobTempDir(jobId);
  const metaPath = path.join(dir, "meta.json");
  try {
    const raw = await fs.promises.readFile(metaPath, "utf8");
    const parsed = JSON.parse(raw) as { mode?: ImageMode };
    const mode = parsed.mode === "cover" ? "cover" : "inline";
    return { mode };
  } catch {
    return null;
  }
}

export async function cleanupJobTemp(jobId: string) {
  const dir = getJobTempDir(jobId);
  try {
    // remove directory recursively
    await fs.promises.rm(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
