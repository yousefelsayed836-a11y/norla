"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscountOfferRule } from "@/lib/discounts";

type ProductOption = { id: string; title: string; titleAr: string | null };
const blankRule = (): DiscountOfferRule => ({
  id: crypto.randomUUID(), name: "", nameAr: "", enabled: true, type: "buy_get", value: 0,
  buyQuantity: 2, getQuantity: 1, productIds: [], giftMode: "same_product", giftProductIds: [],
  giftDiscountType: "free", giftDiscountValue: 100, shippingQuantity: 0,
});

function ProductPicker({ products, selected, onChange }: {
  products: ProductOption[]; selected: string[]; onChange: (ids: string[]) => void;
}) {
  return <fieldset className="border border-brand-light rounded-xl p-3 space-y-2">
    <legend className="px-1 text-sm font-medium">Eligible products (empty means all products)</legend>
    <div className="grid sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
      {products.map((product) => <label key={product.id} className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={selected.includes(product.id)} className="accent-brand-dark"
          onChange={(event) => onChange(event.target.checked ? [...selected, product.id] : selected.filter((id) => id !== product.id))} />
        <span>{product.title}{product.titleAr ? ` — ${product.titleAr}` : ""}</span>
      </label>)}
    </div>
  </fieldset>;
}

export default function DiscountRulesForm({ initialRules, products }: { initialRules: DiscountOfferRule[]; products: ProductOption[] }) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = (id: string, patch: Partial<DiscountOfferRule>) => setRules((current) => current.map((rule) => rule.id === id ? { ...rule, ...patch } : rule));

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/discount-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save offers.");
      setMessage("Offers saved."); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save offers.");
    } finally { setSaving(false); }
  }

  return <form onSubmit={save} className="space-y-5">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-foreground/60">Create several offers. Only one price discount may apply to a product at a time; free shipping can combine with a product offer.</p>
      <button type="button" onClick={() => setRules((current) => [...current, blankRule()])} className="shrink-0 border border-brand-dark rounded-full px-4 py-2 text-sm">Add offer</button>
    </div>
    {!rules.length && <p className="bg-white rounded-xl p-5 text-sm text-foreground/60">No offers yet. Add an offer to get started.</p>}
    {rules.map((rule, index) => <fieldset key={rule.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <legend className="px-2 font-medium">Offer {index + 1}</legend>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rule.enabled} onChange={(e) => update(rule.id, { enabled: e.target.checked })} />Enabled</label>
        <button type="button" onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))} className="text-red-600 text-sm">Remove</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Offer label (English)<input className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.name} onChange={(e) => update(rule.id, { name: e.target.value })} placeholder="Buy 2, get the 3rd 25% off" /></label>
        <label className="text-sm">Offer label (Arabic)<input className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.nameAr} onChange={(e) => update(rule.id, { nameAr: e.target.value })} placeholder="اشتري قطعتين وخدي الثالثة بخصم" /></label>
      </div>
      <label className="text-sm block">Offer type<select className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.type} onChange={(e) => update(rule.id, { type: e.target.value })}>
        <option value="buy_get">Buy X, get Y discounted</option><option value="percent">Percentage off selected products</option><option value="fixed">Fixed amount off selected products</option><option value="free_shipping">Free shipping after buying X</option>
      </select></label>
      <ProductPicker products={products} selected={rule.productIds} onChange={(productIds) => update(rule.id, { productIds })} />
      {rule.type === "buy_get" && <>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Buy quantity<input type="number" min={1} max={1000} required className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.buyQuantity} onChange={(e) => update(rule.id, { buyQuantity: Number(e.target.value) })} /></label>
          <label className="text-sm">Reward quantity<input type="number" min={1} max={1000} required className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.getQuantity} onChange={(e) => update(rule.id, { getQuantity: Number(e.target.value) })} /></label>
        </div>
        <label className="text-sm block">Reward discount<select className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.giftDiscountType} onChange={(e) => update(rule.id, { giftDiscountType: e.target.value as DiscountOfferRule["giftDiscountType"] })}>
          <option value="free">Free</option><option value="percent">Percentage off</option><option value="fixed">Fixed amount off (LE)</option>
        </select></label>
        {rule.giftDiscountType !== "free" && <label className="text-sm block">Reward discount value<input type="number" min={0} max={rule.giftDiscountType === "percent" ? 100 : undefined} step="0.01" className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.giftDiscountValue} onChange={(e) => update(rule.id, { giftDiscountValue: Number(e.target.value) })} /></label>}
        <label className="text-sm block">Reward item<select className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.giftMode} onChange={(e) => update(rule.id, { giftMode: e.target.value as DiscountOfferRule["giftMode"] })}>
          <option value="same_product">Same product</option><option value="any_product">Any product in cart</option><option value="specific_products">Selected gift products</option>
        </select></label>
        {rule.giftMode === "specific_products" && <ProductPicker products={products} selected={rule.giftProductIds} onChange={(giftProductIds) => update(rule.id, { giftProductIds })} />}
      </>}
      {(rule.type === "percent" || rule.type === "fixed") && <label className="text-sm block">Discount value {rule.type === "percent" ? "(%)" : "(LE)"}<input type="number" min={0} max={rule.type === "percent" ? 100 : undefined} step="0.01" required className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.value} onChange={(e) => update(rule.id, { value: Number(e.target.value) })} /></label>}
      {rule.type === "free_shipping" && <label className="text-sm block">Qualifying quantity<input type="number" min={1} max={1000} required className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.buyQuantity} onChange={(e) => update(rule.id, { buyQuantity: Number(e.target.value) })} /></label>}
      {rule.type !== "free_shipping" && <label className="text-sm block">Optional free shipping after this many eligible items (0 disables)<input type="number" min={0} max={1000} className="mt-1 w-full border border-brand-light rounded-xl px-3 py-2" value={rule.shippingQuantity} onChange={(e) => update(rule.id, { shippingQuantity: Number(e.target.value) })} /></label>}
    </fieldset>)}
    <div className="flex items-center gap-4"><button type="submit" disabled={saving} className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50">{saving ? "Saving…" : "Save all offers"}</button>{message && <p role="status" className="text-sm">{message}</p>}</div>
  </form>;
}
