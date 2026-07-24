import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function saveUploadedImages(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f.size > 0 && EXTENSIONS[f.type]);
  if (validFiles.length === 0) return [];

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls = await Promise.all(
    validFiles.map(async (file) => {
      const ext = EXTENSIONS[file.type];
      const filename = `${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(UPLOAD_DIR, filename), buffer);
      return `/uploads/${filename}`;
    })
  );

  return urls;
}
