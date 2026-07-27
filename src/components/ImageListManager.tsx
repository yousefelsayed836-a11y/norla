"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newItems = [...items];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) continue;
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
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          {items.map((item, i) => (
            <div key={item.id} className="relative group">
              <div className={`relative ${aspect} rounded-xl overflow-hidden bg-brand-light`}>
                <Image src={item.url} alt="" fill className="object-cover" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
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
                  disabled={i === items.length - 1}
                  className="text-white text-xs px-1 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
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
        {uploading ? "Uploading..." : "+ Upload Images"}
      </button>
    </div>
  );
}
