-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "contactAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contactEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contactHours" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contactPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "facebookUrl" TEXT NOT NULL DEFAULT '';
