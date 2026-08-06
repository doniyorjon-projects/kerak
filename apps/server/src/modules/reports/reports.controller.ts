import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";

@Controller("listings/:listingId/reports")
@UseGuards(TelegramAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(
    @Param("listingId") listingId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(user.id, listingId, dto.reason);
  }
}
