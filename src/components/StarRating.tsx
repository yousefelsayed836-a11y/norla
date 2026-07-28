"use client";

import { useLanguage } from "@/lib/i18n";

export default function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  const { t } = useLanguage();
  if (reviewCount <= 0) return null;
  const full = Math.round(rating);

  return (
    <div className="flex items-center gap-2 text-brand-dark">
      <span aria-hidden>
        {"★".repeat(full)}
        <span className="text-brand-light">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-sm text-foreground/50">
        {reviewCount} {t("product.reviews")}
      </span>
    </div>
  );
}
