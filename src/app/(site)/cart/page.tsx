"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-[9rem] pb-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="inline-block bg-brand-dark text-white px-8 py-3 rounded-full font-medium"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-[7.5rem] pb-10">
      <h1 className="font-display text-4xl mb-8">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            className="flex gap-4 items-center border-b border-brand-light pb-4"
          >
            <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-brand-light shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              {item.variantLabel && (
                <p className="text-sm text-foreground/60">{item.variantLabel}</p>
              )}
              <p className="text-brand-dark font-semibold mt-1">{formatEGP(item.price)}</p>
            </div>
            <div className="flex items-center border border-brand-light rounded-full">
              <button
                className="w-8 h-8"
                onClick={() =>
                  updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))
                }
              >
                −
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                className="w-8 h-8"
                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-sm text-foreground/50 hover:text-brand-dark"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="font-display text-2xl">Total</span>
        <span className="font-display text-2xl text-brand-dark">{formatEGP(total)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block text-center bg-brand-dark text-white py-4 rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
