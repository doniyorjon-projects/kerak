-- "Uy/hovli" birlashtirilgan toifasi ikkiga ajratiladi: "Uy" (uy) va "Hovli"
-- (hovlili uy). Mavjud e'lonlar buzilmasligi uchun eski nom o'zgartiriladi
-- (ID saqlanib qoladi), yangi "Hovli" toifalari esa alohida qo'shiladi.

-- "Uy/hovli sotiladi" -> "Uy sotiladi"
UPDATE "Category" SET "nameUz" = 'Uy sotiladi', "sortOrder" = 2
WHERE "nameUz" = 'Uy/hovli sotiladi'
  AND "parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL);

-- "Uy/hovli ijaraga" -> "Uy ijaraga"
UPDATE "Category" SET "nameUz" = 'Uy ijaraga', "sortOrder" = 4
WHERE "nameUz" = 'Uy/hovli ijaraga'
  AND "parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL);

-- Qolgan toifalarni qayta tartiblash
UPDATE "Category" SET "sortOrder" = 6
WHERE "nameUz" = 'Yer uchastka'
  AND "parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL);

UPDATE "Category" SET "sortOrder" = 7
WHERE "nameUz" = 'Ofis va tijorat mulki'
  AND "parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL);

-- Yangi: "Hovli sotiladi"
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Hovli sotiladi', 'PRODUCT', '🏡', 3, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Hovli sotiladi'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

-- Yangi: "Hovli ijaraga"
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Hovli ijaraga', 'PRODUCT', '🏘️', 5, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Hovli ijaraga'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);
