export type DiscountLine = { productId: string; price: number; quantity: number };

export type DiscountRule = {
  id?: string;
  name?: string;
  nameAr?: string;
  enabled: boolean;
  type: string;
  value: number;
  buyQuantity: number;
  getQuantity: number;
  productIds: string[];
  giftMode: "same_product" | "any_product" | "specific_products";
  giftProductIds: string[];
  giftDiscountType: "free" | "percent" | "fixed";
  giftDiscountValue: number;
  shippingQuantity?: number;
};

export type DiscountOfferRule = DiscountRule & { id: string; name: string; nameAr: string; shippingQuantity: number };

function rewardAmount(price: number, type: DiscountRule["giftDiscountType"], value: number) {
  if (type === "percent") return price * Math.min(100, Math.max(0, value)) / 100;
  if (type === "fixed") return Math.min(price, Math.max(0, value));
  return price;
}

export function calculateDiscount(lines: DiscountLine[], rule: DiscountRule) {
  const eligible = rule.productIds.length
    ? lines.filter((line) => rule.productIds.includes(line.productId))
    : lines;
  const eligibleSubtotal = eligible.reduce((sum, line) => sum + line.price * line.quantity, 0);
  let amount = 0;
  let giftQuantity = 0;

  if (!rule.enabled || rule.type === "none") return { amount, giftQuantity };

  if (rule.type === "percent") {
    amount = eligibleSubtotal * Math.min(100, Math.max(0, rule.value)) / 100;
  } else if (rule.type === "fixed") {
    amount = Math.min(eligibleSubtotal, Math.max(0, rule.value));
  } else if (rule.type === "buy_get") {
    const buy = Math.max(1, Math.floor(rule.buyQuantity));
    const get = Math.max(1, Math.floor(rule.getQuantity));
    const eligibleGiftLines = rule.giftMode === "same_product"
      ? eligible
      : rule.giftMode === "specific_products"
        ? lines.filter((line) => rule.giftProductIds.includes(line.productId))
        : lines;

    if (rule.giftMode === "same_product") {
      const byProduct = new Map<string, DiscountLine[]>();
      for (const line of eligible) byProduct.set(line.productId, [...(byProduct.get(line.productId) ?? []), line]);
      for (const productLines of byProduct.values()) {
        const units = productLines.reduce((sum, line) => sum + line.quantity, 0);
        let freeRemaining = Math.floor(units / (buy + get)) * get;
        for (const line of [...productLines].sort((a, b) => a.price - b.price)) {
          const free = Math.min(freeRemaining, line.quantity);
          giftQuantity += free;
          amount += rewardAmount(line.price, rule.giftDiscountType, rule.giftDiscountValue) * free;
          freeRemaining -= free;
          if (!freeRemaining) break;
        }
      }
    } else {
      const qualifyingUnits = eligible.reduce((sum, line) => sum + line.quantity, 0);
      const giftEntitlement = Math.floor(qualifyingUnits / buy) * get;
      // A distinct gift is selected from cart items. Apply the discount to the cheapest
      // available eligible gifts so the customer cannot choose an inflated discount.
      const qualifyingUnitsReserved = Math.floor(qualifyingUnits / buy) * buy;
      let reserved = qualifyingUnitsReserved;
      const reservedLines = new Map<DiscountLine, number>();
      for (const line of [...eligibleGiftLines].sort((a, b) => b.price - a.price)) {
        const overlap = eligible.some((buyLine) => buyLine.productId === line.productId);
        const lineReserved = overlap ? Math.min(reserved, line.quantity) : 0;
        if (overlap) reserved -= lineReserved;
        reservedLines.set(line, lineReserved);
      }
      let remaining = giftEntitlement;
      for (const line of [...eligibleGiftLines].sort((a, b) => a.price - b.price)) {
        const rewardUnits = Math.min(remaining, line.quantity - (reservedLines.get(line) ?? 0));
        amount += rewardAmount(line.price, rule.giftDiscountType, rule.giftDiscountValue) * rewardUnits;
        giftQuantity += rewardUnits;
        remaining -= rewardUnits;
        if (!remaining) break;
      }
    }
  }

  return {
    amount: Math.min(lines.reduce((sum, line) => sum + line.price * line.quantity, 0), Math.max(0, Math.round(amount * 100) / 100)),
    giftQuantity,
  };
}

