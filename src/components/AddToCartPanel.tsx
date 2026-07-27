"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";

type Variant = {
  id: string;
  label: string;
  color: string | null;
  colorHex: string | null;
  price: number | null;
  stockStatus: string;
};

export default function AddToCartPanel({
  productId,
  title,
  basePrice,
  image,
  variants,
}: {
  productId: string;
  title: string;
  basePrice: number;
  image?: string;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === variantId);
  const price = selected?.price ?? basePrice;
  const outOfStock = selected
    ? selected.stockStatus === "outofstock"
    : variants.length > 0 && variants.every((v) => v.stockStatus === "outofstock");
  const hasSwatches = variants.some((v) => v.colorHex);

  function handleAdd() {
    addItem({
      productId,
      variantId,
      title,
      variantLabel: selected?.label,
      price,
      image,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <p className="text-2xl font-semibold text-brand-dark mb-4">{formatEGP(price)}</p>

      {variants.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/50 mb-2">
            Color — {selected?.label}
          </p>
          {hasSwatches ? (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={v.stockStatus === "outofstock"}
                  title={v.label}
                  className={`w-9 h-9 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    variantId === v.id ? "border-brand-dark scale-110" : "border-transparent"
                  }`}
                >
                  <span
                    className="block w-full h-full rounded-full border border-black/10"
                    style={{ backgroundColor: v.colorHex ?? "#ccc" }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={v.stockStatus === "outofstock"}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    variantId === v.id
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "border-brand-light hover:border-brand-dark"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 text-sm">
        <span
          className={`w-2 h-2 rounded-full ${outOfStock ? "bg-red-500" : "bg-green-500"}`}
        />
        {outOfStock ? "Out of stock" : "In stock, ready to ship"}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-brand-light rounded-full">
          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="border border-brand-dark text-brand-dark py-3.5 rounded-full font-medium uppercase tracking-[0.1em] text-sm hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
          disabled={outOfStock}
          className="bg-brand-dark text-white py-3.5 rounded-full font-medium uppercase tracking-[0.1em] text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Buy It Now
        </button>
      </div>
    </div>
  );
}
