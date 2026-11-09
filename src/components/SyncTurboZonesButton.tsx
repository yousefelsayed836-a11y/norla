"use client";

import { useState } from "react";

export default function SyncTurboZonesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    if (!confirm("This will sync all 27 Egyptian governorates and their cities from Turbo. Existing cities will be replaced. Continue?")) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync-turbo-zones", { method: "POST" });
      const data = await res.json();
      const ok = data.results?.filter((r: { status: string }) => r.status === "ok").length ?? 0;
      setResult(`Synced ${ok} / ${data.results?.length ?? 0} governorates successfully.`);
    } catch {
      setResult("Sync failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? "Syncing..." : "Sync from Turbo"}
      </button>
      {result && <p className="text-sm text-foreground/60">{result}</p>}
    </div>
  );
}
