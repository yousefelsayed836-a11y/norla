"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_CONFIG } from "@/components/OrderStatusBadge";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "EXPRESS", "PROBLEM"];

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    setValue(newStatus);
    setSaving(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    router.refresh();
  }

  const cfg = STATUS_CONFIG[value] ?? { selectBg: "#f3f4f6" };

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      style={{ backgroundColor: cfg.selectBg }}
      className="border border-black/10 rounded-lg px-2 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-60 transition-colors"
    >
      {STATUSES.map((s) => {
        const c = STATUS_CONFIG[s];
        return (
          <option key={s} value={s}>
            {c?.label ?? s}
          </option>
        );
      })}
    </select>
  );
}
