import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { User } from "@prisma/client";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    if (!request.user?.isAdmin) {
      throw new ForbiddenException("Faqat admin uchun");
    }
    return true;
  }
}
