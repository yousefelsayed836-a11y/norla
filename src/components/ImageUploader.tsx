"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { maybeConvertHeic } from "@/lib/heic";
import { compressImage } from "@/lib/image-compress";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setUploading(true);
    setProgress({ done: 0, total: fileList.length });
    setError(null);
    const uploaded: string[] = [];
    for (const file of fileList) {
      let toUpload = file;
      try {
        toUpload = await maybeConvertHeic(toUpload);
        toUpload = await compressImage(toUpload);
      } catch {
        setError(`Couldn't process ${file.name}. Try a JPG, PNG, or WebP photo.`);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }
      const formData = new FormData();
      formData.append("file", toUpload);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData, signal: controller.signal });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || `Failed to upload ${file.name}.`);
        } else {
          const data = await res.json();
          uploaded.push(data.url);
        }
      } catch {
        setError(`${file.name} timed out. Check your connection and try again.`);
      } finally {
        clearTimeout(timeout);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    onChange([...images, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative group">
              <div className="relative aspect-square overflow-hidden bg-brand-light border border-brand-light">
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 150px"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-white text-xs px-1 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="text-white text-xs px-1 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="border border-brand-light rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-brand-light/50 disabled:opacity-50"
      >
        {uploading ? `Uploading ${progress.done}/${progress.total}...` : "+ Upload Images"}
      </button>
      <p className="text-xs text-foreground/40 mt-1">
        Choose photos from your computer or phone (camera or gallery).
      </p>
    </div>
  );
}
