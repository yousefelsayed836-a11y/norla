INSERT INTO "ShippingCity" (id, "zoneId", name, "nameAr")
SELECT gen_random_uuid()::text, z.id, 'أطراف القاهرة', 'أطراف القاهرة'
FROM "ShippingZone" z
WHERE z.governorate = 'Cairo'
  AND NOT EXISTS (
    SELECT 1 FROM "ShippingCity" c WHERE c."zoneId" = z.id AND c.name = 'أطراف القاهرة'
  );

INSERT INTO "ShippingCity" (id, "zoneId", name, "nameAr")
SELECT gen_random_uuid()::text, z.id, 'أطراف الجيزة', 'أطراف الجيزة'
FROM "ShippingZone" z
WHERE z.governorate = 'Giza'
  AND NOT EXISTS (
    SELECT 1 FROM "ShippingCity" c WHERE c."zoneId" = z.id AND c.name = 'أطراف الجيزة'
  );
