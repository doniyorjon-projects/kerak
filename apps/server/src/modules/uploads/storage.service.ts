import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>("R2_ACCOUNT_ID");
    this.bucket = this.config.get<string>("R2_BUCKET_NAME") ?? "";
    this.publicUrl = (this.config.get<string>("R2_PUBLIC_URL") ?? "").replace(/\/$/, "");

    this.s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.get<string>("R2_ACCESS_KEY_ID") ?? "",
        secretAccessKey: this.config.get<string>("R2_SECRET_ACCESS_KEY") ?? "",
      },
    });
  }

  async upload(buffer: Buffer, mimeType: string, originalName: string): Promise<string> {
    const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
    const key = `${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }
}
