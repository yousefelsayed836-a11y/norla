import type { Prisma } from "@/generated/prisma/client";
import { hasAvailableStock } from "@/lib/stock-rules";

type StockItem = { productId: string; variantId?: string | null; quantity: number };

export class StockUnavailableError extends Error {
  constructor(message = "One or more selected items are out of stock or have insufficient quantity.") {
    super(message);
    this.name = "StockUnavailableError";
  }
}

/**
 * Atomically decrements finite stock so concurrent checkouts cannot oversell.
 * A null stockQty means inventory is untracked, but an explicitly out-of-stock
 * item remains unavailable. direction +1 restores stock after cancellation.
 */
export async function adjustStock(
  tx: Prisma.TransactionClient,
  items: StockItem[],
  direction: 1 | -1
) {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new StockUnavailableError("Invalid item quantity.");
    }

    if (item.variantId) {
      const variant = await tx.productVariant.findFirst({
        where: { id: item.variantId, productId: item.productId },
        select: { id: true, stockQty: true, stockStatus: true },
      });
      if (!variant) throw new StockUnavailableError("The selected variant is unavailable.");
      if (variant.stockQty == null) {
        if (direction === -1 && !hasAvailableStock(null, variant.stockStatus, item.quantity)) throw new StockUnavailableError();
        continue;
      }
      if (direction === -1 && !hasAvailableStock(variant.stockQty, variant.stockStatus, item.quantity)) throw new StockUnavailableError();

      const changed = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "stockQty" = GREATEST(0, "stockQty" + ${direction * item.quantity}),
            "stockStatus" = CASE
              WHEN "stockQty" + ${direction * item.quantity} <= 0 THEN 'outofstock'
              WHEN "stockQty" + ${direction * item.quantity} > 0 AND "stockStatus" = 'outofstock' THEN 'instock'
              ELSE "stockStatus"
            END
        WHERE id = ${item.variantId}
          AND productId = ${item.productId}
          AND "stockQty" IS NOT NULL
          AND (${direction} = 1 OR ("stockStatus" <> 'outofstock' AND "stockQty" >= ${item.quantity}))
          AND (${direction} = -1 OR "stockQty" + ${item.quantity} >= 0)
      `;
      if (changed !== 1) throw new StockUnavailableError();
    } else {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stockQty: true, stockStatus: true },
      });
      if (!product) throw new StockUnavailableError("The selected product is unavailable.");
      if (product.stockQty == null) {
        if (direction === -1 && !hasAvailableStock(null, product.stockStatus, item.quantity)) throw new StockUnavailableError();
        continue;
      }
      if (direction === -1 && !hasAvailableStock(product.stockQty, product.stockStatus, item.quantity)) throw new StockUnavailableError();

      const changed = await tx.$executeRaw`
        UPDATE "Product"
        SET "stockQty" = GREATEST(0, "stockQty" + ${direction * item.quantity}),
            "stockStatus" = CASE
              WHEN "stockQty" + ${direction * item.quantity} <= 0 THEN 'outofstock'
              WHEN "stockQty" + ${direction * item.quantity} > 0 AND "stockStatus" = 'outofstock' THEN 'instock'
              ELSE "stockStatus"
            END
        WHERE id = ${item.productId}
          AND "stockQty" IS NOT NULL
          AND (${direction} = 1 OR ("stockStatus" <> 'outofstock' AND "stockQty" >= ${item.quantity}))
          AND (${direction} = -1 OR "stockQty" + ${item.quantity} >= 0)
      `;
      if (changed !== 1) throw new StockUnavailableError();
    }
  }
}

