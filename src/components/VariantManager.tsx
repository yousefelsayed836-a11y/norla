"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { maybeConvertHeic } from "@/lib/heic";

export type Variant = {
  id: string;
  label: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  imageUrl: string | null;
  price: string | null;
  stockStatus: string;
  stockQty: number | null;
};

const emptyDraft = {
  color: "",
  colorHex: "#000000",
  size: "",
  imageUrl: "",
  price: "",
  stockStatus: "instock",
  stockQty: "",
};

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setDraft({
      color: v.color ?? "",
      colorHex: v.colorHex ?? "#000000",
      size: v.size ?? "",
      imageUrl: v.imageUrl ?? "",
      price: v.price ?? "",
      stockStatus: v.stockStatus,
      stockQty: v.stockQty != null ? String(v.stockQty) : "",
    });
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    let toUpload = file;
    try {
      toUpload = await maybeConvertHeic(file);
    } catch {
      setUploadError(`Couldn't convert ${file.name}. Try a JPG, PNG, or WebP photo.`);
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append("file", toUpload);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setDraft((d) => ({ ...d, imageUrl: data.url }));
    } else {
      const data = await res.json().catch(() => null);
      setUploadError(data?.error || "Failed to upload image.");
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!draft.color.trim() && !draft.size.trim()) return;
    setSaving(true);
    const label = [draft.color, draft.size].filter(Boolean).join(", ") || "Default";
    const payload = {
      label,
      color: draft.color || null,
      colorHex: draft.colorHex || null,
      size: draft.size || null,
      imageUrl: draft.imageUrl || null,
      price: draft.price ? parseFloat(draft.price) : null,
      stockStatus: draft.stockStatus,
      stockQty: draft.stockQty !== "" ? parseInt(draft.stockQty) : null,
    };
    if (editingId) {
      await fetch(`/api/variants/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    resetDraft();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this variant?")) return;
    await fetch(`/api/variants/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="max-w-2xl bg-white rounded-2xl p-8 shadow-sm mt-6">
      <h2 className="font-display text-xl mb-1">Variants</h2>
      <p className="text-xs text-foreground/50 mb-1">
        Add color and size options. Give a color its own photo so the gallery switches
        automatically when a customer picks it.
      </p>
      {variants.length > 0 && (
        <p className="text-xs text-foreground/50 mb-4">
          Total stock across variants:{" "}
          <span className="font-medium text-foreground">
            {variants.some((v) => v.stockQty != null)
              ? variants.reduce((sum, v) => sum + (v.stockQty ?? 0), 0)
              : "—"}
          </span>
        </p>
      )}

      <ul className="space-y-2 mb-5">
        {variants.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between border border-brand-light rounded-xl px-4 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              {v.imageUrl && (
                <div className="relative w-8 h-9 overflow-hidden bg-brand-light shrink-0">
                  <Image src={v.imageUrl} alt="" fill className="object-cover" />
                </div>
              )}
              {v.colorHex && (
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: v.colorHex }}
                />
              )}
              <span>{v.label}</span>
              {v.price && <span className="text-foreground/40">— {v.price} EGP</span>}
              {v.stockQty != null && (
                <span className="text-foreground/40">— stock: {v.stockQty}</span>
              )}
              {v.stockStatus !== "instock" && (
                <span className="text-xs text-red-500">({v.stockStatus})</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => startEdit(v)}
                className="text-brand-dark font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {variants.length === 0 && (
          <p className="text-sm text-foreground/40">No variants yet.</p>
        )}
      </ul>

      <div className="border-t border-brand-light pt-4 space-y-3">
        <p className="text-sm font-medium">{editingId ? "Edit variant" : "Add a variant"}</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Color name (e.g. Beige)"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          />
          <input
            placeholder="Size (e.g. L, One size)"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.size}
            onChange={(e) => setDraft({ ...draft, size: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="w-9 h-9 rounded border border-brand-light cursor-pointer"
            value={draft.colorHex}
            onChange={(e) => setDraft({ ...draft, colorHex: e.target.value })}
          />
          <span className="text-xs text-foreground/50">Swatch color</span>
        </div>
        <div className="grid grid-cols-3 gap-3 items-center">
          <input
            type="number"
            placeholder="Price override"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          />
          <input
            type="number"
            min={0}
            placeholder="Stock qty"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.stockQty}
            onChange={(e) => setDraft({ ...draft, stockQty: e.target.value })}
          />
          <select
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.stockStatus}
            onChange={(e) => setDraft({ ...draft, stockStatus: e.target.value })}
          >
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
            <option value="onbackorder">On backorder</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {draft.imageUrl && (
            <div className="relative w-12 h-14 overflow-hidden bg-brand-light shrink-0">
              <Image src={draft.imageUrl} alt="" fill className="object-cover" />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="border border-brand-light rounded-xl px-3 py-2 text-xs font-medium hover:bg-brand-light/50 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : draft.imageUrl ? "Change Photo" : "+ Add Photo for This Color"}
          </button>
        </div>
        {uploadError && <p className="text-red-600 text-xs">{uploadError}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-dark text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Variant" : "Add Variant"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetDraft}
              className="px-5 py-2 rounded-full text-sm font-medium border border-brand-light"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
