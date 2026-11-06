"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DiscountType = "none" | "percent" | "fixed" | "buy_get";

export default function DiscountSettingsForm({
  initialEnabled,
  initialType,
  initialValue,
  initialBuyQuantity,
  initialGetQuantity,
}: {
  initialEnabled: boolean;
  initialType: string;
  initialValue: string;
  initialBuyQuantity: number;
  initialGetQuantity: number;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [type, setType] = useState<DiscountType>(
    ["none", "percent", "fixed", "buy_get"].includes(initialType)
      ? (initialType as DiscountType)
      : "none"
  );
  const [value, setValue] = useState(initialValue);
  const [buyQuantity, setBuyQuantity] = useState(String(initialBuyQuantity));
  const [getQuantity, setGetQuantity] = useState(String(initialGetQuantity));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/discount-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          type,
          value: Number(value) || 0,
          buyQuantity: Number(buyQuantity) || 1,
          getQuantity: Number(getQuantity) || 1,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Could not save discount settings.");
      }

      setMessage("Discount settings saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save discount settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-2xl p-6 shadow-sm space-y-5">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="accent-brand-dark w-4 h-4"
        />
        <span className="font-medium">Enable automatic discount</span>
      </label>

      {enabled && (
        <>
          <div>
            <label htmlFor="discountType" className="text-sm block mb-1">Offer type</label>
            <select
              id="discountType"
              className="w-full border border-brand-light rounded-xl px-4 py-2.5"
              value={type}
              onChange={(event) => setType(event.target.value as DiscountType)}
            >
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off (LE)</option>
              <option value="buy_get">Buy X, get Y free</option>
            </select>
          </div>

          {type === "buy_get" ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Buy quantity
                <input
                  type="number"
                  min={1}
                  required
                  className="w-full border border-brand-light rounded-xl px-4 py-2.5"
                  value={buyQuantity}
                  onChange={(event) => setBuyQuantity(event.target.value)}
                />
              </label>
              <label className="text-sm">
                Free quantity
                <input
                  type="number"
                  min={1}
                  required
                  className="w-full border border-brand-light rounded-xl px-4 py-2.5"
                  value={getQuantity}
                  onChange={(event) => setGetQuantity(event.target.value)}
                />
              </label>
            </div>
          ) : (
            <label className="text-sm block">
              Discount {type === "percent" ? "(%)" : "(LE)"}
              <input
                type="number"
                min={0}
                max={type === "percent" ? 100 : undefined}
                step="0.01"
                required
                className="w-full border border-brand-light rounded-xl px-4 py-2.5"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </label>
          )}
        </>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save discount"}
        </button>
        {message && <p role="status" className="text-sm">{message}</p>}
      </div>
    </form>
  );
}

