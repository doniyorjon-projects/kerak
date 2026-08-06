import { useQuery } from "@tanstack/react-query";
import { fetchFavorites } from "../api/favorites";

export function useFavoriteIds() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    select: (data) => new Set(data.map((l) => l.id)),
  });
}
