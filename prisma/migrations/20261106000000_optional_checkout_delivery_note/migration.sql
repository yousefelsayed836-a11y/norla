ALTER TABLE "SiteSetting"
  ALTER COLUMN "checkoutDeliveryNote" SET DEFAULT '';

UPDATE "SiteSetting"
SET "checkoutDeliveryNote" = ''
WHERE "checkoutDeliveryNote" = 'مدة تنفيذ الاوردر من 4 ل 7 ايام';
