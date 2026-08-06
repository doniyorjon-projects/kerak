export enum CategoryType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
}

export enum ListingStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  SOLD = "SOLD",
  REJECTED = "REJECTED",
}

export enum ContactEventType {
  TELEGRAM_CLICK = "TELEGRAM_CLICK",
  PHONE_CLICK = "PHONE_CLICK",
}

export interface CategoryDto {
  id: string;
  parentId: string | null;
  nameUz: string;
  type: CategoryType;
  icon: string | null;
  listingsCount: number;
}

export interface UserSummaryDto {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
}

export interface RatingSummaryDto {
  avg: number | null;
  count: number;
}

export interface MessageSendResultDto {
  delivered: boolean;
}

export interface ListingDto {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  photos: string[];
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  lat: number | null;
  lng: number | null;
  phone: string;
  status: ListingStatus;
  categoryId: string;
  createdAt: string;
  viewsCount: number;
  distanceKm?: number | null;
  boostedUntil?: string | null;
  seller: UserSummaryDto;
}

export type BoostDuration = "DAYS_3" | "DAYS_7" | "DAYS_30";

/**
 * Namuna narxlar (so'mda) - ish yuritish qarori, keyinchalik o'zgartirilishi mumkin.
 * Server va frontend ikkalasi ham shu yerdan oladi, shuning uchun ko'rsatilgan narx
 * va haqiqiy hisoblangan narx doim bir xil bo'ladi.
 */
export const BOOST_PRICING: Record<BoostDuration, number> = {
  DAYS_3: 10000,
  DAYS_7: 20000,
  DAYS_30: 50000,
};

export const BOOST_DAYS: Record<BoostDuration, number> = {
  DAYS_3: 3,
  DAYS_7: 7,
  DAYS_30: 30,
};

export type PaymentStatus = "CREATED" | "WAITING" | "PAID" | "CANCELLED";

export interface CreateBoostResultDto {
  orderId: string;
  amount: number;
  paymentUrl: string;
}

export interface BoostStatusDto {
  status: PaymentStatus;
  boostedUntil: string | null;
}

export type PlanTier = "STANDARD" | "BUSINESS";

/** E'lon joylash limitida "cheksiz"ni bildiruvchi son. */
export const UNLIMITED_LISTINGS = 9999;

export const PLAN_PRICING: Record<PlanTier, number> = {
  STANDARD: 25000,
  BUSINESS: 60000,
};

export const PLAN_LISTINGS_LIMIT: Record<PlanTier, number> = {
  STANDARD: 5,
  BUSINESS: UNLIMITED_LISTINGS,
};

export const FREE_LISTINGS_LIMIT = 1;

export interface CreatePlanOrderResultDto {
  orderId: string;
  amount: number;
  paymentUrl: string;
}

export interface PlanOrderStatusDto {
  status: PaymentStatus;
  listingsLimit: number;
}

export type FeedSort = "distance" | "newest" | "price_asc" | "price_desc";

export interface FeedQuery {
  categoryId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: FeedSort;
  q?: string;
  boostedOnly?: boolean;
  regionId?: number;
  districtId?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface BannerDto {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export type NotificationType =
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "BOOST_PAID"
  | "PLAN_PAID"
  | "NEW_MESSAGE"
  | "REPORT_RESOLVED";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateListingInput {
  categoryId: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  photos: string[];
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  lat: number | null;
  lng: number | null;
  phone: string;
}
