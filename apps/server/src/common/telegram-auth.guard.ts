import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { verifyTelegramInitData } from "./telegram-init-data";
import { UsersService } from "../modules/users/users.service";

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const initData = request.header("x-telegram-init-data");
    if (!initData) {
      throw new UnauthorizedException("x-telegram-init-data header topilmadi");
    }

    const botToken = this.config.get<string>("BOT_TOKEN");
    if (!botToken) {
      throw new UnauthorizedException("Server BOT_TOKEN sozlanmagan");
    }

    const parsed = verifyTelegramInitData(initData, botToken);
    if (!parsed) {
      throw new UnauthorizedException("initData imzosi noto'g'ri");
    }

    const user = await this.usersService.upsertFromTelegram(parsed.user);
    if (user.isBlocked) {
      throw new UnauthorizedException("Foydalanuvchi bloklangan");
    }

    (request as Request & { user: typeof user }).user = user;
    return true;
  }
}
