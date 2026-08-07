import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bot, InlineKeyboard } from "grammy";
import { Listing, NotificationType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { SettingsService } from "../settings/settings.service";

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private readonly bot: Bot;
  private readonly adminTelegramId?: string;
  private readonly miniAppUrl: string;
  private readonly botUsername: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {
    const token = this.config.get<string>("BOT_TOKEN");
    if (!token) {
      throw new Error("BOT_TOKEN sozlanmagan (.env faylini tekshiring)");
    }
    this.bot = new Bot(token);
    this.adminTelegramId = this.config.get<string>("ADMIN_TELEGRAM_ID");
    this.miniAppUrl = this.config.get<string>("MINI_APP_URL") ?? "https://example.com";
    this.botUsername = this.config.get<string>("BOT_USERNAME") ?? "";
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

  async notifySellerModerationResult(
    telegramId: string,
    listingId: string,
    listingTitle: string,
    approved: boolean,
    reason?: string | null,
  ) {
    const keyboard = new InlineKeyboard().webApp(
      "🔍 Ko'rish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );

    const text = approved
      ? `✅ "${listingTitle}" eloningiz tasdiqlandi va endi katalogda ko'rinadi.`
      : [
          `❌ "${listingTitle}" eloningiz rad etildi.`,
          reason ? `\nSabab: ${reason}` : "",
          "\nIltimos ma'lumotlarni tekshirib qayta joylang.",
        ].join("");

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Sotuvchiga xabar yuborilmadi: ${err}`));
  }

  async notifyListingExpired(telegramId: string, listingId: string, listingTitle: string) {
    const keyboard = new InlineKeyboard().webApp(
      "🔄 Faollashtirish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );
    const text = `⏸ "${listingTitle}" eloningiz 30 kun davomida faolsiz turgani uchun avtomatik pauza qilindi.\n\nQayta faollashtirish uchun tugmani bosing.`;

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Muddati o'tgan elon xabari yuborilmadi: ${err}`));
  }

  async postToChannel(listing: Listing) {
    const settings = await this.settingsService.get();
    if (!settings.channelId) return;
    if (!this.botUsername) {
      this.logger.warn("BOT_USERNAME sozlanmagan, kanalga post qilinmadi");
      return;
    }

    const shareUrl = `https://t.me/${this.botUsername}?start=listing_${listing.id}`;
    const keyboard = new InlineKeyboard().url("🚀 Ko'rish", shareUrl);
    const priceText = listing.price != null ? `${listing.price.toLocaleString("uz-UZ")} so'm` : "Kelishilgan holda";
    const description =
      listing.description.length > 200 ? `${listing.description.slice(0, 200)}...` : listing.description;
    const caption = [
      `🆕 ${listing.title}`,
      `💰 ${priceText}`,
      listing.addressText ? `📍 ${listing.addressText}` : "",
      "",
      description,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (listing.photos[0]) {
        await this.bot.api.sendPhoto(settings.channelId, listing.photos[0], {
          caption: caption.slice(0, 1024),
          reply_markup: keyboard,
        });
      } else {
        await this.bot.api.sendMessage(settings.channelId, caption, { reply_markup: keyboard });
      }
    } catch (err) {
      this.logger.warn(`Kanalga post qilinmadi: ${err}`);
    }
  }

  async notifyAdminNewListing(listing: Listing) {
    if (!this.adminTelegramId) {
      this.logger.warn("ADMIN_TELEGRAM_ID sozlanmagan, moderatsiya xabari yuborilmadi");
      return;
    }

    const keyboard = new InlineKeyboard().webApp(
      "🔍 Ko'rib chiqish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listing.id)}`,
    );

    const text = [
      "🆕 Yangi elon moderatsiya kutmoqda",
      `Sarlavha: ${listing.title}`,
      `Narx: ${listing.price ? `${listing.price} so'm` : "Kelishilgan holda"}`,
      `Tavsif: ${listing.description}`,
      "",
      "Tasdiqlash yoki rad etish uchun tugmani bosing.",
    ].join("\n");

    await this.bot.api.sendMessage(this.adminTelegramId, text, { reply_markup: keyboard });
  }
}
