export function hasAvailableStock(stockQty: number | null, stockStatus: string, requested = 1) {
  return Number.isInteger(requested) && requested > 0 && stockStatus !== "outofstock" &&
    (stockQty == null || stockQty >= requested);
}

