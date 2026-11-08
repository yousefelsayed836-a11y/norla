ALTER TABLE "SiteSetting"
  ADD COLUMN "discountGiftDiscountType" TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN "discountGiftDiscountValue" DECIMAL(10,2) NOT NULL DEFAULT 100;
