import type { Prisma } from "@/generated/prisma/client";

type StockItem = { productId: string; variantId?: string | null; quantity: number };

/** direction -1 decrements stock (order placed), +1 restocks (order cancelled). */
export async function adjustStock(
  tx: Prisma.TransactionClient,
  items: StockItem[],
  direction: 1 | -1
) {
  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stockQty == null) continue;
      const newQty = Math.max(0, variant.stockQty + direction * item.quantity);
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQty: newQty, stockStatus: nextStockStatus(variant.stockStatus, newQty) },
      });
    } else {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stockQty == null) continue;
      const newQty = Math.max(0, product.stockQty + direction * item.quantity);
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: newQty, stockStatus: nextStockStatus(product.stockStatus, newQty) },
      });
    }
  }
}

function nextStockStatus(current: string, newQty: number) {
  if (newQty === 0 && current === "instock") return "outofstock";
  if (newQty > 0 && current === "outofstock") return "instock";
  return current;
}
