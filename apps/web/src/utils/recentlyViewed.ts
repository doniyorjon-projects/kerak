const STORAGE_KEY = "kerak.recentlyViewed";
const MAX_ENTRIES = 20;

export function addRecentlyViewed(listingId: string): void {
  const ids = getRecentlyViewedIds().filter((id) => id !== listingId);
  ids.unshift(listingId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ENTRIES)));
}

export function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
