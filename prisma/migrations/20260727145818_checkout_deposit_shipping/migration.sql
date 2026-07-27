-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "depositPercent" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
