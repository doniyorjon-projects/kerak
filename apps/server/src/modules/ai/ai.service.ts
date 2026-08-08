import { ForbiddenException, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { FREE_LISTINGS_LIMIT } from "@kerak/shared";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async generateDescription(user: User, title: string, categoryName?: string, draft?: string): Promise<string> {
    if (user.listingsLimit <= FREE_LISTINGS_LIMIT) {
      throw new ForbiddenException("Bu funksiya faqat pullik tarif egalari uchun mavjud");
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
}
