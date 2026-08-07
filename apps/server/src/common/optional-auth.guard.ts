import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { verifyTelegramInitData } from "./telegram-init-data";
import { UsersService } from "../modules/users/users.service";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const initData = request.header("x-telegram-init-data");
    const botToken = this.config.get<string>("BOT_TOKEN");
    if (initData && botToken) {
      const parsed = verifyTelegramInitData(initData, botToken);
      if (parsed) {
        const referralId = request.header("x-referral-id");
        const user = await this.usersService.upsertFromTelegram(parsed.user, referralId);
        if (!user.isBlocked) {
          (request as Request & { user: typeof user }).user = user;
        }
      }
    }
    return true;
  }
}
