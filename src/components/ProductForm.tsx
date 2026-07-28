"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import { slugify } from "@/lib/slugify";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  careInstructions: string;
  price: string;
  regularPrice: string;
  sku: string;
  stockStatus: string;
  stockQty: string;
  status: string;
  categoryId: string;
  images: string[];
  rating: string;
  reviewCount: string;
  visible: boolean;
};

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      title: "",
      slug: "",
      description: "",
      shortDescription: "",
      careInstructions: "",
      price: "",
      regularPrice: "",
      sku: "",
      stockStatus: "instock",
      stockQty: "",
      status: "publish",
      categoryId: categories[0]?.id ?? "",
      images: [],
      rating: "5",
      reviewCount: "0",
      visible: true,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial;

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...values,
      price: parseFloat(values.price),
      regularPrice: values.regularPrice ? parseFloat(values.regularPrice) : null,
      stockQty: values.stockQty ? parseInt(values.stockQty) : null,
      rating: parseFloat(values.rating) || 5,
      reviewCount: parseInt(values.reviewCount) || 0,
    };

    const res = await fetch(values.id ? `/api/products/${values.id}` : "/api/products", {
      method: values.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Failed to save product.");
      return;
    }
    const data = await res.json();
    router.push(`/admin/products/${data.product.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!values.id || !confirm("Delete this product?")) return;
    await fetch(`/api/products/${values.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 bg-white rounded-2xl p-8 shadow-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <label className="flex items-center gap-3 cursor-pointer bg-brand-light/30 rounded-xl px-4 py-3">
        <input
          type="checkbox"
          checked={values.visible}
          onChange={(e) => set("visible", e.target.checked)}
          className="accent-brand-dark w-4 h-4"
        />
        <span className="text-sm font-medium">
          {values.visible ? "Visible on the site" : "Hidden from the site"}
        </span>
      </label>

      <div>
        <label className="text-sm font-medium block mb-1">Title</label>
        <input
          required
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={values.title}
          onChange={(e) => {
            const title = e.target.value;
            set("title", title);
            if (isNew) set("slug", slugify(title));
          }}
        />
      </div>

      {isNew ? (
        <p className="text-xs text-foreground/40">
          URL slug: <span className="font-mono">{values.slug || "…"}</span> (generated from the
          title automatically)
        </p>
      ) : (
        <div>
          <label className="text-sm font-medium block mb-1">Slug</label>
          <input
            required
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Price (LE)</label>
          <input
            required
            type="number"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Regular Price (optional)</label>
          <input
            type="number"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.regularPrice}
            onChange={(e) => set("regularPrice", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <select
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Stock Status</label>
          <select
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.stockStatus}
            onChange={(e) => set("stockStatus", e.target.value)}
          >
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
            <option value="onbackorder">On backorder</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Stock Quantity</label>
        <input
          type="number"
          min={0}
          placeholder="Leave blank if this product has variants"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={values.stockQty}
          onChange={(e) => set("stockQty", e.target.value)}
        />
        <p className="text-xs text-foreground/40 mt-1">
          Only used when this product has no color/size variants below — with variants, stock is
          tracked per variant and summed automatically.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Rating shown (1-5)</label>
          <input
            type="number"
            step="0.1"
            min={1}
            max={5}
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Review count (0 hides it)</label>
          <input
            type="number"
            min={0}
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={values.reviewCount}
            onChange={(e) => set("reviewCount", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Short Description</label>
        <textarea
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          rows={2}
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Care Instructions</label>
        <textarea
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          rows={5}
          value={values.careInstructions}
          onChange={(e) => set("careInstructions", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Product Images</label>
        <ImageUploader images={values.images} onChange={(images) => set("images", images)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          disabled={loading}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
        {values.id && (
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
