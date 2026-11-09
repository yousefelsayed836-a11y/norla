ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "checkoutTransferPhone" TEXT NOT NULL DEFAULT '01027096110';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "checkoutAccountName" TEXT NOT NULL DEFAULT '';

-- Initialize product positions from newest-first order
WITH ranked AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) - 1) AS rn FROM "Product"
)
UPDATE "Product" p SET position = r.rn FROM ranked r WHERE p.id = r.id;
