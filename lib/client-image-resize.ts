// Browser-only. Resizes and re-compresses a photo before it's uploaded, so a
// full-resolution phone photo (often 3-8MB) doesn't get stored at full size.
// A product photo doesn't need to be larger than this to look sharp on the
// site, and keeping uploads small matters directly for Blob storage costs
// once a catalog grows into the hundreds of items.

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;
const SKIP_RESIZE_UNDER_BYTES = 1.5 * 1024 * 1024;

export async function resizeImageForUpload(file: File): Promise<File> {
  // Animated GIFs would lose their animation if re-encoded via canvas —
  // leave those alone rather than silently break them.
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // If the browser can't decode it client-side, let the server-side
    // content-type validation on the upload route be the real gatekeeper.
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

  if (scale === 1 && file.size < SKIP_RESIZE_UNDER_BYTES) {
    bitmap.close();
    return file;
  }

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
