-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "careInstructions" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "colorHex" TEXT;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "returnPolicyText" TEXT NOT NULL DEFAULT '';
