import { ForbiddenException, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { UNLIMITED_LISTINGS } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
// OpenRouter'ning bepul (":free") modeli - kategoriya tanlash oddiy
// klassifikatsiya vazifasi bo'lgani uchun katta/pullik model shart emas.
// Google Gemma ko'p tilli (jumladan o'zbek tiliga yaqin) matnlarda yaxshi
// ishlashi bilan tanilgan, shu sabab tanlandi.
const OPENROUTER_MODEL = "google/gemma-4-31b-it:free";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  // Admin panelda saqlangan kalit ustunroq - shunda deploy qilmasdan
  // Renderdagi ANTHROPIC_API_KEY o'zgaruvchisiz ham yoqish/o'chirish mumkin.
  private async getApiKey(): Promise<string | undefined> {
    const dbKey = await this.settingsService.getAnthropicApiKey();
    return dbKey || this.config.get<string>("ANTHROPIC_API_KEY");
  }

  private async getOpenrouterApiKey(): Promise<string | undefined> {
    const dbKey = await this.settingsService.getOpenrouterApiKey();
    return dbKey || this.config.get<string>("OPENROUTER_API_KEY");
  }

  async generateDescription(user: User, title: string, categoryName?: string, draft?: string): Promise<string> {
    if (user.listingsLimit < UNLIMITED_LISTINGS) {
      throw new ForbiddenException("Bu funksiya faqat Biznes tarif egalari uchun mavjud");
    }

    const apiKey = await this.getApiKey();
    if (!apiKey) {
      this.logger.warn("ANTHROPIC_API_KEY sozlanmagan - AI tavsif xizmati ishlamaydi");
      throw new ServiceUnavailableException("AI xizmati hozircha sozlanmagan");
    }

    const prompt = [
      `Sarlavha: "${title}"`,
      categoryName ? `Toifa: ${categoryName}` : null,
      draft ? `Foydalanuvchining qoralamasi: "${draft}"` : null,
      "",
      "Shu ma'lumotlar asosida O'zbek tilida, marketplace uchun jozibali va ishonchli e'lon tavsifini yoz (2-4 jumla, 60-80 so'z atrofida). Faqat tavsif matnini qaytar, boshqa hech narsa yozma.",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    }).catch((err) => {
      this.logger.warn(`Anthropic API so'rovi muvaffaqiyatsiz: ${err}`);
      return null;
    });

    if (!res || !res.ok) {
      throw new ServiceUnavailableException("Tavsif yaratib bo'lmadi, birozdan keyin qayta urinib ko'ring");
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === "text")?.text?.trim();
    if (!text) {
      throw new ServiceUnavailableException("Tavsif yaratib bo'lmadi, birozdan keyin qayta urinib ko'ring");
    }

    return text;
  }

  /**
   * Avval OpenRouter'ning bepul modeli sinaladi (xarajatsiz, lekin kuniga
   * cheklangan so'rov soni bilan). U ishlamasa (kalit yo'q, limit tugagan,
   * xatolik) - Anthropic'ga tushiladi, u hali ham to'liq faol qoladi.
   */
  async suggestCategory(title: string): Promise<string | null> {
    const leafCategories = await this.prisma.category.findMany({
      where: { children: { none: {} } },
      select: { id: true, nameUz: true },
    });
    if (leafCategories.length === 0) return null;

    const categoryList = leafCategories.map((c) => `${c.id}: ${c.nameUz}`).join("\n");
    const prompt = [
      "Quyida marketplace toifalari ro'yxati (id: nomi) berilgan:",
      categoryList,
      "",
      `E'lon sarlavhasi: "${title}"`,
      "",
      "Shu sarlavhaga eng mos toifani tanla. Faqat toifaning id qiymatini qaytar, boshqa hech narsa yozma.",
      "Agar hech qaysi toifa mos kelmasa, faqat NONE deb yoz.",
    ].join("\n");

    const validIds = new Set(leafCategories.map((c) => c.id));

    const openrouterKey = await this.getOpenrouterApiKey();
    if (openrouterKey) {
      const answer = await this.suggestCategoryViaOpenRouter(prompt, openrouterKey);
      if (answer && validIds.has(answer)) return answer;
    }

    const anthropicKey = await this.getApiKey();
    if (anthropicKey) {
      const answer = await this.suggestCategoryViaAnthropic(prompt, anthropicKey);
      if (answer && validIds.has(answer)) return answer;
    }

    return null;
  }

  private async suggestCategoryViaOpenRouter(prompt: string, apiKey: string): Promise<string | null> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 20,
        messages: [{ role: "user", content: prompt }],
      }),
    }).catch((err) => {
      this.logger.warn(`OpenRouter kategoriya so'rovi muvaffaqiyatsiz: ${err}`);
      return null;
    });

    if (!res || !res.ok) return null;

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  }

  private async suggestCategoryViaAnthropic(prompt: string, apiKey: string): Promise<string | null> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 20,
        messages: [{ role: "user", content: prompt }],
      }),
    }).catch((err) => {
      this.logger.warn(`Anthropic kategoriya so'rovi muvaffaqiyatsiz: ${err}`);
      return null;
    });

    if (!res || !res.ok) return null;

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    return data.content?.find((block) => block.type === "text")?.text?.trim() ?? null;
  }
}
