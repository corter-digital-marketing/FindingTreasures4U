import { del } from "@vercel/blob";

export async function deleteUploadedImages(urls: string[]): Promise<void> {
  const blobUrls = urls.filter((url) => url.includes(".blob.vercel-storage.com/"));
  if (blobUrls.length === 0) return;
  await del(blobUrls, { token: process.env.FT4U_READ_WRITE_TOKEN });
}
