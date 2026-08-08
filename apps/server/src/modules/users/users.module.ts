import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { SellerProfileController } from "./seller-profile.controller";

@Module({
  controllers: [UsersController, SellerProfileController],
})
export class UsersModule {}
