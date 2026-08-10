-- Root: Transport
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Transport', 'PRODUCT', '🚗', 2, NULL
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Avtomobillar', 'PRODUCT', '🚙', 0, (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Avtomobillar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Mototsikl va moped', 'PRODUCT', '🏍️', 1, (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Mototsikl va moped'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Yuk mashinalari va maxsus texnika', 'PRODUCT', '🚚', 2, (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Yuk mashinalari va maxsus texnika'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Velosipedlar', 'PRODUCT', '🚲', 3, (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Velosipedlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Avto aksessuarlar', 'PRODUCT', '🔧', 4, (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Avto aksessuarlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Transport' AND "parentId" IS NULL)
);

-- Root: Ko'chmas mulk
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Ko''chmas mulk', 'PRODUCT', '🏠', 3, NULL
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Kvartira sotiladi', 'PRODUCT', '🏢', 0, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Kvartira sotiladi'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Kvartira ijaraga', 'PRODUCT', '🔑', 1, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Kvartira ijaraga'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Uy/hovli sotiladi', 'PRODUCT', '🏡', 2, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Uy/hovli sotiladi'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Uy/hovli ijaraga', 'PRODUCT', '🏘️', 3, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Uy/hovli ijaraga'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Yer uchastka', 'PRODUCT', '🌳', 4, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Yer uchastka'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Ofis va tijorat mulki', 'PRODUCT', '🏬', 5, (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Ofis va tijorat mulki'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Ko''chmas mulk' AND "parentId" IS NULL)
);

-- Root: Hayvonlar
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Hayvonlar', 'PRODUCT', '🐾', 4, NULL
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Uy hayvonlari', 'PRODUCT', '🐶', 0, (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Uy hayvonlari'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Qushlar', 'PRODUCT', '🐦', 1, (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Qushlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Chorva mollari', 'PRODUCT', '🐄', 2, (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Chorva mollari'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Hayvonlar uchun tovarlar', 'PRODUCT', '🦴', 3, (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Hayvonlar uchun tovarlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hayvonlar' AND "parentId" IS NULL)
);

-- Root: Hobbi va bo'sh vaqt
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Hobbi va bo''sh vaqt', 'PRODUCT', '🎨', 5, NULL
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Kitoblar va jurnallar', 'PRODUCT', '📖', 0, (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Kitoblar va jurnallar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Musiqa asboblari', 'PRODUCT', '🎸', 1, (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Musiqa asboblari'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Kolleksiya buyumlari', 'PRODUCT', '🏺', 2, (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Kolleksiya buyumlari'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'O''yin konsollari va video o''yinlar', 'PRODUCT', '🎮', 3, (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'O''yin konsollari va video o''yinlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Hobbi va bo''sh vaqt' AND "parentId" IS NULL)
);

-- Yangi xizmat yo'nalishlari (mavjud "Xizmatlar" ildiziga)
INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'IT va dasturlash', 'SERVICE', '💻', 10 + 0, (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
WHERE (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL) IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'IT va dasturlash'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Fotosurat va video xizmati', 'SERVICE', '📸', 10 + 1, (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
WHERE (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL) IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Fotosurat va video xizmati'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Tarjima xizmati', 'SERVICE', '🌐', 10 + 2, (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
WHERE (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL) IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Tarjima xizmati'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Huquqiy xizmatlar', 'SERVICE', '⚖️', 10 + 3, (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
WHERE (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL) IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Huquqiy xizmatlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Tibbiy xizmatlar', 'SERVICE', '🩺', 10 + 4, (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
WHERE (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL) IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Tibbiy xizmatlar'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
);

INSERT INTO "Category" (id, "nameUz", type, icon, "sortOrder", "parentId")
SELECT gen_random_uuid()::text, 'Yetkazib berish / kuryer', 'SERVICE', '📦', 10 + 5, (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
WHERE (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL) IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."nameUz" = 'Yetkazib berish / kuryer'
    AND c."parentId" = (SELECT id FROM "Category" WHERE "nameUz" = 'Xizmatlar' AND "parentId" IS NULL)
);

