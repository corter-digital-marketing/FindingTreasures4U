import { put, del } from "@vercel/blob";
import crypto from "node:crypto";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// The Vercel Blob SDK looks for BLOB_READ_WRITE_TOKEN by default, but this
// project's store env var is named FT4U_READ_WRITE_TOKEN, so it must be
// passed explicitly on every call.
function blobToken(): string {
  const token = process.env.FT4U_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("FT4U_READ_WRITE_TOKEN is not set. Add it to your .env file.");
  }
  return token;
}

export async function saveUploadedImages(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f.size > 0 && EXTENSIONS[f.type]);
  if (validFiles.length === 0) return [];

  const token = blobToken();
  const urls = await Promise.all(
    validFiles.map(async (file) => {
      const ext = EXTENSIONS[file.type];
      const filename = `${crypto.randomUUID()}.${ext}`;
      const blob = await put(`products/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
        token,
      });
      return blob.url;
    })
  );

  return urls;
}

export async function deleteUploadedImages(urls: string[]): Promise<void> {
  const blobUrls = urls.filter((url) => url.includes(".blob.vercel-storage.com/"));
  if (blobUrls.length === 0) return;
  await del(blobUrls, { token: blobToken() });
}
