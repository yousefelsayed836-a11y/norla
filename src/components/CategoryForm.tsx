"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

type ProductOption = { id: string; title: string };

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  imageUrl: string;
  position: number;
  productIds: string[];
};

export default function CategoryForm({
  allProducts,
  initial,
}: {
  allProducts: ProductOption[];
  initial?: CategoryFormValues;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [productIds, setProductIds] = useState<string[]>(initial?.productIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleProduct(id: string) {
    setProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(initial?.id ? `/api/categories/${initial.id}` : "/api/categories", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, imageUrl, position, productIds }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Failed to save category.");
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.id || !confirm("Delete this category? Products in it will become uncategorized.")) return;
    await fetch(`/api/categories/${initial.id}`, { method: "DELETE" });
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 bg-white rounded-2xl p-8 shadow-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="text-sm font-medium block mb-1">Category Name</label>
        <input
          required
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Slug</label>
        <input
          required
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Tile Image</label>
        <p className="text-xs text-foreground/50 mb-2">
          Shown as the background image for this category&apos;s tile on the homepage. Leave empty
          to use a product photo automatically.
        </p>
        <ImageUploader
          images={imageUrl ? [imageUrl] : []}
          onChange={(imgs) => setImageUrl(imgs[imgs.length - 1] ?? "")}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Order</label>
        <input
          type="number"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Products in this Category</label>
        <p className="text-xs text-foreground/50 mb-2">
          Tick the products that belong here. Unticking moves a product back to Uncategorized.
        </p>
        <div className="border border-brand-light rounded-xl max-h-64 overflow-y-auto divide-y divide-brand-light/60">
          {allProducts.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-brand-light/30"
            >
              <input
                type="checkbox"
                checked={productIds.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
                className="accent-brand-dark w-4 h-4"
              />
              {p.title}
            </label>
          ))}
          {allProducts.length === 0 && (
            <p className="px-4 py-3 text-sm text-foreground/40">No products yet.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          disabled={loading}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Category"}
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
