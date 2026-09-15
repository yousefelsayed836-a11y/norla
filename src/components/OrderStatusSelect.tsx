"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStatus: string) {
    if (!STATUSES.includes(newStatus as (typeof STATUSES)[number]) || newStatus === value || saving) return;
    const previousValue = value;
    setValue(newStatus);
    setError(null);
    setSaving(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Status update failed");
      router.refresh();
    } catch {
      setValue(previousValue);
      setError("Could not update status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <select value={value} disabled={saving} onChange={(e) => handleChange(e.target.value)} className="border border-brand-light rounded-lg px-3 py-2 text-sm">
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
