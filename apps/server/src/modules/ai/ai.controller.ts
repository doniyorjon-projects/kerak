import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import type { AiDescriptionResultDto } from "@kerak/shared";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { AiService } from "./ai.service";
import { GenerateDescriptionDto } from "./dto/generate-description.dto";

@Controller("ai")
@UseGuards(TelegramAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("description")
  async generateDescription(
    @CurrentUser() user: User,
    @Body() dto: GenerateDescriptionDto,
  ): Promise<AiDescriptionResultDto> {
    const description = await this.aiService.generateDescription(user, dto.title, dto.categoryName, dto.draft);
    return { description };
  }
}
