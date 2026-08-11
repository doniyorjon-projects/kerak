export type AttributeFieldType = "number" | "select" | "text";

export interface AttributeFieldDef {
  key: string;
  label: string;
  type: AttributeFieldType;
  options?: string[];
  unit?: string;
  placeholder?: string;
}

const flatRooms: AttributeFieldDef[] = [
  { key: "rooms", label: "Xonalar soni", type: "select", options: ["1", "2", "3", "4", "5+"] },
  { key: "area", label: "Maydon", type: "number", unit: "m²" },
  { key: "floor", label: "Qavat", type: "number" },
  { key: "totalFloors", label: "Uydagi qavatlar soni", type: "number" },
  { key: "buildYear", label: "Qurilgan yili", type: "number" },
  {
    key: "renovation",
    label: "Ta'mir holati",
    type: "select",
    options: ["Dizaynerlik", "Evro remont", "O'rtacha", "Ta'mirsiz"],
  },
];

const houseFields: AttributeFieldDef[] = [
  { key: "rooms", label: "Xonalar soni", type: "select", options: ["1", "2", "3", "4", "5+"] },
  { key: "area", label: "Uy maydoni", type: "number", unit: "m²" },
  { key: "landArea", label: "Yer maydoni", type: "number", unit: "sotix" },
  { key: "floor", label: "Necha qavatda", type: "number" },
  { key: "totalFloors", label: "Necha qavatli (jami)", type: "number" },
  { key: "buildYear", label: "Qurilgan yili", type: "number" },
  {
    key: "renovation",
    label: "Ta'mir holati",
    type: "select",
    options: ["Dizaynerlik", "Evro remont", "O'rtacha", "Ta'mirsiz"],
  },
];

const carFields: AttributeFieldDef[] = [
  { key: "year", label: "Ishlab chiqarilgan yili", type: "number" },
  { key: "mileage", label: "Yurgan masofasi", type: "number", unit: "km" },
  { key: "engineVolume", label: "Dvigatel hajmi", type: "number", unit: "L" },
  {
    key: "fuelType",
    label: "Yoqilg'i turi",
    type: "select",
    options: ["Benzin", "Dizel", "Gaz", "Elektr", "Gibrid"],
  },
  { key: "transmission", label: "Uzatmalar qutisi", type: "select", options: ["Mexanika", "Avtomat"] },
];

const animalFields = (typeOptions: string[]): AttributeFieldDef[] => [
  { key: "animalType", label: "Turi", type: "select", options: typeOptions },
  { key: "breed", label: "Zoti", type: "text", placeholder: "Masalan: Alabay" },
  { key: "age", label: "Yoshi", type: "number", unit: "yosh" },
  { key: "gender", label: "Jinsi", type: "select", options: ["Erkak", "Urg'ochi"] },
];

/**
 * Kalitlar Category.nameUz qiymati bilan mos kelishi kerak (barqaror,
 * seed ma'lumotlarida qattiq belgilangan matn). Faqat shu ro'yxatda
 * bo'lgan toifalarda qo'shimcha maydonlar ko'rsatiladi - qolganlari
 * uchun oddiy forma yetarli.
 */
export const CATEGORY_ATTRIBUTES: Record<string, AttributeFieldDef[]> = {
  // Ko'chmas mulk
  "Kvartira sotiladi": flatRooms,
  "Kvartira ijaraga": flatRooms,
  "Uy sotiladi": houseFields,
  "Uy ijaraga": houseFields,
  "Hovli sotiladi": houseFields,
  "Hovli ijaraga": houseFields,
  "Yer uchastka": [
    { key: "landArea", label: "Maydon", type: "number", unit: "sotix" },
    {
      key: "purpose",
      label: "Maqsadi",
      type: "select",
      options: ["Uy qurilishi uchun", "Qishloq xo'jaligi", "Tijorat", "Boshqa"],
    },
  ],
  "Ofis va tijorat mulki": [
    { key: "area", label: "Maydon", type: "number", unit: "m²" },
    { key: "floor", label: "Qavat", type: "number" },
    { key: "rooms", label: "Xona/bo'lim soni", type: "number" },
  ],

  // Transport
  "Avtomobillar": carFields,
  "Mototsikl va moped": [
    { key: "year", label: "Ishlab chiqarilgan yili", type: "number" },
    { key: "mileage", label: "Yurgan masofasi", type: "number", unit: "km" },
    { key: "engineVolume", label: "Dvigatel hajmi", type: "number", unit: "sm³" },
  ],
  "Yuk mashinalari va maxsus texnika": [
    { key: "year", label: "Ishlab chiqarilgan yili", type: "number" },
    { key: "mileage", label: "Yurgan masofasi", type: "number", unit: "km" },
    { key: "capacity", label: "Yuk ko'tarish qobiliyati", type: "number", unit: "tonna" },
  ],
  "Velosipedlar": [
    { key: "bikeType", label: "Turi", type: "select", options: ["Shosse", "Tog'", "Shahar", "BMX"] },
    { key: "frameSize", label: "Rama razmeri", type: "select", options: ["S", "M", "L", "XL"] },
  ],
  "Avto aksessuarlar": [{ key: "compatibleBrand", label: "Mos avtomobil markasi", type: "text" }],

  // Hayvonlar
  "Uy hayvonlari": animalFields(["It", "Mushuk", "Boshqa"]),
  "Qushlar": animalFields(["Kanareyka", "Popugay", "Tovus", "Boshqa"]),
  "Chorva mollari": animalFields(["Sigir", "Qo'y-echki", "Ot", "Tovuq", "Boshqa"]),

  // Mahsulotlar
  "Elektronika": [{ key: "model", label: "Model", type: "text" }],
  "Kiyim-kechak": [
    { key: "size", label: "O'lcham", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"] },
    { key: "gender", label: "Kimga mo'ljallangan", type: "select", options: ["Erkak", "Ayol", "Bolalar", "Unisex"] },
  ],
};

/**
 * "Yangi/Ishlatilgan" holati faqat jismoniy tovar sifatida sotiladigan,
 * qo'ldan-qo'lga o'tishi mumkin bo'lgan narsalar uchun mantiqiy - ko'chmas
 * mulk va tirik jonivorlar uchun bu maydon shart emas.
 */
export const CATEGORIES_WITHOUT_CONDITION = new Set<string>([
  "Kvartira sotiladi",
  "Kvartira ijaraga",
  "Uy sotiladi",
  "Uy ijaraga",
  "Hovli sotiladi",
  "Hovli ijaraga",
  "Yer uchastka",
  "Ofis va tijorat mulki",
  "Uy hayvonlari",
  "Qushlar",
  "Chorva mollari",
]);
