import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { User } from "@prisma/client";
import { BotService } from "../bot/bot.service";
import { SettingsService } from "../settings/settings.service";

const CHANNEL_BANNER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

@Controller("users")
@UseGuards(TelegramAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get("me")
  me(@CurrentUser() user: User) {
    return user;
  }

  /**
   * Foydalanuvchi kanalga a'zo emasligi va bugun banner ko'rsatilmagan
   * bo'lsagina true qaytaradi - shu bilan birga "ko'rsatildi" deb belgilaydi,
   * shuning uchun bir kunda faqat bir marta ishlaydi.
   */
  @Get("channel-banner")
  async getChannelBanner(@CurrentUser() user: User) {
    const settings = await this.settingsService.get();
    if (!settings.channelId || !settings.telegramChannelUrl) {
      return { show: false, channelUrl: null };
    }

    if (
      user.channelBannerLastShownAt &&
      Date.now() - user.channelBannerLastShownAt.getTime() < CHANNEL_BANNER_COOLDOWN_MS
    ) {
      return { show: false, channelUrl: null };
    }

    const isMember = await this.botService.checkChannelMembership(settings.channelId, user.telegramId);
    if (isMember) {
      return { show: false, channelUrl: null };
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { channelBannerLastShownAt: new Date() } });
    return { show: true, channelUrl: settings.telegramChannelUrl };
  }

  @Patch("me")
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    if (dto.phone) {
      await this.usersService.updatePhone(user.id, dto.phone);
    }
    if (dto.firstName) {
      await this.usersService.updateFirstName(user.id, dto.firstName);
    }
    if (dto.lat !== undefined && dto.lng !== undefined) {
      await this.usersService.updateLocation(user.id, dto.lat, dto.lng, dto.regionId, dto.districtId);
    }
    return this.usersService.findById(user.id);
  }
}
