import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("sellers")
export class SellerProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":sellerId")
  getProfile(@Param("sellerId") sellerId: string) {
    return this.usersService.getSellerProfile(sellerId);
  }

  @Get(":sellerId/listings")
  getListings(@Param("sellerId") sellerId: string) {
    return this.usersService.getSellerListings(sellerId);
  }
}
