"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatEGP } from "@/lib/format";

export default function SendToTurboButton({
  orderId,
  defaultGovernment,
  defaultGovernmentId,
  defaultArea,
  defaultAmount,
  defaultOrderSummary,
  turboOrderId,
  turboStatus,
  turboAmountToCollect,
  turboReturnAmount,
  turboReturnSummary,
}: {
  orderId: string;
  defaultGovernment: string;
  defaultGovernmentId: number | null;
  defaultArea: string;
  defaultAmount: number;
  defaultOrderSummary: string;
  turboOrderId: string | null;
  turboStatus: string | null;
  turboAmountToCollect: number | null;
  turboReturnAmount: number | null;
  turboReturnSummary: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [government, setGovernment] = useState(defaultGovernment);
  const [area, setArea] = useState(defaultArea);
  const [amount, setAmount] = useState(String(defaultAmount));
  const [orderSummary, setOrderSummary] = useState(defaultOrderSummary);
  const [weight, setWeight] = useState("1");
  const [isFragile, setIsFragile] = useState(false);
  const [isReturn, setIsReturn] = useState(false);
  const [returnAmount, setReturnAmount] = useState("0");
  const [returnSummary, setReturnSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaOptions, setAreaOptions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!open || !defaultGovernmentId) return;
    fetch(`/api/turbo/areas?governmentId=${defaultGovernmentId}`)
      .then((r) => r.json())
      .then((d) => setAreaOptions(d.areas || []))
      .catch(() => {});
  }, [open, defaultGovernmentId]);

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
        orderSummary,
        weight: parseFloat(weight) || 1,
        isFragile,
        isReturn,
        returnAmount: parseFloat(returnAmount) || 0,
        returnSummary,
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
        {turboAmountToCollect != null && (
          <p className="text-sm text-foreground/70 mt-1">
            Cash to collect: <span className="font-medium text-black">{formatEGP(turboAmountToCollect)}</span>
          </p>
        )}
        {turboReturnAmount != null && (
          <p className="text-sm text-foreground/70 mt-1">
            Return pickup: <span className="font-medium text-black">{formatEGP(turboReturnAmount)}</span>
            {turboReturnSummary ? ` — ${turboReturnSummary}` : ""}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <Link
            href={`/admin/orders/${orderId}/waybill`}
            target="_blank"
            className="text-sm font-medium text-brand-dark underline hover:no-underline"
          >
            Print Waybill
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="text-xs text-foreground/50 underline hover:text-brand-dark"
          >
            Send again
          </button>
        </div>
        {open && (
          <TurboForm
            government={government}
            setGovernment={setGovernment}
            area={area}
            setArea={setArea}
            areaOptions={areaOptions}
            amount={amount}
            setAmount={setAmount}
            orderSummary={orderSummary}
            setOrderSummary={setOrderSummary}
            weight={weight}
            setWeight={setWeight}
            isFragile={isFragile}
            setIsFragile={setIsFragile}
            isReturn={isReturn}
            setIsReturn={setIsReturn}
            returnAmount={returnAmount}
            setReturnAmount={setReturnAmount}
            returnSummary={returnSummary}
            setReturnSummary={setReturnSummary}
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
          areaOptions={areaOptions}
          amount={amount}
          setAmount={setAmount}
          orderSummary={orderSummary}
          setOrderSummary={setOrderSummary}
          weight={weight}
          setWeight={setWeight}
          isFragile={isFragile}
          setIsFragile={setIsFragile}
          isReturn={isReturn}
          setIsReturn={setIsReturn}
          returnAmount={returnAmount}
          setReturnAmount={setReturnAmount}
          returnSummary={returnSummary}
          setReturnSummary={setReturnSummary}
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
  areaOptions,
  amount,
  setAmount,
  orderSummary,
  setOrderSummary,
  weight,
  setWeight,
  isFragile,
  setIsFragile,
  isReturn,
  setIsReturn,
  returnAmount,
  setReturnAmount,
  returnSummary,
  setReturnSummary,
  loading,
  error,
  onCancel,
  onSend,
}: {
  government: string;
  setGovernment: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
  areaOptions: { id: number; name: string }[];
  amount: string;
  setAmount: (v: string) => void;
  orderSummary: string;
  setOrderSummary: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  isFragile: boolean;
  setIsFragile: (v: boolean) => void;
  isReturn: boolean;
  setIsReturn: (v: boolean) => void;
  returnAmount: string;
  setReturnAmount: (v: string) => void;
  returnSummary: string;
  setReturnSummary: (v: string) => void;
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
          <label className="text-xs text-foreground/50 block mb-1">
            Area {areaOptions.length > 0 && `(${areaOptions.length} valid options)`}
          </label>
          <input
            list="turbo-area-options"
            className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
          <datalist id="turbo-area-options">
            {areaOptions.map((a) => (
              <option key={a.id} value={a.name} />
            ))}
          </datalist>
          {areaOptions.length > 0 && !areaOptions.some((a) => a.name === area) && (
            <p className="text-[11px] text-amber-600 mt-1">
              &quot;{area}&quot; isn&apos;t in Turbo&apos;s known list for this government — pick a
              suggestion below to avoid an unassigned branch.
            </p>
          )}
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
        <div className="col-span-2">
          <label className="text-xs text-foreground/50 block mb-1">
            Package content (pieces / description)
          </label>
          <input
            className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={orderSummary}
            onChange={(e) => setOrderSummary(e.target.value)}
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

      <div className="border-t border-brand-light pt-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isReturn}
            onChange={(e) => setIsReturn(e.target.checked)}
            className="accent-brand-dark w-4 h-4"
          />
          Also pick up a return from the customer
        </label>
        {isReturn && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-xs text-foreground/50 block mb-1">
                Amount to collect for return (LE)
              </label>
              <input
                type="number"
                className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-foreground/50 block mb-1">Return item summary</label>
              <input
                className="w-full border border-brand-light rounded-xl px-3 py-2 text-sm"
                value={returnSummary}
                onChange={(e) => setReturnSummary(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

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
