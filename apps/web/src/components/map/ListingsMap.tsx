import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ListingDto } from "@kerak/shared";
import { listingMarkerIcon, myLocationMarkerIcon } from "./markerIcons";

interface ListingsMapProps {
  listings: ListingDto[];
  myLocation?: { lat: number; lng: number } | null;
  heightClassName?: string;
  zoom?: number;
  interactive?: boolean;
}

const TASHKENT_CENTER: [number, number] = [41.311081, 69.240562];

function formatPrice(listing: ListingDto): string {
  if (listing.isNegotiable || listing.price == null) return "Kelishilgan holda";
  return `${listing.price.toLocaleString("uz-UZ")} so'm`;
}

export function ListingsMap({
  listings,
  myLocation,
  heightClassName = "h-[60vh]",
  zoom = 12,
  interactive = true,
}: ListingsMapProps) {
  const navigate = useNavigate();
  const pinned = listings.filter((l): l is ListingDto & { lat: number; lng: number } => l.lat != null && l.lng != null);

  const center: [number, number] = myLocation
    ? [myLocation.lat, myLocation.lng]
    : pinned[0]
      ? [pinned[0].lat, pinned[0].lng]
      : TASHKENT_CENTER;

  return (
    <div className={`isolate w-full overflow-hidden rounded-2xl border border-divider shadow-soft ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        zoomControl={interactive}
        attributionControl={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lng]} icon={myLocationMarkerIcon} />
        )}
        {pinned.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={listingMarkerIcon}
            eventHandlers={interactive ? { click: () => navigate(`/listings/${listing.id}`) } : {}}
          >
            {interactive && (
              <Popup>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{listing.title}</span>
                  <span className="text-brand">{formatPrice(listing)}</span>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
