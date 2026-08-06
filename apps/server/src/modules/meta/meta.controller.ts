import { Controller, ForbiddenException, Get, Post, UseGuards } from "@nestjs/common";
import { CategoryType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import type { User } from "@prisma/client";

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

@Controller()
export class MetaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  getHealth() {
    return { status: "ok" };
  }

  @Get("meta/advertise-contact")
  async getAdvertiseContact() {
    const admin = await this.prisma.user.findFirst({
      where: { isAdmin: true },
      select: { username: true, telegramId: true },
    });
    return { username: admin?.username ?? null, telegramId: admin?.telegramId ?? null };
  }

  @Post("meta/bootstrap-seed")
  @UseGuards(TelegramAuthGuard)
  async bootstrapSeed(@CurrentUser() user: User) {
    if (user.telegramId !== process.env.ADMIN_TELEGRAM_ID) {
      throw new ForbiddenException("Ruxsat yo'q");
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });

    const existingCount = await this.prisma.category.count();
    if (existingCount > 0) {
      return { seeded: false, reason: "Kategoriyalar allaqachon mavjud" };
    }

    const servicesRoot = await this.prisma.category.create({
      data: { nameUz: "Xizmatlar", type: CategoryType.SERVICE, icon: "🧰", sortOrder: 0 },
    });
    const productsRoot = await this.prisma.category.create({
      data: { nameUz: "Mahsulotlar", type: CategoryType.PRODUCT, icon: "🛍️", sortOrder: 1 },
    });

    for (const [i, c] of SERVICES.entries()) {
      await this.prisma.category.create({
        data: { ...c, type: CategoryType.SERVICE, parentId: servicesRoot.id, sortOrder: i },
      });
    }
    for (const [i, c] of PRODUCTS.entries()) {
      await this.prisma.category.create({
        data: { ...c, type: CategoryType.PRODUCT, parentId: productsRoot.id, sortOrder: i },
      });
    }

    return { seeded: true };
  }
}
