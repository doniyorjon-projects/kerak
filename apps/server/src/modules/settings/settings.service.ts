import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";

interface CbuRateEntry {
  Ccy: string;
  Rate: string;
}

/**
 * Dollar kursi endi admin tomonidan qo'lda emas, O'zbekiston Respublikasi
 * Markaziy banki (cbu.uz) rasmiy API'sidan avtomatik olinadi va davriy
 * yangilanadi.
 */
const CBU_USD_RATE_URL = "https://cbu.uz/en/arkhiv-kursov-valyut/json/USD/";

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.botSettings.findFirst();
    if (existing) return existing;
    return this.prisma.botSettings.create({ data: {} });
  }

  async updateChannel(channelId: string | null) {
    const settings = await this.get();
    return this.prisma.botSettings.update({
      where: { id: settings.id },
      data: { channelId: channelId?.trim() || null },
    });
  }

  async updateStarsRate(starsRate: number) {
    const settings = await this.get();
    return this.prisma.botSettings.update({ where: { id: settings.id }, data: { starsRate } });
  }

  async updateTelegramChannelUrl(telegramChannelUrl: string | null) {
    const settings = await this.get();
    return this.prisma.botSettings.update({
      where: { id: settings.id },
      data: { telegramChannelUrl: telegramChannelUrl?.trim() || null },
    });
  }

  async updateSupportUrl(supportUrl: string | null) {
    const settings = await this.get();
    return this.prisma.botSettings.update({
      where: { id: settings.id },
      data: { supportUrl: supportUrl?.trim() || null },
    });
  }

  async updateAnthropicApiKey(apiKey: string) {
    const settings = await this.get();
    return this.prisma.botSettings.update({
      where: { id: settings.id },
      data: { anthropicApiKey: apiKey.trim() },
    });
  }

  async getAnthropicApiKey(): Promise<string | null> {
    const settings = await this.get();
    return settings.anthropicApiKey;
  }

  async updateOpenrouterApiKey(apiKey: string) {
    const settings = await this.get();
    return this.prisma.botSettings.update({
      where: { id: settings.id },
      data: { openrouterApiKey: apiKey.trim() },
    });
  }

  async getOpenrouterApiKey(): Promise<string | null> {
    const settings = await this.get();
    return settings.openrouterApiKey;
  }

  onModuleInit() {
    // Ataylab kutilmaydi (await qilinmaydi) - CBU sayti sekin yoki
    // ishlamay qolsa ham, server shu tufayli ishga tushmay qolmasligi kerak.
    void this.refreshUsdRateFromCbu();
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshUsdRateFromCbu() {
    try {
      const res = await fetch(CBU_USD_RATE_URL, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`CBU API ${res.status}`);
      const entries = (await res.json()) as CbuRateEntry[];
      const usdEntry = entries.find((e) => e.Ccy === "USD");
      const rate = usdEntry ? Math.round(Number(usdEntry.Rate)) : NaN;
      if (!usdEntry || !Number.isFinite(rate) || rate <= 0) {
        throw new Error("CBU javobida yaroqli USD kursi topilmadi");
      }

      const settings = await this.get();
      if (settings.usdRate !== rate) {
        await this.prisma.botSettings.update({ where: { id: settings.id }, data: { usdRate: rate } });
        this.logger.log(`Dollar kursi yangilandi: ${settings.usdRate} -> ${rate}`);
      }
      return rate;
    } catch (err) {
      this.logger.warn(`CBU dollar kursini olishda xatolik: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }
}
