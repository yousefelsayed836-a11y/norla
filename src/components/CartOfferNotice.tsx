"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { formatEGP } from "@/lib/format";
import {
  calculateDiscountOffers,
  discountOfferCopy,
  discountProgressCopy,
  getDiscountRulesFromSettings,
  type DiscountLine,
  type DiscountOfferRule,
} from "@/lib/discounts";

type CartPromoItem = DiscountLine;

export default function CartOfferNotice({ items, total }: { items: CartPromoItem[]; total: number }) {
  const { pick } = useLanguage();
  const [rules, setRules] = useState<DiscountOfferRule[]>([]);
  const lines = useMemo(() => items.map(({ productId, price, quantity }) => ({ productId, price, quantity })), [items]);
  const result = calculateDiscountOffers(lines, rules);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setRules(getDiscountRulesFromSettings(data.settings ?? {}));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!items.length || !rules.length) return null;

  const relevantRules = rules.filter((rule) => rule.enabled && (
    !rule.productIds.length || items.some((item) => rule.productIds.includes(item.productId))
  ));
  const visibleIds = new Set([...result.pendingOffers.map((rule) => rule.id), ...result.appliedRuleIds]);
  const visibleRules = relevantRules.filter((rule) => visibleIds.has(rule.id));
  if (!visibleRules.length) return null;

  return (
    <section className="rounded-xl border border-brand-light bg-brand-light/30 p-3 text-sm" aria-live="polite">
      <div className="space-y-2">
        {visibleRules.map((rule) => {
          const units = items
            .filter((item) => !rule.productIds.length || rule.productIds.includes(item.productId))
            .reduce((sum, item) => sum + item.quantity, 0);
          const applied = result.appliedRuleIds.includes(rule.id);
          const copy = applied ? discountOfferCopy(rule) : discountProgressCopy(rule, units);
          return <p key={rule.id} className={applied ? "font-medium text-green-800" : "font-medium text-brand-dark"}>
            {pick(applied ? `Offer applied: ${copy.en}` : copy.en, applied ? `تم تطبيق العرض: ${copy.ar}` : copy.ar)}
          </p>;
        })}
      </div>
      {result.amount > 0 && <div className="mt-3 flex items-center justify-between border-t border-brand-light pt-2">
        <span>{pick("Estimated discount", "الخصم المتوقع")}</span>
        <span className="font-semibold text-brand-dark">−{formatEGP(result.amount)}</span>
      </div>}
      {result.amount > 0 && <p className="mt-1 text-xs text-foreground/60">
        {pick(`Estimated total before shipping: ${formatEGP(Math.max(0, total - result.amount))}`, `الإجمالي المتوقع قبل الشحن: ${formatEGP(Math.max(0, total - result.amount))}`)}
      </p>}
    </section>
  );
}

