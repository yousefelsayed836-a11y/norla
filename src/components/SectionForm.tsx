"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";

type ProductOption = { id: string; title: string };

export type SectionFormValues = {
  id?: string;
  title: string;
  titleAr?: string;
  slug: string;
  position: number;
  productIds: string[];
};

export default function SectionForm({
  allProducts,
  initial,
}: {
  allProducts: ProductOption[];
  initial?: SectionFormValues;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [productIds, setProductIds] = useState<string[]>(initial?.productIds ?? []);
  const [pickerValue, setPickerValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = !initial?.id;
  const productMap = new Map(allProducts.map((p) => [p.id, p.title]));
  const available = allProducts.filter((p) => !productIds.includes(p.id));

  function addProduct() {
    if (pickerValue && !productIds.includes(pickerValue)) {
      setProductIds([...productIds, pickerValue]);
      setPickerValue("");
    }
  }

  function removeProduct(id: string) {
    setProductIds(productIds.filter((p) => p !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const copy = [...productIds];
    const target = index + dir;
    if (target < 0 || target >= copy.length) return;
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setProductIds(copy);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(initial?.id ? `/api/sections/${initial.id}` : "/api/sections", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, titleAr, slug, position, productIds }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Failed to save section.");
      return;
    }
    router.push("/admin/sections");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.id || !confirm("Delete this section?")) return;
    await fetch(`/api/sections/${initial.id}`, { method: "DELETE" });
    router.push("/admin/sections");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 bg-white rounded-2xl p-8 shadow-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="text-sm font-medium block mb-1">Section Title</label>
        <p className="text-xs text-foreground/50 mb-2">
          Shown as the heading above this row on the homepage (e.g. &quot;New Drops&quot;, &quot;On
          Sale&quot;, &quot;Summer&quot;).
        </p>
        <input
          required
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={title}
          onChange={(e) => {
            const value = e.target.value;
            setTitle(value);
            if (isNew) setSlug(slugify(value));
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Section Title (Arabic)</label>
        <input
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          dir="rtl"
          placeholder="اختياري — يظهر للزوار اللي مختارين اللغة العربية"
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Order on Homepage</label>
        <input
          type="number"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Products in this section</label>
        <div className="flex gap-2 mb-3">
          <select
            className="flex-1 border border-brand-light rounded-xl px-4 py-2.5"
            value={pickerValue}
            onChange={(e) => setPickerValue(e.target.value)}
          >
            <option value="">Select a product to add...</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addProduct}
            className="bg-brand-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {productIds.map((id, i) => (
            <li
              key={id}
              className="flex items-center justify-between border border-brand-light rounded-xl px-4 py-2 text-sm"
            >
              <span>{productMap.get(id) ?? id}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="text-foreground/40 hover:text-brand-dark disabled:opacity-30"
                  disabled={i === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="text-foreground/40 hover:text-brand-dark disabled:opacity-30"
                  disabled={i === productIds.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeProduct(id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
          {productIds.length === 0 && (
            <p className="text-sm text-foreground/40">No products added yet.</p>
          )}
        </ul>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          disabled={loading}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Section"}
        </button>
        {initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 rounded-full font-medium border border-red-300 text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
