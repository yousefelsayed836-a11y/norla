"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddExtraCitiesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleAdd() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/add-extra-cities", { method: "POST" });
      const data = await res.json();
      setResult(
        data.added?.length > 0
          ? `Added: ${data.added.join(", ")}`
          : "Already added — nothing to do."
      );
      router.refresh();
    } catch {
      setResult("Failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-white border border-brand-dark text-brand-dark px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-light disabled:opacity-50 transition-colors"
      >
        {loading ? "Adding..." : "Add أطراف القاهرة / أطراف الجيزة"}
      </button>
      {result && <p className="text-sm text-foreground/60">{result}</p>}
    </div>
  );
}
