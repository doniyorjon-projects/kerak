import { Module } from "@nestjs/common";
import { SettingsModule } from "../settings/settings.module";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";

@Module({
  imports: [SettingsModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
