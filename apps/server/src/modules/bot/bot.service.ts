import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bot, InlineKeyboard } from "grammy";
import { Listing, ListingStatus, NotificationType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private readonly bot: Bot;
  private readonly adminTelegramId?: string;
  private readonly miniAppUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {
    const token = this.config.get<string>("BOT_TOKEN");
    if (!token) {
      throw new Error("BOT_TOKEN sozlanmagan (.env faylini tekshiring)");
    }
    this.bot = new Bot(token);
    this.adminTelegramId = this.config.get<string>("ADMIN_TELEGRAM_ID");
    this.miniAppUrl = this.config.get<string>("MINI_APP_URL") ?? "https://example.com";
    this.registerHandlers();
  }

  async onModuleInit() {
    void this.bot.start().catch((err) => this.logger.error("Bot to'xtadi", err));
  }

  private registerHandlers() {
    this.bot.command("start", async (ctx) => {
      const payload = ctx.match?.toString().trim();
      const listingId = payload?.startsWith("listing_") ? payload.slice("listing_".length) : null;
      const appUrl = listingId
        ? `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`
        : this.miniAppUrl;

      const keyboard = new InlineKeyboard().webApp(
        listingId ? "🚀 Elonni ko'rish" : "🚀 Kerak'ni ochish",
        appUrl,
      );
      await ctx.reply(
        listingId
          ? "Ulashilgan elonni ko'rish uchun tugmani bosing 👇"
          : "Kerak'ga xush kelibsiz!\n\nBu yerda xizmat va mahsulotlarni topishingiz yoki o'zingiznikini joylashingiz mumkin.",
        { reply_markup: keyboard },
      );
    });

    this.bot.on("callback_query:data", async (ctx) => {
      const data = ctx.callbackQuery.data;
      const [action, listingId] = data.split(":");
      if (action !== "approve" && action !== "reject") return;

      if (String(ctx.from.id) !== this.adminTelegramId) {
        await ctx.answerCallbackQuery({ text: "Faqat admin uchun", show_alert: true });
        return;
      }

      const status = action === "approve" ? ListingStatus.ACTIVE : ListingStatus.REJECTED;
      const listing = await this.prisma.listing.update({
        where: { id: listingId },
        data: { status },
        include: { seller: true },
      });

      await ctx.answerCallbackQuery({ text: action === "approve" ? "Tasdiqlandi ✅" : "Rad etildi ❌" });
      await ctx.editMessageText(
        `${ctx.callbackQuery.message?.text ?? ""}\n\n${action === "approve" ? "✅ Tasdiqlandi" : "❌ Rad etildi"}`,
      );

      await this.bot.api
        .sendMessage(
          listing.seller.telegramId,
          action === "approve"
            ? `"${listing.title}" eloningiz tasdiqlandi va endi katalogda ko'rinadi.`
            : `"${listing.title}" eloningiz rad etildi. Iltimos ma'lumotlarni tekshirib qayta joylang.`,
        )
        .catch((err) => this.logger.warn(`Sotuvchiga xabar yuborilmadi: ${err}`));

      await this.notificationsService.create(
        listing.sellerId,
        action === "approve" ? NotificationType.LISTING_APPROVED : NotificationType.LISTING_REJECTED,
        action === "approve" ? "Elon tasdiqlandi ✅" : "Elon rad etildi ❌",
        action === "approve"
          ? `"${listing.title}" eloningiz tasdiqlandi va endi katalogda ko'rinadi.`
          : `"${listing.title}" eloningiz rad etildi. Iltimos ma'lumotlarni tekshirib qayta joylang.`,
        `/listings/${listing.id}`,
      );
    });

    this.bot.on("message:text", async (ctx) => {
      const replyTo = ctx.message.reply_to_message;
      if (!replyTo) return;

      const original = await this.prisma.message.findFirst({
        where: { telegramMessageId: replyTo.message_id },
        include: { fromUser: true, toUser: true, listing: true },
      });
      if (!original || original.toUser.telegramId !== String(ctx.from.id)) return;

      const replier = original.toUser;
      const counterpart = original.fromUser;

      const sentMessageId = await this.sendMessageTo(
        counterpart.telegramId,
        `↩️ ${replier.username ? `@${replier.username}` : replier.firstName} javob berdi ("${original.listing.title}"):\n\n${ctx.message.text}\n\n— Javob berish uchun shu xabarga reply qiling.`,
      );

      await this.prisma.message.create({
        data: {
          listingId: original.listingId,
          fromUserId: replier.id,
          toUserId: counterpart.id,
          text: ctx.message.text,
          telegramMessageId: sentMessageId ?? undefined,
        },
      });

      await this.notificationsService.create(
        counterpart.id,
        NotificationType.NEW_MESSAGE,
        "Yangi xabar",
        `${replier.username ? `@${replier.username}` : replier.firstName}: ${ctx.message.text}`,
        `/listings/${original.listingId}`,
      );

      await ctx.reply(
        sentMessageId
          ? "Xabaringiz yuborildi ✅"
          : "Xabaringiz yetkazilmadi — foydalanuvchi botni hali ishga tushirmagan.",
      );
    });
  }

  async sendMessageTo(telegramId: string, text: string): Promise<number | null> {
    try {
      const sent = await this.bot.api.sendMessage(telegramId, text);
      return sent.message_id;
    } catch (err) {
      this.logger.warn(`Xabar yuborilmadi (${telegramId}): ${err}`);
      return null;
    }
  }

  async relayNewMessage(params: {
    listingTitle: string;
    fromUser: { firstName: string; username: string | null };
    toTelegramId: string;
    text: string;
  }): Promise<number | null> {
    const fromLabel = params.fromUser.username ? `@${params.fromUser.username}` : params.fromUser.firstName;
    return this.sendMessageTo(
      params.toTelegramId,
      `📩 Yangi xabar ("${params.listingTitle}")\nKimdan: ${fromLabel}\n\n${params.text}\n\n— Javob berish uchun shu xabarga reply qiling.`,
    );
  }

  async notifyAdminNewListing(listing: Listing) {
    if (!this.adminTelegramId) {
      this.logger.warn("ADMIN_TELEGRAM_ID sozlanmagan, moderatsiya xabari yuborilmadi");
      return;
    }

    const keyboard = new InlineKeyboard()
      .text("✅ Tasdiqlash", `approve:${listing.id}`)
      .text("❌ Rad etish", `reject:${listing.id}`);

    const text = [
      "🆕 Yangi elon moderatsiya kutmoqda",
      `Sarlavha: ${listing.title}`,
      `Narx: ${listing.price ? `${listing.price} so'm` : "Kelishilgan holda"}`,
      `Tavsif: ${listing.description}`,
    ].join("\n");

    await this.bot.api.sendMessage(this.adminTelegramId, text, { reply_markup: keyboard });
  }
}
