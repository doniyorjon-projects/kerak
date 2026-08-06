import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";

export interface ClickCallbackParams {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string;
  amount: string;
  action: string;
  error: string;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

/**
 * Click Merchant API v2 (Prepare/Complete webhook) uchun imzo va to'lov havolasi.
 * Hujjat: https://docs.click.uz/click-api-request/
 */
@Injectable()
export class ClickService {
  constructor(private readonly config: ConfigService) {}

  private get serviceId(): string {
    return this.config.get<string>("CLICK_SERVICE_ID") ?? "";
  }

  private get merchantId(): string {
    return this.config.get<string>("CLICK_MERCHANT_ID") ?? "";
  }

  private get secretKey(): string {
    return this.config.get<string>("CLICK_SECRET_KEY") ?? "";
  }

  buildPaymentUrl(orderId: string, amount: number): string {
    const returnUrl = this.config.get<string>("MINI_APP_URL") ?? "";
    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: amount.toFixed(2),
      transaction_param: orderId,
      return_url: returnUrl,
    });
    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

  verifySignature(params: ClickCallbackParams): boolean {
    const isComplete = params.action === "1";
    const parts = [
      params.click_trans_id,
      params.service_id,
      this.secretKey,
      params.merchant_trans_id,
      ...(isComplete ? [params.merchant_prepare_id ?? ""] : []),
      params.amount,
      params.action,
      params.sign_time,
    ];
    const expected = createHash("md5").update(parts.join("")).digest("hex");
    return expected === params.sign_string;
  }
}
