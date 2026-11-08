"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_CONFIG } from "@/components/OrderStatusBadge";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "EXPRESS", "PROBLEM"] as const;
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPRESS: "bg-fuchsia-100 text-fuchsia-700",
  PROBLEM: "bg-orange-100 text-orange-700",
};

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
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error || "Status update failed");
      }
      router.refresh();
    } catch (updateError) {
      setValue(previousValue);
      setError(updateError instanceof Error ? updateError.message : "Could not update status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const cfg = STATUS_CONFIG[value] ?? { selectBg: "#f3f4f6" };

  return (
    <div>
      <select value={value} disabled={saving} onChange={(e) => handleChange(e.target.value)} className={`border border-brand-light rounded-lg px-3 py-2 text-sm ${STATUS_COLORS[value] ?? ""}`}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

