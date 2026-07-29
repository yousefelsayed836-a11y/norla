"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

type ShippingCity = { id: string; name: string };
type ShippingZone = { id: string; governorate: string; fee: string; active: boolean; cities: ShippingCity[] };

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const { t } = useLanguage();
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
      setError(t("checkout.fillRequired"));
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
      setError(t("checkout.orderError"));
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-[9rem] pb-24 text-center">
        <h1 className="font-display text-3xl">{t("checkout.cartEmpty")}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-[7.5rem] pb-10 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="font-display text-3xl mb-6">{t("checkout.title")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder={t("checkout.fullName")}
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder={t("checkout.phone")}
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder={t("checkout.whatsapp")}
            className="w-full border border-brand-light rounded-xl px-4 py-3"
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
          />
          <input
            placeholder={t("checkout.email")}
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
              <option value="">{t("checkout.governorate")}</option>
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
              <option value="">{t("checkout.city")}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder={t("checkout.address")}
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
            {loading ? t("checkout.placingOrder") : `${t("checkout.placeOrder")} — ${formatEGP(grandTotal)}`}
          </button>
          <p className="text-xs text-foreground/50 text-center">{t("checkout.depositNote")}</p>
        </form>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-4">{t("checkout.orderSummary")}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex justify-between text-sm"
            >
              <span>
                {item.title} {item.variantLabel ? `(${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span className="text-black font-medium">
                {formatEGP(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-brand-light space-y-2 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>{t("checkout.subtotal")}</span>
            <span>{formatEGP(total)}</span>
          </div>
          <div className="flex justify-between text-foreground/70">
            <span>
              {t("checkout.shipping")}
              {selectedZone ? ` (${selectedZone.governorate})` : ""}
            </span>
            <span>
              {!selectedZone
                ? t("checkout.selectGovernorate")
                : shippingFee === 0
                  ? t("checkout.free")
                  : formatEGP(shippingFee)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-brand-light">
            <span>{t("checkout.total")}</span>
            <span className="text-brand-dark">{formatEGP(grandTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-brand-dark bg-brand-light/40 rounded-lg px-3 py-2 mt-2">
            <span>
              {t("checkout.depositDueNow")} ({depositPercent}%)
            </span>
            <span>{formatEGP(deposit)}</span>
          </div>
          <p className="text-xs text-foreground/50">{t("checkout.depositNote")}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center h-5 px-2 rounded bg-[#6C2EB9] text-white text-[9px] font-semibold tracking-wide">
              InstaPay
            </span>
            <span className="inline-flex items-center h-5 px-2 rounded bg-[#E60000] text-white text-[9px] font-semibold tracking-wide">
              Vodafone Cash
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
