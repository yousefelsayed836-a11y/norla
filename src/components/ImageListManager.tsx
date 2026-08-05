"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { maybeConvertHeic } from "@/lib/heic";
import { compressImage } from "@/lib/image-compress";

type Item = { id: string; url: string };

export default function ImageListManager({
  initialItems,
  apiBase,
  aspect = "aspect-video",
}: {
  initialItems: Item[];
  apiBase: string;
  aspect?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setUploading(true);
    setProgress({ done: 0, total: fileList.length });
    setError(null);
    const newItems = [...items];
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
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => null);
          setError(data?.error || `Failed to upload ${file.name}.`);
        } else {
          const { url } = await uploadRes.json();
          const createRes = await fetch(apiBase, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          const data = await createRes.json();
          const created = data.image;
          newItems.push({ id: created.id, url: created.url });
        }
      } catch {
        setError(`${file.name} timed out. Check your connection and try again.`);
      } finally {
        clearTimeout(timeout);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setItems(newItems);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setItems(copy);
    await fetch(`${apiBase}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: copy.map((i) => i.id) }),
    });
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-3xl">
      {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          {items.map((item, i) => (
            <div key={item.id} className="relative">
              <div className={`relative ${aspect} overflow-hidden bg-brand-light`}>
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 250px"
                />
              </div>
              <div className="flex justify-center gap-2 p-1.5 bg-brand-light/50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-foreground/70 text-xs px-2 py-1 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="text-foreground/70 text-xs px-2 py-1 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-red-500 text-xs px-2 py-1"
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
    </div>
  );
}
