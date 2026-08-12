-- Yangi "15 daqiqadan keyin referal taklifnomasi" funksiyasi faqat shu
-- migratsiyadan keyin ro'yxatdan o'tadigan foydalanuvchilarga tegishli
-- bo'lishi uchun, mavjud (eski) foydalanuvchilar shu xabarni olmaydi deb
-- belgilanadi.
UPDATE "User" SET "referralPromptSent" = true WHERE "referralPromptSent" = false;