export function parseDiscountRules(value: unknown): DiscountOfferRule[] {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { return []; }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((entry): entry is DiscountOfferRule => {
    if (!entry || typeof entry !== "object") return false;
    const rule = entry as Partial<DiscountOfferRule>;
    return typeof rule.id === "string" && typeof rule.name === "string" &&
      typeof rule.enabled === "boolean" && ["percent", "fixed", "buy_get", "free_shipping"].includes(rule.type ?? "") &&
      Array.isArray(rule.productIds) && Number.isInteger(rule.buyQuantity) && Number(rule.buyQuantity) > 0;
  }).map((rule) => ({
    ...rule,
    nameAr: rule.nameAr ?? "",
    value: Number(rule.value) || 0,
    getQuantity: Number(rule.getQuantity) || 1,
    giftMode: rule.giftMode ?? "same_product",
    giftProductIds: Array.isArray(rule.giftProductIds) ? rule.giftProductIds : [],
    giftDiscountType: rule.giftDiscountType ?? "free",
    giftDiscountValue: Number(rule.giftDiscountValue) || 100,
    shippingQuantity: Number(rule.shippingQuantity) || 0,
  }));
}

export function calculateDiscountOffers(lines: DiscountLine[], rules: DiscountOfferRule[]) {
  let amount = 0;
  let giftQuantity = 0;
  let freeShipping = false;
  const appliedRuleIds: string[] = [];
  const pendingOffers: DiscountOfferRule[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const eligibleUnits = (rule.productIds.length
      ? lines.filter((line) => rule.productIds.includes(line.productId))
      : lines).reduce((sum, line) => sum + line.quantity, 0);
    if (rule.type === "free_shipping") {
      if (eligibleUnits >= rule.buyQuantity) {
        freeShipping = true;
        appliedRuleIds.push(rule.id);
      } else if (eligibleUnits > 0) pendingOffers.push(rule);
      continue;
    }
    const result = calculateDiscount(lines, rule);
    if (result.amount > 0) {
      amount += result.amount;
      giftQuantity += result.giftQuantity;
      appliedRuleIds.push(rule.id);
    } else if (eligibleUnits > 0 && rule.type === "buy_get") {
      pendingOffers.push(rule);
    }
    if (rule.shippingQuantity > 0 && eligibleUnits >= rule.shippingQuantity) {
      freeShipping = true;
      if (!appliedRuleIds.includes(rule.id)) appliedRuleIds.push(rule.id);
    } else if (rule.shippingQuantity > eligibleUnits && eligibleUnits > 0) {
      pendingOffers.push(rule);
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return {
    amount: Math.min(subtotal, Math.max(0, Math.round(amount * 100) / 100)),
    giftQuantity,
    freeShipping,
    appliedRuleIds: [...new Set(appliedRuleIds)],
    pendingOffers: [...new Map(pendingOffers.map((rule) => [rule.id, rule])).values()],
  };
}

export function discountOfferCopy(rule: DiscountOfferRule) {
  if (rule.name.trim()) return { en: rule.name, ar: rule.nameAr || rule.name };
  if (rule.type === "free_shipping") return {
    en: `Buy ${rule.buyQuantity} qualifying item${rule.buyQuantity === 1 ? "" : "s"} and get free shipping`,
    ar: `اشتري ${rule.buyQuantity} قطعة من المنتجات المحددة واحصلي على شحن مجاني`,
  };
  if (rule.type === "buy_get") {
    const reward = rule.giftDiscountType === "free" ? "free" : rule.giftDiscountType === "percent" ? `${rule.giftDiscountValue}% off` : `${rule.giftDiscountValue} LE off`;
    return {
      en: `Buy ${rule.buyQuantity}, get ${rule.getQuantity} reward item${rule.getQuantity === 1 ? "" : "s"} ${reward}`,
      ar: `اشتري ${rule.buyQuantity} وخدي ${rule.getQuantity} قطعة بخصم ${rule.giftDiscountType === "free" ? "كامل" : rule.giftDiscountType === "percent" ? `${rule.giftDiscountValue}%` : `${rule.giftDiscountValue} جنيه`}`,
    };
  }
  return rule.type === "percent"
    ? { en: `${rule.value}% off selected items`, ar: `خصم ${rule.value}% على المنتجات المحددة` }
    : { en: `${rule.value} LE off selected items`, ar: `خصم ${rule.value} جنيه على المنتجات المحددة` };
}

export function parseProductIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((id): id is string => typeof id === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
