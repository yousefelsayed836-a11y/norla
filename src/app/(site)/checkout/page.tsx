"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.address) {
      setError("Please fill in your name, phone and address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      clear();
      router.push("/order-confirmed");
    } catch {
      setError("Something went wrong placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-[9rem] pb-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-[7.5rem] pb-10 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="font-display text-3xl mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Full name"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Phone number"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Email (optional)"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="City"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <textarea
            placeholder="Delivery address"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-brand-dark text-white py-4 rounded-full font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Placing order..." : `Place Order — ${formatEGP(total)}`}
          </button>
          <p className="text-xs text-foreground/50 text-center">
            Cash on delivery. Our team will contact you to confirm your order.
          </p>
        </form>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-4">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex justify-between text-sm"
            >
              <span>
                {item.title} {item.variantLabel ? `(${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span>{formatEGP(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-brand-light flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-brand-dark">{formatEGP(total)}</span>
        </div>
      </div>
    </div>
  );
}
