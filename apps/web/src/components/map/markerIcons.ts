import L from "leaflet";

// Leaflet'ning standart marker rasm fayllari bundler bilan ishlamaydi,
// shuning uchun inline SVG asosida divIcon yasaymiz (loyihadagi SVG-icon
// yondashuviga mos, tashqi rasm fayllariga bog'liq emas).
function pinSvg(color: string): string {
  return `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z"
        fill="${color}"
      />
      <circle cx="15" cy="15" r="6" fill="white" />
    </svg>
  `;
}

export const listingMarkerIcon = L.divIcon({
  html: pinSvg("#2AABEE"),
  className: "",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
});

export const myLocationMarkerIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2AABEE;border:3px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15);"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
