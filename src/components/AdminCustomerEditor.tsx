"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  name: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  governorate: string;
};

export default function AdminCustomerEditor({
  orderId,
  initialCustomer,
}: {
  orderId: string;
  initialCustomer: Customer;
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(key: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setMessage("Saved successfully");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
      <h2 className="font-medium mb-4 text-foreground/50 text-sm uppercase tracking-wide">
        Edit Customer & Delivery Details
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        {([
          ["name", "Customer name"],
          ["phone", "Phone"],
          ["whatsappNumber", "WhatsApp"],
          ["city", "City"],
          ["governorate", "Governorate"],
          ["address", "Delivery address"],
        ] as const).map(([key, label]) => (
          <label key={key} className={key === "address" ? "md:col-span-2" : ""}>
            <span className="block text-xs text-foreground/50 mb-1">{label}</span>
            <input
              value={customer[key]}
              onChange={(e) => update(key, e.target.value)}
              className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-brand-dark text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Customer Details"}
        </button>
        {message && <span className="text-sm text-foreground/60">{message}</span>}
      </div>
    </div>
  );
}
