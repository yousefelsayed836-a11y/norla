export type DiscountLine = { productId: string; price: number; quantity: number };

export type DiscountRule = {
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
};

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

