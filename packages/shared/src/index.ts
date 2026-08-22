export * from "./categoryAttributes";

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

export type ListingCondition = "NEW" | "USED";

export interface CategoryDto {
  id: string;
  parentId: string | null;
  nameUz: string;
  nameRu: string | null;
  type: CategoryType;
  icon: string | null;
  level: number;
  sortOrder: number;
  listingsCount: number;
}

export type SellerType = "PRIVATE" | "BUSINESS";

/** Toifaga xos xususiyat qiymati - turiga qarab string/son/mantiqiy/massiv bo'lishi mumkin. */
export type AttributeValue = string | number | boolean | string[];

export interface UserSummaryDto {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
}

export interface RatingSummaryDto {
  avg: number | null;
  count: number;
  isVerified: boolean;
}

/** "Tasdiqlangan sotuvchi" belgisi shu chegaralarga yetganda avtomatik beriladi. */
export const VERIFIED_SELLER_MIN_RATINGS = 5;
export const VERIFIED_SELLER_MIN_AVG = 4.5;

export interface MessageSendResultDto {
  delivered: boolean;
}

export interface ListingDto {
  id: string;
  title: string;
  description: string;
  brand?: string | null;
  attributes?: Record<string, AttributeValue> | null;
  price: number | null;
  previousPrice?: number | null;
  priceUsd?: number | null;
  isNegotiable: boolean;
  isFree: boolean;
  isUrgent: boolean;
  hasDelivery: boolean;
  isBargainable: boolean;
  sellerType?: SellerType | null;
  contactTelegram: boolean;
  contactName?: string | null;
  photos: string[];
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  lat: number | null;
  lng: number | null;
  phone: string;
  condition?: ListingCondition | null;
  status: ListingStatus;
  rejectionReason?: string | null;
  categoryId: string;
  createdAt: string;
  viewsCount: number;
  distanceKm?: number | null;
  boostedUntil?: string | null;
  bumpedAt?: string | null;
  seller: UserSummaryDto;
}

export interface UserBlockDto {
  id: string;
  blocked: UserSummaryDto;
  createdAt: string;
}

export type BoostDuration = "DAYS_3" | "DAYS_7" | "DAYS_30";

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

export interface PricingConfigDto {
  boostDays3: number;
  boostDays7: number;
  boostDays30: number;
  planStandard: number;
  planBusiness: number;
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
  condition?: ListingCondition;
  isFree?: boolean;
  isUrgent?: boolean;
  hasDelivery?: boolean;
  sellerType?: SellerType;
  /** Aniq moslik (select/text/boolean) - masalan { rooms: "3" }. */
  attributes?: Record<string, string>;
  /** Multiselect - qiymat massiv ichida bormi (masalan { amenities: "Lift" }). */
  attributesAny?: Record<string, string>;
  /** Number/decimal maydonlar uchun oraliq filtri (masalan { mileage: "10000" }). */
  attributesMin?: Record<string, string>;
  attributesMax?: Record<string, string>;
  limit?: number;
  offset?: number;
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
  | "REPORT_RESOLVED"
  | "LISTING_EXPIRED"
  | "NEW_RATING"
  | "PRICE_DROP"
  | "PRICE_OFFER_RECEIVED"
  | "PRICE_OFFER_RESOLVED";

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
  brand?: string | null;
  attributes?: Record<string, AttributeValue> | null;
  price: number | null;
  priceUsd?: number | null;
  isNegotiable: boolean;
  isFree?: boolean;
  isUrgent?: boolean;
  hasDelivery?: boolean;
  isBargainable?: boolean;
  sellerType?: SellerType | null;
  contactTelegram?: boolean;
  photos: string[];
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  lat: number | null;
  lng: number | null;
  phone: string;
  contactName?: string | null;
  condition?: ListingCondition | null;
}

export type RequestStatus = "ACTIVE" | "CLOSED";

export interface RequestDto {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  phone: string;
  status: RequestStatus;
  viewsCount: number;
  createdAt: string;
  author: UserSummaryDto;
}

export interface CreateRequestInput {
  categoryId: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  phone: string;
}

export interface RequestFeedQuery {
  categoryId?: string;
  regionId?: number;
  districtId?: number;
  q?: string;
}

export interface BotSettingsDto {
  channelId: string | null;
  starsRate: number;
  usdRate: number;
  telegramChannelUrl: string | null;
  supportUrl: string | null;
  anthropicApiKeySet: boolean;
  openrouterApiKeySet: boolean;
}

export interface PublicSettingsDto {
  usdRate: number;
  telegramChannelUrl: string | null;
  supportUrl: string | null;
}

export type PriceOfferStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface PriceOfferDto {
  id: string;
  listingId: string;
  amount: number;
  status: PriceOfferStatus;
  createdAt: string;
  buyer: UserSummaryDto;
}

export interface CreatePriceOfferInput {
  amount: number;
}

export interface SavedSearchDto {
  id: string;
  label: string;
  categoryId: string | null;
  regionId: number | null;
  districtId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: ListingCondition | null;
  q: string | null;
  createdAt: string;
}

export interface CreateSavedSearchInput {
  label: string;
  categoryId?: string;
  regionId?: number;
  districtId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  q?: string;
}

export type WalletTransactionType =
  | "TOPUP_CLICK"
  | "TOPUP_STARS"
  | "REFERRAL_BONUS"
  | "BOOST_PURCHASE"
  | "PLAN_PURCHASE";

export interface WalletTransactionDto {
  id: string;
  amount: number;
  type: WalletTransactionType;
  note: string | null;
  createdAt: string;
}

export interface WalletDto {
  balance: number;
  transactions: WalletTransactionDto[];
}

export const REFERRAL_BONUS_AMOUNT = 5000;

export interface WalletTopupResultDto {
  orderId: string;
  amount: number;
  paymentUrl: string;
}

export interface StarsInvoiceResultDto {
  orderId: string;
  starsAmount: number;
  invoiceLink: string;
}

export interface PriceHistoryEntryDto {
  price: number | null;
  createdAt: string;
}

export interface ListingMessageDto {
  id: string;
  fromUserId: string;
  text: string;
  createdAt: string;
}

export interface SellerProfileDto {
  id: string;
  username: string | null;
  firstName: string;
  createdAt: string;
  ratingAvg: number | null;
  ratingCount: number;
  isVerified: boolean;
  activeListingsCount: number;
}

export interface AiDescriptionResultDto {
  description: string;
}

export interface AiCategorySuggestionResultDto {
  categoryId: string | null;
}
