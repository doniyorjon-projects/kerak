import { IsEnum } from "class-validator";
import { ContactEventType } from "@prisma/client";

export class ContactEventDto {
  @IsEnum(ContactEventType)
  type!: ContactEventType;
}
