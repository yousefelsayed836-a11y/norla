function looksLikeHeic(file: File) {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  return /\.hei[cf]$/i.test(file.name);
}

/** iPhones save photos as HEIC by default. Sharp (server-side) can't decode the HEVC
 * codec HEIC uses, so we convert to JPEG in the browser before uploading. */
export async function maybeConvertHeic(file: File): Promise<File> {
  if (!looksLikeHeic(file)) return file;

  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(result) ? result[0] : result;
  const newName = file.name.replace(/\.hei[cf]$/i, ".jpg");
  return new File([blob], newName, { type: "image/jpeg" });
}
