import { PrismaClient, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  { nameUz: "Elektrik", icon: "🔌" },
  { nameUz: "Santexnik", icon: "🚿" },
  { nameUz: "Kompyuter va noutbuk ustasi", icon: "💻" },
  { nameUz: "Konditsioner xizmati", icon: "❄️" },
  { nameUz: "Mebel yig'uvchi", icon: "🪑" },
  { nameUz: "Tozalash xizmati", icon: "🧹" },
  { nameUz: "Ta'mirlash-qurilish", icon: "🛠️" },
  { nameUz: "O'qituvchi / repetitor", icon: "📚" },
  { nameUz: "Go'zallik va parvarish", icon: "💇" },
  { nameUz: "Boshqa xizmatlar", icon: "🔧" },
];

const PRODUCTS = [
  { nameUz: "Elektronika", icon: "📱" },
  { nameUz: "Kiyim-kechak", icon: "👕" },
  { nameUz: "Uy-ro'zg'or buyumlari", icon: "🏠" },
  { nameUz: "Bolalar tovarlari", icon: "🧸" },
  { nameUz: "Sport va bo'sh vaqt", icon: "⚽" },
  { nameUz: "Avtomobil ehtiyot qismlari", icon: "🚗" },
  { nameUz: "Boshqa mahsulotlar", icon: "📦" },
];

async function main() {
  const servicesRoot = await prisma.category.create({
    data: { nameUz: "Xizmatlar", type: CategoryType.SERVICE, icon: "🧰", sortOrder: 0 },
  });
  const productsRoot = await prisma.category.create({
    data: { nameUz: "Mahsulotlar", type: CategoryType.PRODUCT, icon: "🛍️", sortOrder: 1 },
  });

  for (const [i, c] of SERVICES.entries()) {
    await prisma.category.create({
      data: { ...c, type: CategoryType.SERVICE, parentId: servicesRoot.id, sortOrder: i },
    });
  }

  for (const [i, c] of PRODUCTS.entries()) {
    await prisma.category.create({
      data: { ...c, type: CategoryType.PRODUCT, parentId: productsRoot.id, sortOrder: i },
    });
  }

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
