-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "shortDescriptionAr" TEXT;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "announcementTextAr" TEXT,
ADD COLUMN     "careInstructionsTextAr" TEXT,
ADD COLUMN     "contactAddressAr" TEXT,
ADD COLUMN     "contactHoursAr" TEXT;
