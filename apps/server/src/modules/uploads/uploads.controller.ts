import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { StorageService } from "./storage.service";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller("uploads")
@UseGuards(TelegramAuthGuard)
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException("Faqat JPEG, PNG yoki WEBP rasm yuklash mumkin"), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.upload(file.buffer, file.mimetype, file.originalname);
    return { url };
  }
}
