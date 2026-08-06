import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TelegramWebAppUser } from "../../common/telegram-init-data";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromTelegram(tgUser: TelegramWebAppUser) {
    return this.prisma.user.upsert({
      where: { telegramId: String(tgUser.id) },
      update: {
        // firstName qasddan yangilanmaydi - foydalanuvchi profilda o'z nomini
        // o'zgartirgan bo'lishi mumkin, Telegram'dan qayta yozib yuborilmasligi kerak.
        username: tgUser.username ?? null,
      },
      create: {
        telegramId: String(tgUser.id),
        username: tgUser.username ?? null,
        firstName: tgUser.first_name,
      },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    return this.prisma.user.update({ where: { id: userId }, data: { lat, lng } });
  }

  async updatePhone(userId: string, phone: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { phone } });
  }

  async updateFirstName(userId: string, firstName: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { firstName } });
  }

  async findById(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }
}
