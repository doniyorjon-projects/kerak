import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Bot, GrammyError, InlineKeyboard } from "grammy";
import { Listing, NotificationType, PaymentStatus, WalletTransactionType } from "@prisma/client";
import { REFERRAL_BONUS_AMOUNT } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { SettingsService } from "../settings/settings.service";
import { BlocksService } from "../blocks/blocks.service";
import { UsersService } from "../users/users.service";

/** Hamkorlik/reklama va admin bilan bog'lanish uchun ko'rsatiladigan kontakt. */
const ADMIN_CONTACT_USERNAME = "doniyorjon_k";

// Render'dagi bepul Postgres bazasi yaratilganidan 30 kun o'tib (2026-08-06 +
// 30 kun = 2026-09-05) avtomatik o'chib ketadi - shu sanadan 2 kun oldin
// adminga bir martalik eslatma yuboriladi (DigitalOcean'ga ko'chirishni
// yakunlash uchun). Sana faqat bitta kun bilan mos kelgani uchun alohida
// "yuborildimi" belgisi kerak emas - kunlik cron shu kuni bir marta ishga
// tushadi va bir marta yuboradi.
const POSTGRES_EXPIRY_REMINDER_DATE = "2026-09-03";

const CHANNEL_CAPTION_MAX_LENGTH = 1024;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** So'z o'rtasidan kesib qo'ymaslik uchun eng yaqin bo'shliqdan kesadi. */
function truncateAtWord(text: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated}...`;
}

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
    private readonly blocksService: BlocksService,
    private readonly usersService: UsersService,
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
      const requestId = payload?.startsWith("request_") ? payload.slice("request_".length) : null;
      const referralId = payload?.startsWith("ref_") ? payload.slice("ref_".length) : null;
      const page = payload?.startsWith("page_") ? payload.slice("page_".length) : null;

      if (ctx.from) {
        const result = await this.usersService.upsertFromTelegram(ctx.from, referralId ?? undefined);
        if ("referralJustCredited" in result && result.referralJustCredited) {
          await ctx.reply(
            `🎉 Xush kelibsiz! Taklif havolasi orqali qo'shilganingiz uchun hamyoningizga ${REFERRAL_BONUS_AMOUNT.toLocaleString("uz-UZ")} so'm qo'shildi.`,
          );
          await this.sendMessageTo(
            result.referrerTelegramId,
            `🎉 ${result.firstName} sizning taklifingiz orqali Kerak'ga qo'shildi! Hamyoningizga ${REFERRAL_BONUS_AMOUNT.toLocaleString("uz-UZ")} so'm qo'shildi.`,
          );
        }
      }

      const params = new URLSearchParams();
      if (listingId) params.set("listing", listingId);
      if (requestId) params.set("request", requestId);
      if (referralId) params.set("ref", referralId);
      if (page) params.set("page", page);
      const qs = params.toString();
      const appUrl = qs ? `${this.miniAppUrl}?${qs}` : this.miniAppUrl;

      const keyboard = new InlineKeyboard().webApp(
        listingId || requestId ? "🚀 Ko'rish" : page ? "🚀 Ochish" : "🚀 Hoziroq boshlash",
        appUrl,
      );
      await ctx.reply(
        listingId || requestId
          ? "Ulashilgan e'lonni ko'rish uchun tugmani bosing 👇"
          : page
            ? "Davom etish uchun tugmani bosing 👇"
            : "👋 Assalomu alaykum!\n\n" +
            "<b>Kerak</b>ga xush kelibsiz — O'zbekistondagi mahsulot va xizmatlar uchun qulay onlayn bozor.\n\n" +
            "🛍 Kerakli mahsulot yoki ustani soniyalarda toping\n" +
            "📢 O'zingiznikini bepul e'lon qilib soting\n" +
            "⭐️ Sharh va reyting orqali ishonchli tanlov qiling\n\n" +
            "Minglab foydalanuvchi Kerak orqali xarid qilmoqda va daromad topmoqda. Endi navbat sizda — pastdagi tugmani bosing 👇\n\n" +
            `<i>Hamkorlik yoki reklama uchun: @${ADMIN_CONTACT_USERNAME}</i>`,
        { reply_markup: keyboard, parse_mode: "HTML" },
      );
    });

    this.bot.on("pre_checkout_query", async (ctx) => {
      const order = await this.prisma.walletTopupOrder.findUnique({ where: { id: ctx.preCheckoutQuery.invoice_payload } });
      if (!order || order.status === PaymentStatus.PAID) {
        await ctx.answerPreCheckoutQuery(false, "Buyurtma topilmadi yoki allaqachon to'langan");
        return;
      }
      await ctx.answerPreCheckoutQuery(true);
    });

    this.bot.on("message:successful_payment", async (ctx) => {
      const payload = ctx.message.successful_payment.invoice_payload;
      const order = await this.prisma.walletTopupOrder.findUnique({ where: { id: payload } });
      if (!order || order.status === PaymentStatus.PAID) return;

      await this.prisma.$transaction([
        this.prisma.walletTopupOrder.update({
          where: { id: order.id },
          data: { status: PaymentStatus.PAID, paidAt: new Date() },
        }),
        this.prisma.user.update({ where: { id: order.userId }, data: { balance: { increment: order.amount } } }),
        this.prisma.walletTransaction.create({
          data: {
            userId: order.userId,
            amount: order.amount,
            type: WalletTransactionType.TOPUP_STARS,
            note: `${order.starsAmount} ⭐`,
          },
        }),
      ]);

      await this.notificationsService.create(
        order.userId,
        NotificationType.WALLET_TOPUP,
        "Hamyon to'ldirildi ✅",
        `Hamyoningizga ${order.amount.toLocaleString("uz-UZ")} so'm qo'shildi.`,
        "/wallet",
      );

      await ctx.reply(`✅ Hamyoningizga ${order.amount.toLocaleString("uz-UZ")} so'm qo'shildi.`);
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

      if (await this.blocksService.isBlockedEitherWay(replier.id, counterpart.id)) {
        await ctx.reply("Xabaringiz yetkazilmadi.");
        return;
      }

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

    this.bot.on("inline_query", async (ctx) => {
      const query = ctx.inlineQuery.query.trim();
      if (query.length < 2) {
        await ctx.answerInlineQuery([], { cache_time: 10 });
        return;
      }

      const listings = await this.prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const results = listings.map((listing) => {
        const url = `https://t.me/${this.botUsername}?start=listing_${listing.id}`;
        const priceText = listing.price != null ? `${listing.price.toLocaleString("uz-UZ")} so'm` : "Kelishilgan holda";
        return {
          type: "article" as const,
          id: listing.id,
          title: listing.title,
          description: priceText,
          thumbnail_url: listing.photos[0] || undefined,
          input_message_content: {
            message_text: `🔎 <b>${listing.title}</b>\n💰 ${priceText}\n\n${url}`,
            parse_mode: "HTML" as const,
          },
          reply_markup: new InlineKeyboard().url("🚀 Ko'rish", url),
        };
      });

      await ctx.answerInlineQuery(results, { cache_time: 30 });
    });
  }

  /**
   * Foydalanuvchiga xabar yuborish natijasini User.botBlockedAt maydonida
   * kuzatib boradi - admin panelda "botni bloklaganlar"ni ko'rsatish uchun.
   * Muvaffaqiyatli yuborilsa (demak hali bloklanmagan/qayta ochgan) va
   * oldin bloklangan deb belgilangan bo'lsa - tozalanadi.
   */
  private async recordSendResult(telegramId: string, err: unknown | null) {
    try {
      if (err instanceof GrammyError && err.error_code === 403 && err.description.toLowerCase().includes("blocked")) {
        await this.prisma.user.updateMany({ where: { telegramId }, data: { botBlockedAt: new Date() } });
      } else if (!err) {
        await this.prisma.user.updateMany({
          where: { telegramId, botBlockedAt: { not: null } },
          data: { botBlockedAt: null },
        });
      }
    } catch (dbErr) {
      this.logger.warn(`botBlockedAt yangilanmadi (${telegramId}): ${dbErr}`);
    }
  }

  async sendMessageTo(telegramId: string, text: string): Promise<number | null> {
    try {
      const sent = await this.bot.api.sendMessage(telegramId, text);
      void this.recordSendResult(telegramId, null);
      return sent.message_id;
    } catch (err) {
      this.logger.warn(`Xabar yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
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

  async notifyNewRating(
    telegramId: string,
    listingId: string,
    listingTitle: string,
    stars: number,
    raterName: string | null,
  ) {
    const keyboard = new InlineKeyboard().webApp(
      "🔍 Ko'rish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );

    const starsText = "⭐".repeat(stars);
    const text = raterName
      ? `${starsText} ${raterName} tomonidan "${listingTitle}" eloningizga sharh qoldirildi.`
      : `${starsText} "${listingTitle}" eloningizga anonim ravishda sharh qoldirildi.`;

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Sharh haqida xabar yuborilmadi: ${err}`));
  }

  async notifyPriceDrop(telegramId: string, listingId: string, listingTitle: string, oldPrice: number, newPrice: number) {
    const keyboard = new InlineKeyboard().webApp(
      "🔍 Ko'rish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );
    const text = `📉 "${listingTitle}" narxi tushdi!\n${oldPrice.toLocaleString("uz-UZ")} so'm → ${newPrice.toLocaleString("uz-UZ")} so'm`;

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Narx tushishi haqida xabar yuborilmadi: ${err}`));
  }

  async notifyPriceOffer(telegramId: string, listingId: string, listingTitle: string, amount: number, buyerName: string) {
    const keyboard = new InlineKeyboard().webApp(
      "🔍 Ko'rish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );
    const text = `💬 ${buyerName} "${listingTitle}" eloningizga ${amount.toLocaleString("uz-UZ")} so'm taklif qildi.`;

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Narx taklifi haqida xabar yuborilmadi: ${err}`));
  }

  async notifyPriceOfferResolved(telegramId: string, listingId: string, listingTitle: string, accepted: boolean) {
    const keyboard = new InlineKeyboard().webApp(
      "🔍 Ko'rish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );
    const text = accepted
      ? `✅ "${listingTitle}" eloniga taklif qilgan narxingiz qabul qilindi! Sotuvchi bilan bog'laning.`
      : `❌ "${listingTitle}" eloniga taklif qilgan narxingiz rad etildi.`;

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Taklif natijasi haqida xabar yuborilmadi: ${err}`));
  }

  async notifySavedSearchDigest(telegramId: string, totalMatches: number, labels: string[]) {
    const keyboard = new InlineKeyboard().webApp("🔍 Ko'rish", `${this.miniAppUrl}/saved-searches`);
    const text = `🔔 Saqlangan qidiruvlaringiz bo'yicha ${totalMatches} ta yangi e'lon topildi:\n${labels.join("\n")}`;

    await this.bot.api
      .sendMessage(telegramId, text, { reply_markup: keyboard })
      .catch((err) => this.logger.warn(`Kunlik digest yuborilmadi: ${err}`));
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

  /**
   * Foydalanuvchi berilgan kanalga a'zomi-yo'qmi tekshiradi. Buning uchun
   * bot o'sha kanalda ADMIN bo'lishi shart - aks holda Telegram API xatolik
   * qaytaradi, shu holatda "a'zo" deb hisoblaymiz (xatolik holida foydalanuvchini
   * bezovta qilmaslik xavfsizroq).
   */
  async checkChannelMembership(channelId: string, telegramId: string): Promise<boolean> {
    try {
      const member = await this.bot.api.getChatMember(channelId, Number(telegramId));
      return ["creator", "administrator", "member", "restricted"].includes(member.status);
    } catch (err) {
      this.logger.warn(`Kanal a'zoligini tekshirib bo'lmadi (${telegramId}): ${err}`);
      return true;
    }
  }

  async postToChannel(listing: Listing) {
    const settings = await this.settingsService.get();
    if (!settings.channelId) return;
    if (!this.botUsername) {
      this.logger.warn("BOT_USERNAME sozlanmagan, kanalga post qilinmadi");
      return;
    }

    const category = await this.prisma.category.findUnique({ where: { id: listing.categoryId } });

    const shareUrl = `https://t.me/${this.botUsername}?start=listing_${listing.id}`;
    const keyboard = new InlineKeyboard().url("🚀 Batafsil", shareUrl);

    const priceText = listing.isFree
      ? "🎁 Bepul"
      : listing.price != null
        ? `${listing.price.toLocaleString("uz-UZ")} so'm${listing.isNegotiable ? " (kelishiladi)" : ""}`
        : "💬 Narxi kelishiladi";

    const badges = [
      listing.isUrgent ? "⚡️ Shoshilinch" : null,
      listing.isBargainable ? "🤝 Savdolashish mumkin" : null,
      listing.hasDelivery ? "🚚 Yetkazib beriladi" : null,
      listing.sellerType === "BUSINESS" ? "🏪 Biznes" : null,
    ]
      .filter((b): b is string => b !== null)
      .join("  ·  ");

    const categoryLine = category
      ? `${category.icon ?? "📁"} ${escapeHtml(category.nameUz)}${
          listing.condition ? ` · ${listing.condition === "NEW" ? "Yangi" : "Ishlatilgan"}` : ""
        }`
      : null;

    // Sarlavha/narx/kategoriya/manzil/belgilar - HTML teglar shu qismda, shuning
    // uchun umumiy hajm 1024 belgidan oshsa faqat tavsif (oddiy matn, teglarsiz)
    // qisqartiriladi - aks holda teg o'rtasidan kesilib, Telegram xato qaytarishi
    // mumkin edi.
    const infoLines = [
      `🆕 <b>${escapeHtml(listing.title)}</b>`,
      `💰 <b>${escapeHtml(priceText)}</b>`,
      categoryLine,
      listing.addressText ? `📍 ${escapeHtml(listing.addressText)}` : null,
      badges || null,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");

    const descriptionBudget = CHANNEL_CAPTION_MAX_LENGTH - infoLines.length - 2;
    const descriptionText = truncateAtWord(escapeHtml(listing.description), Math.min(300, descriptionBudget));
    const caption = [infoLines, descriptionText].filter(Boolean).join("\n\n");

    try {
      if (listing.photos[0]) {
        await this.bot.api.sendPhoto(settings.channelId, listing.photos[0], {
          caption,
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
      } else {
        await this.bot.api.sendMessage(settings.channelId, caption, { parse_mode: "HTML", reply_markup: keyboard });
      }
    } catch (err) {
      this.logger.warn(`Kanalga post qilinmadi: ${err}`);
    }
  }

  async createStarsInvoiceLink(
    orderId: string,
    title: string,
    description: string,
    starsAmount: number,
  ): Promise<string> {
    return this.bot.api.createInvoiceLink(
      title,
      description,
      orderId,
      "",
      "XTR",
      [{ label: title, amount: starsAmount }],
    );
  }

  async broadcastMessage(text: string, listingId?: string): Promise<{ sent: number; failed: number }> {
    const users = await this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { telegramId: true },
    });

    const keyboard = listingId
      ? new InlineKeyboard().webApp("🔍 Ko'rish", `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`)
      : new InlineKeyboard().webApp("🚀 Kerak'ni ochish", this.miniAppUrl);

    let sent = 0;
    let failed = 0;
    for (const user of users) {
      try {
        await this.bot.api.sendMessage(user.telegramId, text, { reply_markup: keyboard });
        sent += 1;
        void this.recordSendResult(user.telegramId, null);
      } catch (err) {
        failed += 1;
        this.logger.warn(`Ommaviy xabar yuborilmadi (${user.telegramId}): ${err}`);
        void this.recordSendResult(user.telegramId, err);
      }
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    return { sent, failed };
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

  /**
   * Admin panel orqali chaqiriladi - hozirgi barcha foydalanuvchilarga
   * referal taklifnomasini darhol yuboradi (test/bir martalik e'lon
   * sifatida), keyin esa har birini "yuborilgan" deb belgilaydi - shundan
   * keyin faqat YANGI ro'yxatdan o'tadiganlar odatdagi 15 daqiqalik oqim
   * bo'yicha xabar oladi.
   */
  async broadcastReferralPromptNow(): Promise<{ sent: number; failed: number }> {
    const users = await this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { id: true, telegramId: true },
    });

    let sent = 0;
    let failed = 0;
    for (const user of users) {
      const ok = await this.sendReferralPrompt(user.telegramId, user.id);
      if (ok) sent += 1;
      else failed += 1;
      await this.prisma.user.update({ where: { id: user.id }, data: { referralPromptSent: true } });
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    return { sent, failed };
  }

  /**
   * Har bir foydalanuvchiga botga birinchi marta start bosganidan 15 daqiqa
   * o'tgach, referal dasturi haqida bir martalik xabar yuboradi. Vaqt bo'yicha
   * so'rov (in-memory setTimeout emas) ishlatiladi, chunki server istalgan
   * vaqt qayta ishga tushishi mumkin - shunda ham hech kim urib qolmaydi.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendPendingReferralPrompts() {
    const threshold = new Date(Date.now() - 15 * 60 * 1000);
    const pending = await this.prisma.user.findMany({
      where: { referralPromptSent: false, createdAt: { lte: threshold } },
      select: { id: true, telegramId: true },
      take: 200,
    });

    for (const user of pending) {
      await this.sendReferralPrompt(user.telegramId, user.id);
      await this.prisma.user.update({ where: { id: user.id }, data: { referralPromptSent: true } });
    }
  }

  private async sendReferralPrompt(telegramId: string, userId: string): Promise<boolean> {
    const bonus = REFERRAL_BONUS_AMOUNT.toLocaleString("uz-UZ");
    const text = [
      "🎁 Do'stlaringizni taklif qiling va bonus qo'lga kiriting!",
      "",
      `Havolangizni do'stlaringizga yuboring - botga birinchi marta start bosgan har bir do'stingiz uchun hamyoningizga ${bonus} so'm tushadi, do'stingizning hamyoniga ham ${bonus} so'm qo'shiladi.`,
      "",
      "Yig'ilgan bonus pulingiz bilan e'lonlaringizni ko'tarishingiz (TOP qilib chiqarish) yoki tarifingizni oshirib ko'proq e'lon joylashingiz mumkin.",
      "",
      "Havolangizni olish uchun pastdagi tugmani bosing 👇",
    ].join("\n");

    const keyboard = new InlineKeyboard().webApp("💰 Havolamni olish", `${this.miniAppUrl}?page=wallet`);

    try {
      await this.bot.api.sendMessage(telegramId, text, { reply_markup: keyboard });
      void this.recordSendResult(telegramId, null);
      return true;
    } catch (err) {
      this.logger.warn(`Referal taklifnomasi yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
      return false;
    }
  }

  /**
   * Hali birorta e'lon joylamagan foydalanuvchilarga ro'yxatdan o'tganidan
   * 2 kun o'tgach birinchi e'lon joylashga undovchi bir martalik xabar.
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendNeverPostedPrompts() {
    const threshold = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const candidates = await this.prisma.user.findMany({
      where: {
        neverPostedPromptSent: false,
        isBlocked: false,
        botBlockedAt: null,
        createdAt: { lte: threshold },
        listings: { none: {} },
      },
      select: { id: true, telegramId: true },
      take: 200,
    });

    for (const user of candidates) {
      await this.sendNeverPostedPrompt(user.telegramId);
      await this.prisma.user.update({ where: { id: user.id }, data: { neverPostedPromptSent: true } });
    }
  }

  private async sendNeverPostedPrompt(telegramId: string) {
    const text = [
      "👀 Hali birorta e'lon joylamadingiz.",
      "",
      "Kerak'da e'lon joylash bepul va bir necha soniya vaqt oladi - sotmoqchi bo'lgan narsangiz yoki xizmatingiz haqida hoziroq e'lon joylang.",
    ].join("\n");
    const keyboard = new InlineKeyboard().webApp("📢 E'lon joylash", `${this.miniAppUrl}?page=create`);
    try {
      await this.bot.api.sendMessage(telegramId, text, { reply_markup: keyboard });
      void this.recordSendResult(telegramId, null);
    } catch (err) {
      this.logger.warn(`Birinchi e'lon taklifi yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
    }
  }

  /**
   * E'lon 3+ kundan beri faol, lekin ko'rishlar soni past bo'lsa va hozir
   * ko'tarilmagan bo'lsa - uni ko'tarishni taklif qiluvchi bir martalik xabar.
   */
  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async sendLowViewBoostPrompts() {
    const threshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const candidates = await this.prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        boostPromptSentAt: null,
        createdAt: { lte: threshold },
        viewsCount: { lt: 5 },
        OR: [{ boostedUntil: null }, { boostedUntil: { lt: now } }],
        seller: { isBlocked: false, botBlockedAt: null },
      },
      select: { id: true, title: true, seller: { select: { telegramId: true } } },
      take: 200,
    });

    for (const listing of candidates) {
      await this.sendLowViewBoostPrompt(listing.seller.telegramId, listing.id, listing.title);
      await this.prisma.listing.update({ where: { id: listing.id }, data: { boostPromptSentAt: new Date() } });
    }
  }

  private async sendLowViewBoostPrompt(telegramId: string, listingId: string, title: string) {
    const keyboard = new InlineKeyboard().webApp(
      "🚀 Ko'tarish",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );
    const text = `👁 "${title}" eloningiz hali kam ko'rilmoqda.\n\nKo'proq xaridor topish uchun e'loningizni ko'tarib (TOP qilib) chiqarishingiz mumkin.`;
    try {
      await this.bot.api.sendMessage(telegramId, text, { reply_markup: keyboard });
      void this.recordSendResult(telegramId, null);
    } catch (err) {
      this.logger.warn(`Ko'tarish taklifi yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
    }
  }

  /**
   * E'lon uzoq vaqt (30+ kun) sotilmagan holda faol tursa - narxini
   * yangilash yoki holatini belgilashni eslatuvchi bir martalik xabar.
   */
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async sendStaleListingPrompts() {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const candidates = await this.prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        staleReminderSentAt: null,
        createdAt: { lte: threshold },
        seller: { isBlocked: false, botBlockedAt: null },
      },
      select: { id: true, title: true, seller: { select: { telegramId: true } } },
      take: 200,
    });

    for (const listing of candidates) {
      await this.sendStaleListingPrompt(listing.seller.telegramId, listing.id, listing.title);
      await this.prisma.listing.update({ where: { id: listing.id }, data: { staleReminderSentAt: new Date() } });
    }
  }

  private async sendStaleListingPrompt(telegramId: string, listingId: string, title: string) {
    const keyboard = new InlineKeyboard().webApp(
      "✏️ Yangilash",
      `${this.miniAppUrl}?listing=${encodeURIComponent(listingId)}`,
    );
    const text = `⏳ "${title}" eloningiz bir oydan beri sotilmay turibdi.\n\nNarxini tushirib yoki ma'lumotlarini yangilab ko'ring - bu ko'proq xaridor topishga yordam beradi. Agar allaqachon sotilgan bo'lsa, uni "Sotildi" deb belgilashni unutmang.`;
    try {
      await this.bot.api.sendMessage(telegramId, text, { reply_markup: keyboard });
      void this.recordSendResult(telegramId, null);
    } catch (err) {
      this.logger.warn(`Eski elon eslatmasi yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
    }
  }

  /**
   * 14+ kun botga kirmagan foydalanuvchilarni qaytarish uchun xabar. Agar
   * foydalanuvchi hududida u yo'q bo'lgan davrda yangi e'lon qo'shilmagan
   * bo'lsa, butun sayt bo'yicha sonini ko'rsatadi. Har 30 kunda bir marta
   * qayta yuborilishi mumkin (bir martalik emas).
   */
  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async sendInactivityWinBackPrompts() {
    const inactiveThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const resendThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const candidates = await this.prisma.user.findMany({
      where: {
        isBlocked: false,
        botBlockedAt: null,
        lastSeenAt: { lte: inactiveThreshold },
        OR: [{ inactivityPromptSentAt: null }, { inactivityPromptSentAt: { lte: resendThreshold } }],
      },
      select: { id: true, telegramId: true, regionId: true, lastSeenAt: true },
      take: 200,
    });

    for (const user of candidates) {
      const since = user.lastSeenAt ?? inactiveThreshold;
      let count = user.regionId
        ? await this.prisma.listing.count({
            where: { status: "ACTIVE", regionId: user.regionId, createdAt: { gte: since } },
          })
        : 0;
      const isRegional = user.regionId != null && count > 0;
      if (!isRegional) {
        count = await this.prisma.listing.count({ where: { status: "ACTIVE", createdAt: { gte: since } } });
      }
      await this.sendInactivityPrompt(user.telegramId, count, isRegional);
      await this.prisma.user.update({ where: { id: user.id }, data: { inactivityPromptSentAt: new Date() } });
    }
  }

  private async sendInactivityPrompt(telegramId: string, newListingsCount: number, isRegional: boolean) {
    const scopeText = isRegional ? "hududingizda" : "Kerak'da";
    const text =
      newListingsCount > 0
        ? `😊 Sizni sog'indik! Siz yo'q vaqtingizda ${scopeText} ${newListingsCount} ta yangi e'lon qo'shildi.\n\nQaytib kirib ko'ring 👇`
        : "😊 Sizni sog'indik! Kerak'da yangi e'lonlar va imkoniyatlar sizni kutmoqda.\n\nQaytib kirib ko'ring 👇";
    const keyboard = new InlineKeyboard().webApp("🔍 Ko'rish", this.miniAppUrl);
    try {
      await this.bot.api.sendMessage(telegramId, text, { reply_markup: keyboard });
      void this.recordSendResult(telegramId, null);
    } catch (err) {
      this.logger.warn(`Qaytarish xabari yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
    }
  }

  /**
   * Hamyonida musbat balans bo'lgan, lekin uzoq vaqt (14+ kun) hech qanday
   * hamyon operatsiyasi qilmagan foydalanuvchilarga balansni qanday
   * ishlatish mumkinligini eslatadi. Har 30 kunda bir marta qayta yuboriladi.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async sendWalletReminderPrompts() {
    const resendThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const spendThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const candidates = await this.prisma.user.findMany({
      where: {
        isBlocked: false,
        botBlockedAt: null,
        balance: { gt: 0 },
        OR: [{ walletPromptSentAt: null }, { walletPromptSentAt: { lte: resendThreshold } }],
      },
      select: {
        id: true,
        telegramId: true,
        balance: true,
        walletTransactions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
      take: 200,
    });

    for (const user of candidates) {
      const lastTxAt = user.walletTransactions[0]?.createdAt;
      if (lastTxAt && lastTxAt > spendThreshold) continue;
      await this.sendWalletReminderPrompt(user.telegramId, user.balance);
      await this.prisma.user.update({ where: { id: user.id }, data: { walletPromptSentAt: new Date() } });
    }
  }

  private async sendWalletReminderPrompt(telegramId: string, balance: number) {
    const text = [
      `💰 Hamyoningizda ${balance.toLocaleString("uz-UZ")} so'm bor.`,
      "",
      "Bu pul bilan e'lonlaringizni ko'tarishingiz (TOP qilib chiqarish) yoki tarifingizni oshirib ko'proq e'lon joylashingiz mumkin.",
    ].join("\n");
    const keyboard = new InlineKeyboard().webApp("💳 Hamyonni ochish", `${this.miniAppUrl}?page=wallet`);
    try {
      await this.bot.api.sendMessage(telegramId, text, { reply_markup: keyboard });
      void this.recordSendResult(telegramId, null);
    } catch (err) {
      this.logger.warn(`Hamyon eslatmasi yuborilmadi (${telegramId}): ${err}`);
      void this.recordSendResult(telegramId, err);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPostgresExpiryReminder() {
    if (!this.adminTelegramId) return;
    const today = new Date().toISOString().slice(0, 10);
    if (today !== POSTGRES_EXPIRY_REMINDER_DATE) return;

    const text = [
      "⚠️ Eslatma: Render'dagi bepul Postgres bazangiz 2026-09-05 kuni (yaratilganidan 30 kun o'tib) avtomatik o'chib ketadi.",
      "",
      "DigitalOcean'ga ko'chirishni shu sanaga qadar yakunlab qo'yish kerak, aks holda bazadagi barcha ma'lumot yo'qoladi.",
    ].join("\n");

    await this.bot.api
      .sendMessage(this.adminTelegramId, text)
      .catch((err) => this.logger.warn(`Postgres eslatmasi yuborilmadi: ${err}`));
  }
}
