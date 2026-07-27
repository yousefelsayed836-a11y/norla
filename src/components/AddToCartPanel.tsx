"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";

type Variant = {
  id: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  imageUrl: string | null;
  price: number | null;
  stockStatus: string;
};

export default function AddToCartPanel({
  productId,
  title,
  basePrice,
  image,
  variants,
  onColorImage,
}: {
  productId: string;
  title: string;
  basePrice: number;
  image?: string;
  variants: Variant[];
  onColorImage?: (url: string | null) => void;
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]);

  const sizesForColor = Array.from(
    new Set(
      variants
        .filter((v) => (selectedColor ? v.color === selectedColor : true))
        .map((v) => v.size)
        .filter(Boolean)
    )
  ) as string[];
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizesForColor[0]);

  useEffect(() => {
    const sizes = Array.from(
      new Set(
        variants
          .filter((v) => (selectedColor ? v.color === selectedColor : true))
          .map((v) => v.size)
          .filter(Boolean)
      )
    ) as string[];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset size choice when color changes and the previous size isn't offered for it
    setSelectedSize((prev) => (prev && sizes.includes(prev) ? prev : sizes[0]));

    const colorVariant = variants.find((v) => v.color === selectedColor && v.imageUrl);
    onColorImage?.(colorVariant?.imageUrl ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the selected color itself changes
  }, [selectedColor]);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected =
    variants.find((v) => v.color === selectedColor && v.size === selectedSize) ??
    variants.find((v) => v.color === selectedColor) ??
    variants[0];

  const price = selected?.price ?? basePrice;
  const outOfStock = selected
    ? selected.stockStatus === "outofstock"
    : variants.length > 0 && variants.every((v) => v.stockStatus === "outofstock");
  const hasSwatches = variants.some((v) => v.colorHex);

  function handleAdd() {
    const label = [selectedColor, selectedSize].filter(Boolean).join(", ");
    addItem({
      productId,
      variantId: selected?.id,
      title,
      variantLabel: label || undefined,
      price,
      image: selected?.imageUrl ?? image,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="text-center">
      <p className="text-2xl font-semibold text-brand-dark mb-4">{formatEGP(price)}</p>

      {colors.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/50 mb-2">
            Color — {selectedColor}
          </p>
          {hasSwatches ? (
            <div className="flex flex-wrap justify-center gap-2">
              {colors.map((color) => {
                const v = variants.find((vv) => vv.color === color);
                const colorOutOfStock = variants
                  .filter((vv) => vv.color === color)
                  .every((vv) => vv.stockStatus === "outofstock");
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    disabled={colorOutOfStock}
                    title={color}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                      selectedColor === color ? "border-brand-dark scale-110" : "border-transparent"
                    }`}
                  >
                    <span
                      className="block w-full h-full rounded-full border border-black/10"
                      style={{ backgroundColor: v?.colorHex ?? "#ccc" }}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors duration-200 ${
                    selectedColor === color
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "border-brand-light hover:border-brand-dark"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {sizesForColor.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/50 mb-2">
            Size — {selectedSize}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {sizesForColor.map((size) => {
              const sizeOutOfStock = variants.find(
                (v) => v.color === selectedColor && v.size === size
              )?.stockStatus === "outofstock";
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={sizeOutOfStock}
                  className={`min-w-11 px-3 py-2 rounded-full text-sm border transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                    selectedSize === size
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "border-brand-light hover:border-brand-dark"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mb-6 text-sm">
        <span className={`w-2 h-2 rounded-full ${outOfStock ? "bg-red-500" : "bg-green-500"}`} />
        {outOfStock ? "Out of stock" : "In stock, ready to ship"}
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center border border-brand-light rounded-full">
          <button
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-brand-light rounded-full"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-brand-light rounded-full"
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
          className="border border-brand-dark text-brand-dark py-3.5 rounded-full font-medium uppercase tracking-[0.1em] text-sm hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
          disabled={outOfStock}
          className="bg-brand-dark text-white py-3.5 rounded-full font-medium uppercase tracking-[0.1em] text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Buy It Now
        </button>
      </div>
    </div>
  );
}
