import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Kategoriya daraxti endi committed migratsiyalar orqali (raw SQL) to'ldiriladi,
 * bu yerda emas - shuning uchun bu skript faqat boshlang'ich admin
 * foydalanuvchini yaratadi.
 */
async function main() {
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
  if (adminTelegramId) {
    await prisma.user.upsert({
      where: { telegramId: adminTelegramId },
      update: { isAdmin: true },
      create: {
        telegramId: adminTelegramId,
        firstName: "Super Admin",
        isAdmin: true,
      },
    });
  }

  console.log("Seed tugadi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
