"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type TestimonialFormValues = {
  id?: string;
  customerName: string;
  quote: string;
  quoteAr: string;
  rating: number;
  position: number;
};

export default function TestimonialForm({ initial }: { initial?: TestimonialFormValues }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [quote, setQuote] = useState(initial?.quote ?? "");
  const [quoteAr, setQuoteAr] = useState(initial?.quoteAr ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(initial?.id ? `/api/testimonials/${initial.id}` : "/api/testimonials", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, quote, quoteAr, rating, position }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Failed to save testimonial.");
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.id || !confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${initial.id}`, { method: "DELETE" });
    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 bg-white rounded-2xl p-8 shadow-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="text-sm font-medium block mb-1">Customer Name</label>
        <input
          required
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Review Text</label>
        <textarea
          required
          rows={4}
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Review Text (Arabic)</label>
        <textarea
          rows={4}
          dir="rtl"
          placeholder="اختياري — يظهر للزوار اللي مختارين اللغة العربية"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={quoteAr}
          onChange={(e) => setQuoteAr(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Rating (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={rating}
            onChange={(e) => setRating(Math.min(5, Math.max(1, parseInt(e.target.value) || 5)))}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Order</label>
          <input
            type="number"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={position}
            onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          disabled={loading}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Testimonial"}
        </button>
        {initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 rounded-full font-medium border border-red-300 text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
