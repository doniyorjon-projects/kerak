import { ForbiddenException, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { UNLIMITED_LISTINGS } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateDescription(user: User, title: string, categoryName?: string, draft?: string): Promise<string> {
    if (user.listingsLimit < UNLIMITED_LISTINGS) {
      throw new ForbiddenException("Bu funksiya faqat Biznes tarif egalari uchun mavjud");
    }

    const apiKey = this.config.get<string>("ANTHROPIC_API_KEY");
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

  async suggestCategory(title: string): Promise<string | null> {
    const apiKey = this.config.get<string>("ANTHROPIC_API_KEY");
    if (!apiKey) return null;

    const leafCategories = await this.prisma.category.findMany({
      where: { parentId: { not: null } },
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
    const answer = data.content?.find((block) => block.type === "text")?.text?.trim();
    if (!answer) return null;

    const validIds = new Set(leafCategories.map((c) => c.id));
    return validIds.has(answer) ? answer : null;
  }
}
