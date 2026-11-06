-- Add configurable automatic discounts and persist applied order discount.
ALTER TABLE "SiteSetting"
  ADD COLUMN "discountEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "discountType" TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN "discountValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discountBuyQuantity" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN "discountGetQuantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Order"
  ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

