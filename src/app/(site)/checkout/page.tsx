"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { InstaPayLogo, VodafoneCashLogo } from "@/components/PaymentLogos";

type ShippingCity = { id: string; name: string; nameAr: string | null };
type ShippingZone = {
  id: string;
  governorate: string;
  governorateAr: string | null;
  fee: string;
  active: boolean;
  cities: ShippingCity[];
};

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
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone_cash" | "">("");
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [depositPercent, setDepositPercent] = useState(50);
  const [discount, setDiscount] = useState({ enabled: false, type: "none", value: 0, buy: 2, get: 1 });
  const [depositInput, setDepositInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setFreeShippingEnabled(!!d.settings.freeShippingEnabled);
        setFreeShippingThreshold(Number(d.settings.freeShippingThreshold) || 0);
        setDepositPercent(d.settings.depositPercent ?? 50);
        setDiscount({ enabled: !!d.settings.discountEnabled, type: d.settings.discountType ?? "none", value: Number(d.settings.discountValue) || 0, buy: Number(d.settings.discountBuyQuantity) || 2, get: Number(d.settings.discountGetQuantity) || 1 });
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
  let discountAmount = 0;
  if (discount.enabled) {
    if (discount.type === "percent") discountAmount = total * Math.min(100, Math.max(0, discount.value)) / 100;
    else if (discount.type === "fixed") discountAmount = Math.min(total, Math.max(0, discount.value));
    else if (discount.type === "buy_get") {
      const units = items.reduce((sum, item) => sum + item.quantity, 0);
      const freeUnits = Math.floor(units / (Math.max(1, discount.buy) + Math.max(1, discount.get))) * Math.max(1, discount.get);
      let remainingFreeUnits = freeUnits;
      for (const item of [...items].sort((a, b) => a.price - b.price)) {
        const freeFromItem = Math.min(remainingFreeUnits, item.quantity);
        discountAmount += freeFromItem * item.price;
        remainingFreeUnits -= freeFromItem;
        if (remainingFreeUnits === 0) break;
      }
    }
  }
  discountAmount = Math.min(total, Math.max(0, Math.round(discountAmount * 100) / 100));
  const grandTotal = total - discountAmount + shippingFee;
  const deposit = (grandTotal * depositPercent) / 100;
  const minimumDeposit = Math.ceil(deposit);
  const depositValue = depositInput === "" ? minimumDeposit : Math.min(Math.floor(grandTotal), Math.max(minimumDeposit, Number(depositInput) || minimumDeposit));

  const cities = useMemo(() => selectedZone?.cities ?? [], [selectedZone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.whatsappNumber || !form.address || !form.governorate || !form.city) {
      setError(t("checkout.fillRequired"));
      return;
    }
    if (!paymentMethod) {
      setError(t("checkout.selectPaymentMethod"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items, paymentMethod, depositAmount: depositValue }),
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
      <div className="mx-auto max-w-3xl px-4 pt-[9rem] md:pt-[9.75rem] pb-24 text-center">
        <h1 className="font-display text-3xl">{t("checkout.cartEmpty")}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-[7.5rem] md:pt-[8.25rem] pb-10 grid md:grid-cols-2 gap-12">
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
                  {z.governorateAr || z.governorate}
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
                  {c.nameAr || c.name}
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

          <div>
            <label className="text-sm font-medium block mb-2">{t("checkout.paymentMethod")}</label>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("instapay")}
                className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-colors ${
                  paymentMethod === "instapay"
                    ? "border-brand-dark bg-brand-light/40"
                    : "border-brand-light hover:border-brand"
                }`}
              >
                <InstaPayLogo className="w-9 h-9 rounded-full shrink-0" />
                <span className="font-medium text-sm">{t("checkout.instapay")}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("vodafone_cash")}
                className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-colors ${
                  paymentMethod === "vodafone_cash"
                    ? "border-brand-dark bg-brand-light/40"
                    : "border-brand-light hover:border-brand"
                }`}
              >
                <VodafoneCashLogo className="w-9 h-9 rounded-full shrink-0" />
                <span className="font-medium text-sm">{t("checkout.vodafoneCash")}</span>
              </button>
            </div>

            {paymentMethod && (
              <div className="mt-3 bg-brand-light/40 rounded-xl px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm font-semibold text-brand-dark">
                  <label htmlFor="depositAmount">{t("checkout.depositAmountLabel")}</label>
                  <input id="depositAmount" type="number" min={Math.ceil(minimumDeposit)} max={Math.floor(grandTotal)} step="1" value={depositInput} placeholder={String(Math.ceil(minimumDeposit))} onChange={(e) => setDepositInput(e.target.value)} className="w-36 rounded-lg border border-brand-light bg-white px-2 py-1 text-right" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">{t("checkout.transferTo")}</span>
                  <a
                    href="https://wa.me/201027096110"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-black underline hover:no-underline"
                  >
                    01027096110
                  </a>
                </div>
                <p className="text-xs text-foreground/50">{t("checkout.accountNameNote")}</p>
                <p className="text-xs text-foreground/60 leading-relaxed pt-1.5 border-t border-brand-dark/10">
                  {t("checkout.sendScreenshotNote")}{" "}
                  <a
                    href="https://wa.me/201027096110"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-dark underline hover:no-underline"
                  >
                    01027096110
                  </a>
                </p>
              </div>
            )}
          </div>

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
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>{t("checkout.discount")}</span>
              <span>−{formatEGP(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-foreground/70">
            <span>
              {t("checkout.shipping")}
              {selectedZone ? ` (${selectedZone.governorateAr || selectedZone.governorate})` : ""}
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
            <span>{formatEGP(depositValue)}</span>
          </div>
          <p className="text-xs text-foreground/50">{t("checkout.depositNote")}</p>
        </div>
      </div>
    </div>
  );
}
