import { Controller, Get } from "@nestjs/common";
import type { PublicSettingsDto } from "@kerak/shared";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("public")
  async getPublic(): Promise<PublicSettingsDto> {
    const settings = await this.settingsService.get();
    return { usdRate: settings.usdRate };
  }
}
