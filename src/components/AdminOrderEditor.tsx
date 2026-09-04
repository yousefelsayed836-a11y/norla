"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatEGP } from "@/lib/format";

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  productId: string;
  variantId: string | null;
};

type ProductHit = {
  id: string;
  title: string;
  price: number;
  variants: { id: string; label: string; price: number | null }[];
};

export default function AdminOrderEditor({
  orderId,
  initialItems,
}: {
  orderId: string;
  initialItems: OrderItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductHit | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [addQty, setAddQty] = useState(1);
  const [saving, setSaving] = useState(false);

  async function searchProducts(q: string) {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addItem() {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          variantId: selectedVariantId || null,
          quantity: addQty,
        }),
      });
      const data = await res.json();
      setItems(data.order.items);
      setSelectedProduct(null);
      setSelectedVariantId("");
      setQuery("");
      setResults([]);
      setAddQty(1);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function updateQty(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      const data = await res.json();
      setItems(data.order.items);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(itemId: string) {
    if (!confirm("Remove this item?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, remove: true }),
      });
      const data = await res.json();
      setItems(data.order.items);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
      <h2 className="font-medium mb-4 text-foreground/50 text-sm uppercase tracking-wide">
        Edit Order Items
      </h2>

      {/* Current items */}
      <div className="space-y-2 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <span className="flex-1 truncate">{item.title}</span>
            <span className="text-foreground/50 shrink-0">{formatEGP(Number(item.price))}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                disabled={saving || item.quantity <= 1}
                className="w-7 h-7 rounded-full border border-brand-light flex items-center justify-center hover:bg-brand-light/40 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                disabled={saving}
                className="w-7 h-7 rounded-full border border-brand-light flex items-center justify-center hover:bg-brand-light/40 disabled:opacity-40"
              >
                +
              </button>
            </div>
            <span className="w-16 text-right font-medium shrink-0">
              {formatEGP(Number(item.price) * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              disabled={saving}
              className="text-red-400 hover:text-red-600 text-xs shrink-0 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="pt-2 border-t border-brand-light/60 text-sm text-right font-semibold">
          Items subtotal: {formatEGP(subtotal)}
        </div>
      </div>

      {/* Add product */}
      <div className="border-t border-brand-light pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-2">
          Add Product
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
            value={query}
            onChange={(e) => searchProducts(e.target.value)}
          />
          {results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-brand-light rounded-xl shadow-lg z-10 max-h-52 overflow-y-auto">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setSelectedVariantId(p.variants[0]?.id ?? "");
                    setQuery(p.title);
                    setResults([]);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-light/30 border-b border-brand-light/40 last:border-0"
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="text-foreground/50 ml-2">{formatEGP(p.price)}</span>
                </button>
              ))}
            </div>
          )}
          {searching && (
            <p className="absolute top-full mt-1 left-0 text-xs text-foreground/40 px-2">
              Searching...
            </p>
          )}
        </div>

        {selectedProduct && (
          <div className="mt-3 space-y-2">
            {selectedProduct.variants.length > 0 && (
              <select
                className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm bg-white"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
              >
                <option value="">— No variant —</option>
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                    {v.price ? ` — ${formatEGP(v.price)}` : ""}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-brand-light rounded-full">
                <button
                  className="w-8 h-8 flex items-center justify-center"
                  onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{addQty}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center"
                  onClick={() => setAddQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <button
                onClick={addItem}
                disabled={saving}
                className="flex-1 bg-brand-dark text-white py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Adding..." : `Add ${selectedProduct.title}`}
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedVariantId("");
                  setQuery("");
                }}
                className="text-foreground/40 hover:text-foreground text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
