import { put, del } from "@vercel/blob";
import crypto from "node:crypto";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function saveUploadedImages(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f.size > 0 && EXTENSIONS[f.type]);
  if (validFiles.length === 0) return [];

  const urls = await Promise.all(
    validFiles.map(async (file) => {
      const ext = EXTENSIONS[file.type];
      const filename = `${crypto.randomUUID()}.${ext}`;
      const blob = await put(`products/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return blob.url;
    })
  );

  return urls;
}

export async function deleteUploadedImages(urls: string[]): Promise<void> {
  const blobUrls = urls.filter((url) => url.includes(".blob.vercel-storage.com/"));
  if (blobUrls.length === 0) return;
  await del(blobUrls);
}
