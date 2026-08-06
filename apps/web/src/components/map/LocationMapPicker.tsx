import { useEffect } from "react";
import type { Marker as LeafletMarker } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { myLocationMarkerIcon } from "./markerIcons";

interface LocationMapPickerProps {
  lat: number;
  lng: number;
  zoom?: number;
  heightClassName?: string;
  onChange: (position: { lat: number; lng: number }) => void;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickToPlace({ onChange }: { onChange: (position: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationMapPicker({
  lat,
  lng,
  zoom = 13,
  heightClassName = "h-56",
  onChange,
}: LocationMapPickerProps) {
  return (
    <div className={`isolate w-full overflow-hidden rounded-2xl border border-divider shadow-soft ${heightClassName}`}>
      <MapContainer center={[lat, lng]} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={lat} lng={lng} />
        <ClickToPlace onChange={onChange} />
        <Marker
          position={[lat, lng]}
          icon={myLocationMarkerIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as LeafletMarker;
              const position = marker.getLatLng();
              onChange({ lat: position.lat, lng: position.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
