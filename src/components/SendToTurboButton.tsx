"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendToTurboButton({
  orderId,
  defaultGovernment,
  defaultArea,
  defaultAmount,
  turboOrderId,
  turboStatus,
}: {
  orderId: string;
  defaultGovernment: string;
  defaultArea: string;
  defaultAmount: number;
  turboOrderId: string | null;
  turboStatus: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [government, setGovernment] = useState(defaultGovernment);
  const [area, setArea] = useState(defaultArea);
  const [amount, setAmount] = useState(String(defaultAmount));
  const [weight, setWeight] = useState("1");
  const [isFragile, setIsFragile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/turbo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        government,
        area,
        amountToBeCollected: parseFloat(amount) || 0,
        weight: parseFloat(weight) || 1,
        isFragile,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to send to Turbo.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (turboStatus === "sent" && turboOrderId) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-medium mb-2 text-foreground/50 text-sm uppercase tracking-wide">
          Turbo Shipment
        </h2>
        <p className="text-sm text-green-700 font-medium">
          Sent — tracking number: {turboOrderId}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-3 text-xs text-foreground/50 underline hover:text-brand-dark"
        >
          Send again
        </button>
        {open && (
          <TurboForm
            government={government}
            setGovernment={setGovernment}
            area={area}
            setArea={setArea}
            amount={amount}
            setAmount={setAmount}
            weight={weight}
            setWeight={setWeight}
            isFragile={isFragile}
            setIsFragile={setIsFragile}
            loading={loading}
            error={error}
            onCancel={() => setOpen(false)}
            onSend={handleSend}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-medium mb-2 text-foreground/50 text-sm uppercase tracking-wide">
        Turbo Shipment
      </h2>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
        >
          Send to Turbo
        </button>
      ) : (
        <TurboForm
          government={government}
          setGovernment={setGovernment}
          area={area}
          setArea={setArea}
          amount={amount}
          setAmount={setAmount}
          weight={weight}
          setWeight={setWeight}
          isFragile={isFragile}
          setIsFragile={setIsFragile}
          loading={loading}
          error={error}
          onCancel={() => setOpen(false)}
          onSend={handleSend}
        />
      )}
    </div>
  );
}

function TurboForm({
  government,
  setGovernment,
  area,
  setArea,
  amount,
  setAmount,
  weight,
  setWeight,
  isFragile,
  setIsFragile,
  loading,
  error,
  onCancel,
  onSend,
}: {
  government: string;
  setGovernment: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  isFragile: boolean;
  setIsFragile: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSend: () => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-foreground/50">
        Confirm the shipment details before sending to Turbo. Adjust the government/area names if
        Turbo doesn&apos;t recognize them.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Government (Turbo)</label>
          <input
            className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={government}
            onChange={(e) => setGovernment(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Area</label>
          <input
            className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Amount to collect (LE)</label>
          <input
            type="number"
            className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFragile}
          onChange={(e) => setIsFragile(e.target.checked)}
          className="accent-brand-dark w-4 h-4"
        />
        Fragile
      </label>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSend}
          disabled={loading}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Confirm & Send"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm font-medium border border-brand-light"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
