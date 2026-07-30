-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "turboAmountToCollect" DECIMAL(10,2),
ADD COLUMN     "turboReturnAmount" DECIMAL(10,2),
ADD COLUMN     "turboReturnSummary" TEXT;
