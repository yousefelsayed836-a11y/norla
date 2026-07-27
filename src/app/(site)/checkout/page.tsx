"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";

type ShippingCity = { id: string; name: string };
type ShippingZone = { id: string; governorate: string; fee: string; active: boolean; cities: ShippingCity[] };

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    address: "",
    governorate: "",
    city: "",
  });
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [depositPercent, setDepositPercent] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setFreeShippingEnabled(!!d.settings.freeShippingEnabled);
        setFreeShippingThreshold(Number(d.settings.freeShippingThreshold) || 0);
        setDepositPercent(d.settings.depositPercent ?? 50);
      })
      .catch(() => {});
    fetch("/api/shipping-zones")
      .then((r) => r.json())
      .then((d) => setZones((d.zones as ShippingZone[]).filter((z) => z.active)))
      .catch(() => {});
  }, []);

  const selectedZone = zones.find((z) => z.governorate === form.governorate);
  const qualifiesFreeShipping = freeShippingEnabled && total >= freeShippingThreshold && freeShippingThreshold > 0;
  const shippingFee = selectedZone ? (qualifiesFreeShipping ? 0 : Number(selectedZone.fee)) : 0;
  const grandTotal = total + shippingFee;
  const deposit = (grandTotal * depositPercent) / 100;

  const cities = useMemo(() => selectedZone?.cities ?? [], [selectedZone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.whatsappNumber || !form.address || !form.governorate || !form.city) {
      setError("Please fill in your name, phone, WhatsApp number, governorate, city and address.");
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
            placeholder="WhatsApp number (to confirm your order)"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
          />
          <input
            placeholder="Email (optional)"
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="w-full border border-brand-light rounded-xl px-4 py-3 bg-white"
              value={form.governorate}
              onChange={(e) => setForm({ ...form, governorate: e.target.value, city: "" })}
            >
              <option value="">Governorate</option>
              {zones.map((z) => (
                <option key={z.id} value={z.governorate}>
                  {z.governorate}
                </option>
              ))}
            </select>
            <select
              className="w-full border border-brand-light rounded-xl px-4 py-3 bg-white disabled:opacity-50"
              value={form.city}
              disabled={!selectedZone}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="">City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Delivery address (street, building, apartment)"
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
            {loading ? "Placing order..." : `Place Order — ${formatEGP(grandTotal)}`}
          </button>
          <p className="text-xs text-foreground/50 text-center">
            We&apos;ll contact you on WhatsApp so you can send the {depositPercent}% deposit via
            Instagram payment or cash. The rest is paid on delivery.
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
        <div className="mt-4 pt-4 border-t border-brand-light space-y-2 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>Subtotal</span>
            <span>{formatEGP(total)}</span>
          </div>
          <div className="flex justify-between text-foreground/70">
            <span>Shipping{selectedZone ? ` (${selectedZone.governorate})` : ""}</span>
            <span>
              {!selectedZone
                ? "Select governorate"
                : shippingFee === 0
                  ? "Free"
                  : formatEGP(shippingFee)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-brand-light">
            <span>Total</span>
            <span className="text-brand-dark">{formatEGP(grandTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-brand-dark bg-brand-light/40 rounded-lg px-3 py-2 mt-2">
            <span>Deposit due now ({depositPercent}%)</span>
            <span>{formatEGP(deposit)}</span>
          </div>
          <p className="text-xs text-foreground/50">
            We&apos;ll message you on WhatsApp to arrange the deposit payment via Instagram or
            cash. The remaining balance is paid on delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
