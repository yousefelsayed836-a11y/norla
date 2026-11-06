ALTER TABLE "SiteSetting"
  ADD COLUMN "discountProductIds" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "discountGiftMode" TEXT NOT NULL DEFAULT 'same_product',
  ADD COLUMN "discountGiftProductIds" TEXT NOT NULL DEFAULT '[]';

ALTER TABLE "Order"
  ADD COLUMN "discountType" TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN "discountGiftQuantity" INTEGER NOT NULL DEFAULT 0;

UPDATE "Order" SET "discountType" = 'legacy' WHERE "discountAmount" > 0;

