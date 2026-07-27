"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShippingZoneForm({
  zoneId,
  governorate,
  initialFee,
  initialActive,
  initialCities,
}: {
  zoneId: string;
  governorate: string;
  initialFee: string;
  initialActive: boolean;
  initialCities: string[];
}) {
  const router = useRouter();
  const [fee, setFee] = useState(initialFee);
  const [active, setActive] = useState(initialActive);
  const [citiesText, setCitiesText] = useState(initialCities.join("\n"));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/shipping-zones/${zoneId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fee: parseFloat(fee) || 0,
        active,
        cityNames: citiesText.split("\n"),
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 bg-white rounded-2xl p-8 shadow-sm">
      <div>
        <label className="text-sm font-medium block mb-1">Governorate</label>
        <input
          disabled
          className="w-full border border-brand-light rounded-xl px-4 py-2.5 bg-brand-light/30"
          value={governorate}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Shipping Fee (EGP)</label>
        <input
          type="number"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="accent-brand-dark w-4 h-4"
        />
        <span className="text-sm">
          {active ? "Shipping to this governorate is open" : "Shipping to this governorate is closed"}
        </span>
      </label>

      <div>
        <label className="text-sm font-medium block mb-1">Cities</label>
        <p className="text-xs text-foreground/50 mb-2">
          One city per line. These appear in the checkout dropdown for this governorate.
        </p>
        <textarea
          rows={12}
          className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm font-mono"
          value={citiesText}
          onChange={(e) => setCitiesText(e.target.value)}
        />
      </div>

      <button
        disabled={saving}
        className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </form>
  );
}
