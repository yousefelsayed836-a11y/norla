"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Variant = {
  id: string;
  label: string;
  color: string | null;
  colorHex: string | null;
  price: string | null;
  stockStatus: string;
};

const emptyDraft = { label: "", color: "", colorHex: "#000000", price: "", stockStatus: "instock" };

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

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setDraft({
      label: v.label,
      color: v.color ?? "",
      colorHex: v.colorHex ?? "#000000",
      price: v.price ?? "",
      stockStatus: v.stockStatus,
    });
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function handleSave() {
    if (!draft.label.trim()) return;
    setSaving(true);
    const payload = {
      label: draft.label,
      color: draft.color || null,
      colorHex: draft.colorHex || null,
      price: draft.price ? parseFloat(draft.price) : null,
      stockStatus: draft.stockStatus,
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
      <p className="text-xs text-foreground/50 mb-4">
        Add color/size options customers can pick on the product page.
      </p>

      <ul className="space-y-2 mb-5">
        {variants.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between border border-brand-light rounded-xl px-4 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              {v.colorHex && (
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: v.colorHex }}
                />
              )}
              <span>{v.label}</span>
              {v.price && <span className="text-foreground/40">— {v.price} EGP</span>}
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
            placeholder="Label (e.g. Beige, L)"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <input
            placeholder="Color name (optional)"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-9 h-9 rounded border border-brand-light cursor-pointer"
              value={draft.colorHex}
              onChange={(e) => setDraft({ ...draft, colorHex: e.target.value })}
            />
            <span className="text-xs text-foreground/50">Swatch color</span>
          </div>
          <input
            type="number"
            placeholder="Price override"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
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
