import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { User } from "@prisma/client";

@Controller("users")
@UseGuards(TelegramAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: User) {
    return user;
  }

  @Patch("me")
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    if (dto.phone) {
      await this.usersService.updatePhone(user.id, dto.phone);
    }
    if (dto.lat !== undefined && dto.lng !== undefined) {
      await this.usersService.updateLocation(user.id, dto.lat, dto.lng);
    }
    return this.usersService.findById(user.id);
  }
}
