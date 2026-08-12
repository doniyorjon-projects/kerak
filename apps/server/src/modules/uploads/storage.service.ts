import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export interface StorageUsage {
  usedBytes: number;
  objectCount: number;
}

const USAGE_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private usageCache: (StorageUsage & { fetchedAt: number }) | null = null;

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

  /**
   * Butun bucket bo'yicha ishlatilgan hajmni hisoblaydi (R2'da to'g'ridan-to'g'ri
   * "kvota" tushunchasi yo'q, shuning uchun barcha obyektlarni sanab chiqamiz).
   * Har safar so'ralganda butun bucketni ro'yxatlash qimmat bo'lgani uchun
   * natija bir necha daqiqaga keshlanadi.
   */
  async getUsage(): Promise<StorageUsage> {
    if (this.usageCache && Date.now() - this.usageCache.fetchedAt < USAGE_CACHE_TTL_MS) {
      return this.usageCache;
    }

    let usedBytes = 0;
    let objectCount = 0;
    let continuationToken: string | undefined;
    do {
      const res = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, ContinuationToken: continuationToken }),
      );
      for (const obj of res.Contents ?? []) {
        usedBytes += obj.Size ?? 0;
        objectCount += 1;
      }
      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    this.usageCache = { usedBytes, objectCount, fetchedAt: Date.now() };
    return { usedBytes, objectCount };
  }
}
