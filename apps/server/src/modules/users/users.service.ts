import { Injectable } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { REFERRAL_BONUS_AMOUNT } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { TelegramWebAppUser } from "../../common/telegram-init-data";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async upsertFromTelegram(tgUser: TelegramWebAppUser, referralId?: string) {
    const existing = await this.prisma.user.findUnique({ where: { telegramId: String(tgUser.id) } });
    if (existing) {
      // firstName qasddan yangilanmaydi - foydalanuvchi profilda o'z nomini
      // o'zgartirgan bo'lishi mumkin, Telegram'dan qayta yozib yuborilmasligi kerak.
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { username: tgUser.username ?? null },
      });
    }

    const referrer =
      referralId && referralId.length > 0
        ? await this.prisma.user.findUnique({ where: { id: referralId } })
        : null;

    const newUser = await this.prisma.user.create({
      data: {
        telegramId: String(tgUser.id),
        username: tgUser.username ?? null,
        firstName: tgUser.first_name,
        referredById: referrer?.id ?? null,
      },
    });

    if (referrer && referrer.id !== newUser.id) {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: referrer.id },
          data: { balance: { increment: REFERRAL_BONUS_AMOUNT } },
        }),
        this.prisma.user.update({
          where: { id: newUser.id },
          data: { balance: { increment: REFERRAL_BONUS_AMOUNT } },
        }),
        this.prisma.walletTransaction.create({
          data: {
            userId: referrer.id,
            amount: REFERRAL_BONUS_AMOUNT,
            type: "REFERRAL_BONUS",
            note: `Taklif qilingan: ${newUser.firstName}`,
          },
        }),
        this.prisma.walletTransaction.create({
          data: {
            userId: newUser.id,
            amount: REFERRAL_BONUS_AMOUNT,
            type: "REFERRAL_BONUS",
            note: "Referal havola orqali qo'shildingiz",
          },
        }),
      ]);

      await this.notificationsService.create(
        referrer.id,
        NotificationType.REFERRAL_BONUS,
        "Do'stingiz qo'shildi 🎉",
        `${newUser.firstName} sizning havolangiz orqali qo'shildi. Hamyoningizga ${REFERRAL_BONUS_AMOUNT.toLocaleString("uz-UZ")} so'm qo'shildi.`,
        "/wallet",
      );

      return this.prisma.user.findUniqueOrThrow({ where: { id: newUser.id } });
    }

    return newUser;
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
