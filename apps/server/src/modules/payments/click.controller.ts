import { Body, Controller, Post } from "@nestjs/common";
import { NotificationType, PaymentStatus, Prisma, PlanOrder, WalletTopupOrder, WalletTransactionType } from "@prisma/client";
import { BOOST_DAYS } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { ClickService, ClickCallbackParams } from "./click.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BotService } from "../bot/bot.service";

const CLICK_ERROR = {
  SUCCESS: 0,
  SIGN_FAILED: -1,
  WRONG_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  ORDER_NOT_FOUND: -5,
  TRANSACTION_NOT_FOUND: -6,
} as const;

@Controller("payments/click")
export class ClickController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clickService: ClickService,
    private readonly notificationsService: NotificationsService,
    private readonly botService: BotService,
  ) {}

  @Post()
  async handleCallback(@Body() body: ClickCallbackParams) {
    if (!this.clickService.verifySignature(body)) {
      return this.reply(body, CLICK_ERROR.SIGN_FAILED, "SIGN CHECK FAILED!");
    }

    if (body.action === "0") return this.prepare(body);
    if (body.action === "1") return this.complete(body);
    return this.reply(body, CLICK_ERROR.ACTION_NOT_FOUND, "Action not found");
  }

  private async prepare(body: ClickCallbackParams) {
    const boostOrder = await this.prisma.boostOrder.findUnique({ where: { id: body.merchant_trans_id } });
    if (boostOrder) return this.prepareOrder("boostOrder", boostOrder, body);

    const planOrder = await this.prisma.planOrder.findUnique({ where: { id: body.merchant_trans_id } });
    if (planOrder) return this.prepareOrder("planOrder", planOrder, body);

    const walletTopupOrder = await this.prisma.walletTopupOrder.findUnique({ where: { id: body.merchant_trans_id } });
    if (walletTopupOrder) return this.prepareOrder("walletTopupOrder", walletTopupOrder, body);

    return this.reply(body, CLICK_ERROR.ORDER_NOT_FOUND, "Order not found");
  }

  private async prepareOrder(
    table: "boostOrder" | "planOrder" | "walletTopupOrder",
    order: { id: string; amount: number; status: PaymentStatus },
    body: ClickCallbackParams,
  ) {
    if (Number(body.amount) !== order.amount) {
      return this.reply(body, CLICK_ERROR.WRONG_AMOUNT, "Incorrect parameter amount");
    }
    if (order.status === PaymentStatus.PAID) {
      return this.reply(body, CLICK_ERROR.ALREADY_PAID, "Already paid");
    }

    if (table === "boostOrder") {
      await this.prisma.boostOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.WAITING, clickTransId: body.click_trans_id },
      });
    } else if (table === "planOrder") {
      await this.prisma.planOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.WAITING, clickTransId: body.click_trans_id },
      });
    } else {
      await this.prisma.walletTopupOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.WAITING, clickTransId: body.click_trans_id },
      });
    }

    return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_prepare_id: order.id });
  }

  private async complete(body: ClickCallbackParams) {
    const orderId = body.merchant_prepare_id ?? body.merchant_trans_id;

    const boostOrder = await this.prisma.boostOrder.findUnique({ where: { id: orderId }, include: { listing: true } });
    if (boostOrder) return this.completeBoostOrder(boostOrder, body);

    const planOrder = await this.prisma.planOrder.findUnique({ where: { id: orderId } });
    if (planOrder) return this.completePlanOrder(planOrder, body);

    const walletTopupOrder = await this.prisma.walletTopupOrder.findUnique({ where: { id: orderId } });
    if (walletTopupOrder) return this.completeWalletTopupOrder(walletTopupOrder, body);

    return this.reply(body, CLICK_ERROR.TRANSACTION_NOT_FOUND, "Transaction not found");
  }

  private async completeWalletTopupOrder(order: WalletTopupOrder, body: ClickCallbackParams) {
    if (Number(body.error) < 0) {
      await this.prisma.walletTopupOrder.update({ where: { id: order.id }, data: { status: PaymentStatus.CANCELLED } });
      return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_confirm_id: order.id });
    }
    if (order.status === PaymentStatus.PAID) {
      return this.reply(body, CLICK_ERROR.ALREADY_PAID, "Already paid");
    }

    await this.prisma.$transaction([
      this.prisma.walletTopupOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
      }),
      this.prisma.user.update({ where: { id: order.userId }, data: { balance: { increment: order.amount } } }),
      this.prisma.walletTransaction.create({
        data: { userId: order.userId, amount: order.amount, type: WalletTransactionType.TOPUP_CLICK },
      }),
    ]);

    await this.notificationsService.create(
      order.userId,
      NotificationType.WALLET_TOPUP,
      "Hamyon to'ldirildi ✅",
      `Hamyoningizga ${order.amount.toLocaleString("uz-UZ")} so'm qo'shildi.`,
      "/wallet",
    );

    return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_confirm_id: order.id });
  }

  private async completeBoostOrder(
    order: Prisma.BoostOrderGetPayload<{ include: { listing: true } }>,
    body: ClickCallbackParams,
  ) {
    if (Number(body.error) < 0) {
      await this.prisma.boostOrder.update({ where: { id: order.id }, data: { status: PaymentStatus.CANCELLED } });
      return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_confirm_id: order.id });
    }
    if (order.status === PaymentStatus.PAID) {
      return this.reply(body, CLICK_ERROR.ALREADY_PAID, "Already paid");
    }

    const days = BOOST_DAYS[order.duration];
    const currentBoostedUntil = order.listing.boostedUntil;
    const base = currentBoostedUntil && currentBoostedUntil > new Date() ? currentBoostedUntil : new Date();
    const boostedUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.boostOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
      }),
      this.prisma.listing.update({
        where: { id: order.listingId },
        data: { boostedUntil },
      }),
    ]);

    await this.notificationsService.create(
      order.userId,
      NotificationType.BOOST_PAID,
      "To'lov muvaffaqiyatli o'tdi ✅",
      `"${order.listing.title}" eloningiz ${boostedUntil.toLocaleDateString("uz-UZ")} gacha ko'tarildi.`,
      `/listings/${order.listingId}`,
    );

    if (order.listing.status === "ACTIVE") {
      await this.botService.postToChannel(order.listing);
    }

    return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_confirm_id: order.id });
  }

  private async completePlanOrder(order: PlanOrder, body: ClickCallbackParams) {
    if (Number(body.error) < 0) {
      await this.prisma.planOrder.update({ where: { id: order.id }, data: { status: PaymentStatus.CANCELLED } });
      return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_confirm_id: order.id });
    }
    if (order.status === PaymentStatus.PAID) {
      return this.reply(body, CLICK_ERROR.ALREADY_PAID, "Already paid");
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: order.userId } });
    const newLimit = Math.max(user.listingsLimit, order.listingsLimit);

    await this.prisma.$transaction([
      this.prisma.planOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: order.userId },
        data: { listingsLimit: newLimit },
      }),
    ]);

    await this.notificationsService.create(
      order.userId,
      NotificationType.PLAN_PAID,
      "To'lov muvaffaqiyatli o'tdi ✅",
      `Tarifingiz faollashtirildi. Endi ${order.listingsLimit >= 9999 ? "cheksiz" : order.listingsLimit} tagacha faol e'lon joylashingiz mumkin.`,
      "/profile",
    );

    return this.reply(body, CLICK_ERROR.SUCCESS, "Success", { merchant_confirm_id: order.id });
  }

  private reply(
    body: ClickCallbackParams,
    error: number,
    errorNote: string,
    extra: Record<string, string> = {},
  ) {
    return {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      error,
      error_note: errorNote,
      ...extra,
    };
  }
}
