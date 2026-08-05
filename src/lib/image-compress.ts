const SKIP_BELOW_BYTES = 400 * 1024;
const MAX_DIMENSION = 2000;
const QUALITY = 0.85;

/** Downscales and re-encodes large photos in the browser before they're uploaded, so
 * a 10-15MB phone camera photo becomes ~1-2MB before it ever hits the mobile network.
 * This is what actually fixes uploads hanging/timing out on slow mobile connections —
 * the server-side resize in /api/upload only runs after the full original file has
 * already made the round trip. */
export async function compressImage(file: File): Promise<File> {
  if (file.size < SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
