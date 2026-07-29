"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

type ProductOption = { id: string; title: string };

export default function WriteReviewForm({ products }: { products: ProductOption[] }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  if (products.length === 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !productId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, authorName: name, rating, comment }),
      });
      if (!res.ok) throw new Error("failed");
      setSubmitted(true);
      setName("");
      setComment("");
      setRating(5);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 pb-16 font-jost">
      {submitted ? (
        <p className="text-sm text-brand-dark text-center bg-brand-light/40 rounded-xl py-4 px-4">
          {t("reviews.thankYou")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm font-medium text-center mb-1">{t("reviews.writeReview")}</p>
          <input
            required
            placeholder={t("reviews.yourName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
          />
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${t("reviews.yourRating")} ${n}`}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                className="text-2xl leading-none transition-transform hover:scale-110"
              >
                <span
                  className={n <= (hoverRating || rating) ? "text-brand-dark" : "text-brand-light"}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <textarea
            required
            rows={3}
            placeholder={t("reviews.yourReview")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
          />
          {error && <p className="text-red-600 text-xs text-center">{t("reviews.error")}</p>}
          <button
            disabled={loading}
            className="w-full bg-brand-dark text-white py-3 rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? t("reviews.submitting") : t("reviews.submit")}
          </button>
        </form>
      )}
    </section>
  );
}
