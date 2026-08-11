import type { ListingDto } from "@kerak/shared";
import type { DisplayCurrency } from "../contexts/DisplayCurrencyContext";

type PriceFields = Pick<ListingDto, "price" | "priceUsd" | "isNegotiable"> & { isFree?: boolean };

/**
 * "NATIVE" rejimida har bir e'lon o'zi joylashtirilgan valyutada
 * (so'm yoki dollar) ko'rsatiladi. Foydalanuvchi almashtirsa ("UZS"/"USD"),
 * barcha e'lonlar joriy dollar kursi bo'yicha shu valyutaga o'giriladi.
 */
export function formatListingPrice(
  listing: PriceFields,
  usdRate: number,
  displayCurrency: DisplayCurrency,
  negotiableLabel: string,
  somLabel: string,
  freeLabel?: string,
): string {
  if (listing.isFree) return freeLabel ?? negotiableLabel;
  if (listing.isNegotiable || listing.price == null) return negotiableLabel;

  const isNativeUsd = listing.priceUsd != null;
  const showUsd = displayCurrency === "USD" || (displayCurrency === "NATIVE" && isNativeUsd);

  if (showUsd) {
    const usdAmount = listing.priceUsd ?? listing.price / usdRate;
    return `$${usdAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }

  return `${listing.price.toLocaleString("uz-UZ")} ${somLabel}`;
}
