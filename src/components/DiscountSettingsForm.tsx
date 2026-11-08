"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DiscountType = "none" | "percent" | "fixed" | "buy_get";
type ProductOption = { id: string; title: string; titleAr: string | null };

function ProductPicker({ label, products, selected, onChange }: {
  label: string; products: ProductOption[]; selected: string[]; onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="border border-brand-light rounded-xl p-4 space-y-2">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <p className="text-xs text-foreground/55">{label.includes("gift") || label.includes("Gift") ? "Choose at least one gift product." : "No selection means all products."}</p>
      <div className="grid sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
        {products.map((product) => (
          <label key={product.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={selected.includes(product.id)} className="accent-brand-dark"
              onChange={(event) => onChange(event.target.checked
                ? [...selected, product.id]
                : selected.filter((id) => id !== product.id))} />
            <span>{product.title}{product.titleAr ? ` — ${product.titleAr}` : ""}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function DiscountSettingsForm({
  initialEnabled, initialType, initialValue, initialBuyQuantity, initialGetQuantity,
  products, initialProductIds, initialGiftMode, initialGiftProductIds, initialGiftDiscountType, initialGiftDiscountValue,
}: {
  initialEnabled: boolean; initialType: string; initialValue: string;
  initialBuyQuantity: number; initialGetQuantity: number; products: ProductOption[];
  initialProductIds: string[]; initialGiftMode: string; initialGiftProductIds: string[];
  initialGiftDiscountType: string; initialGiftDiscountValue: number;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [type, setType] = useState<DiscountType>(["none", "percent", "fixed", "buy_get"].includes(initialType) ? initialType as DiscountType : "none");
  const [value, setValue] = useState(initialValue);
  const [buyQuantity, setBuyQuantity] = useState(String(initialBuyQuantity));
  const [getQuantity, setGetQuantity] = useState(String(initialGetQuantity));
  const [productIds, setProductIds] = useState(initialProductIds);
  const [giftMode, setGiftMode] = useState<"same_product" | "any_product" | "specific_products">(
    ["same_product", "any_product", "specific_products"].includes(initialGiftMode) ? initialGiftMode as "same_product" | "any_product" | "specific_products" : "same_product"
  );
  const [giftProductIds, setGiftProductIds] = useState(initialGiftProductIds);
  const [giftDiscountType, setGiftDiscountType] = useState<"free" | "percent" | "fixed">(
    ["free", "percent", "fixed"].includes(initialGiftDiscountType) ? initialGiftDiscountType as "free" | "percent" | "fixed" : "free"
  );
  const [giftDiscountValue, setGiftDiscountValue] = useState(String(initialGiftDiscountValue ?? 100));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/discount-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, type, value: Number(value) || 0, buyQuantity: Number(buyQuantity) || 1,
          getQuantity: Number(getQuantity) || 1, productIds, giftMode, giftProductIds, giftDiscountType, giftDiscountValue: Number(giftDiscountValue) || 0 }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save discount settings.");
      setMessage("Discount settings saved."); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save discount settings.");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm space-y-5">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="accent-brand-dark w-4 h-4" />
        <span className="font-medium">Enable automatic discount</span>
      </label>
      {enabled && <>
        <div>
          <label htmlFor="discountType" className="text-sm block mb-1">Offer type</label>
          <select id="discountType" className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={type} onChange={(event) => setType(event.target.value as DiscountType)}>
            <option value="percent">Percentage off</option><option value="fixed">Fixed amount off (LE)</option><option value="buy_get">Buy X, get Y free</option>
          </select>
        </div>
        {type === "buy_get" ? <>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Buy quantity<input type="number" min={1} required className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={buyQuantity} onChange={(event) => setBuyQuantity(event.target.value)} /></label>
            <label className="text-sm">Free quantity<input type="number" min={1} required className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={getQuantity} onChange={(event) => setGetQuantity(event.target.value)} /></label>
          </div>
          <ProductPicker label="Products that qualify as the purchase (X)" products={products} selected={productIds} onChange={setProductIds} />
          <div>
            <label htmlFor="giftMode" className="text-sm block mb-1">Gift item (Y)</label>
            <select id="giftMode" className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={giftMode} onChange={(event) => setGiftMode(event.target.value as typeof giftMode)}>
              <option value="same_product">Same product as the qualifying purchase</option>
              <option value="any_product">Any product already in the cart</option>
              <option value="specific_products">Choose specific gift products</option>
            </select>
          </div>
          {giftMode === "specific_products" && <ProductPicker label="Products customers can receive as a gift (Y)" products={products} selected={giftProductIds} onChange={setGiftProductIds} />}
          <div>
            <label htmlFor="giftDiscountType" className="text-sm block mb-1">Discount on the reward item(s)</label>
            <select id="giftDiscountType" className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={giftDiscountType} onChange={(event) => setGiftDiscountType(event.target.value as typeof giftDiscountType)}>
              <option value="free">Free (100% off)</option><option value="percent">Percentage off each reward item</option><option value="fixed">Fixed amount off each reward item (LE)</option>
            </select>
          </div>
          {giftDiscountType !== "free" && <label className="text-sm block">{giftDiscountType === "percent" ? "Reward discount (%)" : "Amount off per reward item (LE)"}
            <input type="number" min={0} max={giftDiscountType === "percent" ? 100 : undefined} step="0.01" required className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={giftDiscountValue} onChange={(event) => setGiftDiscountValue(event.target.value)} />
          </label>}
          <p className="text-xs text-foreground/55">For a different gift, the gift product must also be in the cart. The cheapest eligible gift units are discounted first.</p>
        </> : <>
          <label className="text-sm block">Discount {type === "percent" ? "(%)" : "(LE)"}<input type="number" min={0} max={type === "percent" ? 100 : undefined} step="0.01" required className="w-full border border-brand-light rounded-xl px-4 py-2.5" value={value} onChange={(event) => setValue(event.target.value)} /></label>
          <ProductPicker label="Products this discount applies to" products={products} selected={productIds} onChange={setProductIds} />
        </>}
      </>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50">{saving ? "Saving…" : "Save discount"}</button>
        {message && <p role="status" className="text-sm">{message}</p>}
      </div>
    </form>
  );
}
