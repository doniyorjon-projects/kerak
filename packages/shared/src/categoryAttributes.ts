export type AttributeFieldType = "text" | "number" | "decimal" | "select" | "multiselect" | "boolean" | "range";

export interface AttributeFieldDef {
  key: string;
  label: string;
  type: AttributeFieldType;
  options?: string[];
  unit?: string;
  placeholder?: string;
  filterable?: boolean;
}

const CONDITION_OPTIONS = ["Yangi", "Ishlatilgan (f/b)"];
const GENDER_OPTIONS = ["Erkak", "Ayol", "Unisex"];
const CLOTHING_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL va katta", "Universal"];
const DEAL_TYPE_OPTIONS = ["Sotish", "Uzoq muddatli ijara", "Kunlik ijara"];

/**
 * Har bir kalit `Category.id` (barqaror slug) qiymati bilan mos keladi -
 * uz_marketplace_form_fields.json'dagi `category_fields`dan to'g'ridan-to'g'ri
 * ko'chirilgan. Faqat maydon qo'shadigan tugunlar shu yerda bor (~30 ta) -
 * qolgan barcha leaf kategoriyalar ana shu tugunlardan biriga (yoki bir nechtasiga)
 * bola bo'lgani uchun `resolveCategoryFields` orqali meros oladi.
 */
export const CATEGORY_FIELDS: Record<string, AttributeFieldDef[]> = {
  transport: [{ key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true }],

  "yengil-avtomobillar": [
    { key: "brand", label: "Marka", type: "text", filterable: true },
    { key: "model", label: "Model", type: "text", filterable: true },
    { key: "year", label: "Ishlab chiqarilgan yili", type: "number", filterable: true },
    { key: "mileage", label: "Yurgan masofasi", type: "number", unit: "km", filterable: true },
    {
      key: "transmission",
      label: "Uzatmalar qutisi",
      type: "select",
      options: ["Mexanika", "Avtomat", "Variator", "Robot"],
      filterable: true,
    },
    {
      key: "fuel_type",
      label: "Yoqilg'i turi",
      type: "select",
      options: ["Benzin", "Benzin / Gaz (metan)", "Benzin / Gaz (propan)", "Dizel", "Gibrid", "Elektr"],
      filterable: true,
    },
    { key: "engine_volume", label: "Dvigatel hajmi", type: "decimal", unit: "l" },
    {
      key: "body_type",
      label: "Kuzov turi",
      type: "select",
      options: ["Sedan", "Xetchbek", "Universal", "Krossover / SUV", "Minivan", "Pikap", "Kupe", "Kabriolet"],
      filterable: true,
    },
    {
      key: "drive_type",
      label: "Uzatma turi",
      type: "select",
      options: ["Old g'ildirak", "Orqa g'ildirak", "To'liq (4x4)"],
    },
    {
      key: "color",
      label: "Rangi",
      type: "select",
      options: ["Oq", "Qora", "Kumush", "Kulrang", "Qizil", "Ko'k", "Yashil", "Sariq", "Jigarrang", "Bej", "Boshqa"],
      filterable: true,
    },
    {
      key: "position",
      label: "Pozitsiya",
      type: "select",
      options: ["Boshlang'ich", "1-pozitsiya", "2-pozitsiya", "3-pozitsiya", "4-pozitsiya", "5-pozitsiya", "Full"],
    },
    { key: "has_gas_equipment", label: "Gaz balloni (metan/propan) o'rnatilgan", type: "boolean" },
    { key: "is_credit", label: "Bo'lib to'lash / kredit", type: "boolean", filterable: true },
    { key: "exchange_possible", label: "Ayirboshlash mumkin", type: "boolean", filterable: true },
    {
      key: "condition_details",
      label: "Kuzov holati",
      type: "select",
      options: ["Ideal", "Yaxshi", "O'rtacha", "Ta'mir talab", "Avariyadan keyin"],
    },
  ],

  "avto-ehtiyot-qismlar": [
    { key: "part_for_brand", label: "Qaysi mashinaga", type: "text", filterable: true },
    { key: "part_for_model", label: "Model", type: "text" },
    { key: "part_number", label: "Katalog raqami (OEM)", type: "text" },
    { key: "is_original", label: "Original / analog", type: "select", options: ["Original", "Analog", "Bilmayman"] },
    { key: "wholesale", label: "Ulgurji sotiladi", type: "boolean", filterable: true },
  ],

  "shina-disk": [
    { key: "tire_width", label: "Kengligi", type: "number", unit: "mm", placeholder: "195" },
    { key: "tire_profile", label: "Profili", type: "number", unit: "%", placeholder: "60" },
    { key: "rim_diameter", label: "Diametri (R)", type: "number", filterable: true },
    { key: "season", label: "Mavsum", type: "select", options: ["Yozgi", "Qishki", "Har mavsum"], filterable: true },
    { key: "quantity", label: "Soni", type: "number", unit: "dona" },
  ],

  moto: [
    {
      key: "moto_type",
      label: "Turi",
      type: "select",
      options: ["Mototsikl", "Skuter", "Moped", "Kvadrosikl (ATV)", "Elektroskuter", "Pit bike / Enduro"],
      filterable: true,
    },
    { key: "brand", label: "Marka", type: "text", filterable: true },
    { key: "year", label: "Yili", type: "number" },
    { key: "engine_cc", label: "Dvigatel hajmi", type: "number", unit: "cc" },
    { key: "has_documents", label: "Hujjatlari bor", type: "boolean" },
  ],

  "yuk-mashinalari": [
    { key: "brand", label: "Marka", type: "text", filterable: true },
    { key: "year", label: "Yili", type: "number", filterable: true },
    { key: "mileage", label: "Probeg", type: "number", unit: "km" },
    { key: "load_capacity", label: "Yuk ko'tarish quvvati", type: "decimal", unit: "tonna", filterable: true },
    {
      key: "truck_type",
      label: "Kuzov turi",
      type: "select",
      options: ["Bortli", "Furgon", "Izotermik", "Refrijerator", "Samosval", "Tyagach", "Sistern", "Evakuator"],
      filterable: true,
    },
  ],

  "kochmas-mulk": [
    { key: "deal_type", label: "Bitim turi", type: "select", options: DEAL_TYPE_OPTIONS, filterable: true },
    { key: "area_total", label: "Umumiy maydoni", type: "decimal", unit: "m²", filterable: true },
    { key: "landmark", label: "Mo'ljal (orientir)", type: "text", placeholder: "Chilonzor, 3-chorak, Farhod bozori yonida" },
  ],

  "kvartira-sotish": [
    { key: "rooms", label: "Xonalar soni", type: "select", options: ["1", "2", "3", "4", "5", "6+", "Studiya"], filterable: true },
    { key: "floor", label: "Qavat", type: "number", filterable: true },
    { key: "total_floors", label: "Binoning qavatlari", type: "number" },
    { key: "building_type", label: "Bino turi", type: "select", options: ["Panel", "G'isht", "Monolit", "Blok", "Yog'och"], filterable: true },
    { key: "build_year", label: "Qurilgan yili", type: "number" },
    {
      key: "repair_state",
      label: "Ta'mir holati",
      type: "select",
      options: ["Yevroremont", "O'rtacha", "Ta'mir talab", "Qora suvoq (qoraqurilish)", "Avtorskiy loyiha"],
      filterable: true,
    },
    { key: "bathroom", label: "Sanuzel", type: "select", options: ["Alohida", "Birga", "2 va undan ko'p"] },
    { key: "furnished", label: "Mebel bilan", type: "boolean", filterable: true },
    { key: "has_documents", label: "Hujjatlari tayyor (kadastr)", type: "boolean" },
    { key: "is_new_building", label: "Yangi qurilish (novostroyka)", type: "boolean", filterable: true },
    {
      key: "amenities",
      label: "Qulayliklar",
      type: "multiselect",
      options: ["Lift", "Balkon", "Konditsioner", "Internet", "Qo'riqlanadigan hudud", "Parking", "Bolalar maydonchasi", "Yer osti garaj"],
      filterable: true,
    },
  ],

  "kvartira-ijara": [
    { key: "rent_period", label: "To'lov davri", type: "select", options: ["Oyiga", "Kuniga", "Yiliga"] },
    { key: "prepayment", label: "Oldindan to'lov", type: "select", options: ["Yo'q", "1 oy", "2 oy", "3 oy va ko'p"] },
    { key: "deposit", label: "Zalog (depozit)", type: "boolean" },
    { key: "utilities_included", label: "Kommunal to'lov narxga kiradi", type: "boolean" },
    {
      key: "tenant_preference",
      label: "Kimlar uchun",
      type: "multiselect",
      options: ["Oila uchun", "Talabalar uchun", "Xodimlar uchun", "Faqat ayollar", "Faqat erkaklar", "Farqi yo'q"],
    },
  ],

  "uy-hovli-sotish": [
    { key: "rooms", label: "Xonalar soni", type: "select", options: ["1", "2", "3", "4", "5", "6+"], filterable: true },
    { key: "land_area", label: "Yer maydoni", type: "decimal", unit: "sotix", filterable: true },
    { key: "floors", label: "Qavatlar soni", type: "number" },
    { key: "repair_state", label: "Ta'mir holati", type: "select", options: ["Yevroremont", "O'rtacha", "Ta'mir talab", "Qoraqurilish"], filterable: true },
    {
      key: "utilities",
      label: "Kommunikatsiyalar",
      type: "multiselect",
      options: ["Gaz", "Suv", "Svet (elektr)", "Kanalizatsiya", "Isitish tizimi", "Internet"],
      filterable: true,
    },
    { key: "has_garage", label: "Garaj bor", type: "boolean" },
  ],

  "yer-uchastka": [
    { key: "land_area", label: "Maydoni", type: "decimal", unit: "sotix", filterable: true },
    {
      key: "land_purpose",
      label: "Maqsadi",
      type: "select",
      options: ["Uy qurish uchun", "Tijorat uchun", "Qishloq xo'jaligi", "Sanoat"],
      filterable: true,
    },
    { key: "has_documents", label: "Hujjatlari bor", type: "boolean" },
  ],

  tijorat: [
    {
      key: "commercial_type",
      label: "Obyekt turi",
      type: "select",
      options: ["Do'kon / savdo maydoni", "Ofis", "Ombor", "Ishlab chiqarish binosi", "Restoran / kafe", "Salon", "Universal"],
      filterable: true,
    },
    { key: "floor", label: "Qavat", type: "number" },
    { key: "entrance", label: "Kirish", type: "select", options: ["Ko'chadan", "Hovlidan", "Alohida"] },
    {
      key: "utilities",
      label: "Mavjud imkoniyatlar",
      type: "multiselect",
      options: ["3 fazali elektr", "Suv", "Gaz", "Kanalizatsiya", "Ventilyatsiya", "Parking", "Qo'riqlash"],
    },
  ],

  elektronika: [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    { key: "brand", label: "Brend", type: "text", filterable: true },
    { key: "has_warranty", label: "Kafolat bor", type: "boolean", filterable: true },
    { key: "has_box", label: "Qutisi va hujjatlari bor", type: "boolean" },
  ],

  smartfonlar: [
    {
      key: "brand",
      label: "Brend",
      type: "select",
      options: ["Apple", "Samsung", "Xiaomi", "Redmi", "Realme", "Infinix", "Tecno", "Honor", "Huawei", "Vivo", "Oppo", "Nokia", "Google Pixel", "Boshqa"],
      filterable: true,
    },
    { key: "model", label: "Model", type: "text", placeholder: "iPhone 13 Pro" },
    { key: "storage", label: "Xotira", type: "select", options: ["16 GB", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"], filterable: true },
    { key: "ram", label: "Operativ xotira (RAM)", type: "select", options: ["2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
    { key: "battery_health", label: "Batareya holati", type: "number", unit: "%" },
    { key: "sim_count", label: "SIM-karta", type: "select", options: ["1 SIM", "2 SIM", "eSIM", "1 SIM + eSIM"] },
    { key: "is_official", label: "Rasmiy (IMEI ro'yxatdan o'tgan)", type: "boolean", filterable: true },
    {
      key: "defects",
      label: "Nuqsonlari",
      type: "multiselect",
      options: ["Yo'q", "Ekranda chizilgan", "Korpusda chizilgan", "Ekran almashtirilgan", "Batareya almashtirilgan", "Kamera muammosi", "Face ID / Touch ID ishlamaydi"],
    },
  ],

  "kompyuter-texnikasi": [
    { key: "cpu", label: "Protsessor", type: "text", placeholder: "Intel Core i5-1135G7" },
    { key: "ram", label: "Operativ xotira", type: "select", options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB va ko'p"], filterable: true },
    { key: "storage_type", label: "Xotira turi", type: "select", options: ["HDD", "SSD", "SSD + HDD"] },
    { key: "storage_size", label: "Xotira hajmi", type: "select", options: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB va ko'p"] },
    { key: "gpu", label: "Videokarta", type: "text" },
    { key: "screen_size", label: "Ekran o'lchami", type: "decimal", unit: "dyuym" },
  ],

  televizorlar: [
    { key: "screen_size", label: "Diagonali", type: "number", unit: "dyuym", filterable: true },
    { key: "resolution", label: "Ekran aniqligi", type: "select", options: ["HD", "Full HD", "4K UHD", "8K"] },
    { key: "is_smart", label: "Smart TV", type: "boolean", filterable: true },
  ],

  "maishiy-texnika": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    {
      key: "brand",
      label: "Brend",
      type: "select",
      options: ["Artel", "LG", "Samsung", "Bosch", "Beko", "Midea", "Shivaki", "Roison", "Ziffer", "Vestel", "Indesit", "Electrolux", "Philips", "Gorenje", "Premier", "Boshqa"],
      filterable: true,
    },
    { key: "has_warranty", label: "Kafolat bor", type: "boolean", filterable: true },
    { key: "is_installment", label: "Muddatli to'lovga", type: "boolean", filterable: true },
  ],

  sovutgichlar: [
    {
      key: "fridge_type",
      label: "Turi",
      type: "select",
      options: ["Bir kamerali", "Ikki kamerali", "Side-by-Side", "Mini sovutgich", "Muzlatgich (lar')", "Vitrina sovutgich"],
    },
    { key: "no_frost", label: "No Frost", type: "boolean" },
    { key: "volume", label: "Hajmi", type: "number", unit: "l" },
  ],

  "kir-yuvish": [
    { key: "load_type", label: "Yuklash turi", type: "select", options: ["Frontal", "Vertikal", "Yarim avtomat"] },
    { key: "load_kg", label: "Yuklash hajmi", type: "decimal", unit: "kg" },
    { key: "has_dryer", label: "Quritish funksiyasi bor", type: "boolean" },
  ],

  konditsioner: [
    { key: "btu", label: "Quvvati", type: "select", options: ["7 (07)", "9 (09)", "12", "18", "24", "36", "48"], filterable: true },
    { key: "is_inverter", label: "Inverter", type: "boolean", filterable: true },
    { key: "installation_included", label: "O'rnatish xizmati bilan", type: "boolean" },
  ],

  "uy-va-bog": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    {
      key: "material",
      label: "Materiali",
      type: "select",
      options: ["Yog'och", "LDSP / MDF", "Metall", "Plastik", "Shisha", "Charm", "Mato", "Kombinatsiya"],
    },
    { key: "dimensions", label: "O'lchamlari (UxExB)", type: "text", placeholder: "200x90x75 sm" },
    { key: "color", label: "Rangi", type: "text" },
    { key: "is_custom_order", label: "Buyurtma asosida tayyorlanadi", type: "boolean" },
  ],

  "qurilish-va-tamirlash": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    { key: "brand", label: "Brend / ishlab chiqaruvchi", type: "text" },
    {
      key: "unit_of_measure",
      label: "O'lchov birligi",
      type: "select",
      options: ["dona", "m", "m²", "m³", "kg", "tonna", "qop", "rulon", "quti", "litr"],
    },
    { key: "quantity_available", label: "Mavjud miqdori", type: "decimal" },
    { key: "wholesale", label: "Ulgurji narx mavjud", type: "boolean", filterable: true },
    { key: "min_order", label: "Minimal buyurtma", type: "text" },
  ],

  "kiyim-poyabzal-aksessuar": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    { key: "gender", label: "Kimga mo'ljallangan", type: "select", options: GENDER_OPTIONS, filterable: true },
    { key: "size", label: "O'lchami", type: "select", options: CLOTHING_SIZE_OPTIONS, filterable: true },
    {
      key: "color",
      label: "Rangi",
      type: "select",
      options: ["Oq", "Qora", "Kulrang", "Bej", "Qizil", "Ko'k", "Yashil", "Sariq", "Pushti", "Jigarrang", "Ko'p rangli"],
      filterable: true,
    },
    {
      key: "material",
      label: "Materiali",
      type: "select",
      options: ["Paxta", "Jinsi", "Charm", "Sun'iy charm", "Jun", "Shoyi", "Trikotaj", "Sintetika", "Atlas / adras", "Boshqa"],
    },
    { key: "brand", label: "Brend", type: "text" },
    { key: "season", label: "Mavsum", type: "select", options: ["Yozgi", "Qishki", "Demi-mavsum", "Har mavsum"], filterable: true },
  ],

  poyabzal: [
    {
      key: "size",
      label: "Poyabzal o'lchami",
      type: "select",
      options: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47+"],
      filterable: true,
    },
  ],

  "gozallik-va-salomatlik": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    { key: "brand", label: "Brend", type: "text" },
    { key: "volume", label: "Hajmi / og'irligi", type: "text", placeholder: "100 ml / 50 g" },
    { key: "expiry_date", label: "Yaroqlilik muddati", type: "text" },
    { key: "is_original", label: "Original mahsulot", type: "boolean" },
  ],

  "bolalar-uchun": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    {
      key: "age_group",
      label: "Yosh toifasi",
      type: "select",
      options: ["0-1 yosh", "1-3 yosh", "3-6 yosh", "6-10 yosh", "10-14 yosh", "14+ yosh"],
      filterable: true,
    },
    { key: "gender", label: "Jinsi", type: "select", options: GENDER_OPTIONS, filterable: true },
    { key: "size", label: "O'lchami (bo'yi)", type: "text", placeholder: "86 sm / 2 yosh" },
    { key: "brand", label: "Brend", type: "text" },
  ],

  "xobbi-sport-dam-olish": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    { key: "brand", label: "Brend", type: "text" },
    { key: "for_gender", label: "Kimga", type: "select", options: GENDER_OPTIONS },
  ],

  hayvonlar: [
    {
      key: "animal_type",
      label: "Hayvon turi",
      type: "select",
      options: ["It", "Mushuk", "Qush", "Baliq", "Qo'y / echki", "Qoramol", "Ot", "Quyon", "Asalari", "Boshqa"],
      filterable: true,
    },
    { key: "breed", label: "Zoti", type: "text", placeholder: "Masalan: Alabay" },
    { key: "animal_age", label: "Yoshi", type: "text", placeholder: "3 oylik / 2 yosh" },
    { key: "animal_gender", label: "Jinsi", type: "select", options: ["Erkak", "Urg'ochi", "Bilmayman"] },
    { key: "is_vaccinated", label: "Emlangan", type: "boolean", filterable: true },
    { key: "has_pedigree", label: "Hujjatlari (rodoslovnaya) bor", type: "boolean" },
    { key: "weight", label: "Vazni", type: "decimal", unit: "kg" },
  ],

  vakansiyalar: [
    { key: "company_name", label: "Kompaniya nomi", type: "text" },
    { key: "position", label: "Lavozim", type: "text" },
    { key: "salary_range", label: "Maosh", type: "range", unit: "so'm", filterable: true },
    {
      key: "salary_type",
      label: "To'lov turi",
      type: "select",
      options: ["Oylik", "Kunlik", "Soatbay", "Bitim (sdelniy)", "Foiz (%)"],
    },
    {
      key: "employment_type",
      label: "Bandlik turi",
      type: "select",
      options: ["To'liq stavka", "Yarim stavka", "Vaqtinchalik", "Vaxta usuli", "Masofaviy", "Amaliyot (stajirovka)"],
      filterable: true,
    },
    { key: "schedule", label: "Ish grafigi", type: "select", options: ["5/2", "6/1", "2/2", "Smenali", "Erkin grafik"] },
    {
      key: "experience_required",
      label: "Talab qilinadigan tajriba",
      type: "select",
      options: ["Tajriba shart emas", "1 yilgacha", "1-3 yil", "3-6 yil", "6 yildan ko'p"],
      filterable: true,
    },
    { key: "education", label: "Ma'lumoti", type: "select", options: ["Ahamiyatsiz", "O'rta", "O'rta maxsus", "Oliy"] },
    { key: "gender_preference", label: "Jins bo'yicha talab", type: "select", options: GENDER_OPTIONS },
    { key: "age_range", label: "Yosh chegarasi", type: "range", unit: "yosh" },
    {
      key: "benefits",
      label: "Qo'shimcha shartlar",
      type: "multiselect",
      options: ["Tushlik bilan", "Yotoqxona bilan", "Transport bilan", "Rasmiy ish", "Ta'lim beriladi", "Karyera o'sishi"],
    },
  ],

  rezyume: [
    { key: "position", label: "Qidirilayotgan lavozim", type: "text" },
    { key: "age", label: "Yoshim", type: "number" },
    {
      key: "experience_years",
      label: "Tajribam",
      type: "select",
      options: ["Tajribasiz", "1 yilgacha", "1-3 yil", "3-6 yil", "6 yildan ko'p"],
    },
    { key: "education", label: "Ma'lumotim", type: "select", options: ["O'rta", "O'rta maxsus", "Tugallanmagan oliy", "Oliy"] },
    {
      key: "languages",
      label: "Tillar",
      type: "multiselect",
      options: ["O'zbek", "Rus", "Ingliz", "Turk", "Koreys", "Arab", "Xitoy"],
    },
    { key: "expected_salary", label: "Kutilayotgan maosh", type: "decimal" },
    {
      key: "employment_type",
      label: "Bandlik turi",
      type: "multiselect",
      options: ["To'liq stavka", "Yarim stavka", "Masofaviy", "Vaxta", "Vaqtinchalik"],
    },
  ],

  xizmatlar: [
    { key: "service_provider_type", label: "Kim taklif qiladi", type: "select", options: ["Xususiy usta", "Brigada", "Kompaniya"] },
    {
      key: "price_type",
      label: "Narx shakli",
      type: "select",
      options: ["Belgilangan narx", "Soatbay", "m² hisobida", "Kelishiladi", "... dan boshlab"],
    },
    { key: "experience_years", label: "Tajriba", type: "number", unit: "yil" },
    { key: "on_site", label: "Chiqib xizmat ko'rsataman", type: "boolean", filterable: true },
    { key: "work_hours", label: "Ish vaqti", type: "text", placeholder: "09:00 - 20:00, 24/7" },
    { key: "has_guarantee", label: "Kafolat beriladi", type: "boolean" },
  ],

  "biznes-va-uskunalar": [
    { key: "condition", label: "Holati", type: "select", options: CONDITION_OPTIONS, filterable: true },
    {
      key: "business_sphere",
      label: "Faoliyat sohasi",
      type: "select",
      options: ["Savdo", "Umumiy ovqatlanish", "Ishlab chiqarish", "Xizmat ko'rsatish", "Qishloq xo'jaligi", "IT", "Logistika", "Boshqa"],
    },
    { key: "monthly_income", label: "Oylik daromad", type: "decimal" },
    { key: "payback_period", label: "O'zini oqlash muddati", type: "text" },
    { key: "reason_for_sale", label: "Sotish sababi", type: "text" },
  ],

  "oziq-ovqat-qishloq-xojaligi": [
    { key: "unit_of_measure", label: "O'lchov birligi", type: "select", options: ["kg", "tonna", "dona", "qop", "litr", "quti"] },
    { key: "quantity_available", label: "Mavjud miqdori", type: "decimal" },
    { key: "min_order", label: "Minimal buyurtma", type: "text" },
    { key: "wholesale", label: "Ulgurji", type: "boolean", filterable: true },
    { key: "harvest_year", label: "Hosil yili", type: "number" },
    { key: "is_organic", label: "Ekologik toza", type: "boolean", filterable: true },
  ],
};

/**
 * Berilgan kategoriya (istalgan darajada) uchun to'liq forma sxemasini
 * hisoblaydi - `parentId` zanjiri bo'yicha ildizgacha yuqoriga chiqib, har bir
 * ajdod tugunning maydonlarini qo'shib boradi. Bir xil `key` bir necha
 * darajada uchrasa, eng yaqin (o'ziga xosroq) daraja ustunlik qiladi -
 * masalan "poyabzal"ning o'z `size` maydoni "kiyim-poyabzal-aksessuar"dan
 * meros bo'lgan `size`ni almashtiradi.
 */
export function resolveCategoryFields(
  categoryId: string | undefined,
  categoriesById: Map<string, { id: string; parentId: string | null }>,
): AttributeFieldDef[] {
  if (!categoryId) return [];

  const chain: string[] = [];
  let current: { id: string; parentId: string | null } | undefined = categoriesById.get(categoryId);
  while (current) {
    chain.push(current.id);
    current = current.parentId ? categoriesById.get(current.parentId) : undefined;
  }

  const byKey = new Map<string, AttributeFieldDef>();
  // Ildizdan boshlab qo'shamiz, keyin bola tugunlar (chain oxiridan boshiga)
  // ustidan yozadi - shu bilan eng yaqin daraja g'olib chiqadi.
  for (let i = chain.length - 1; i >= 0; i--) {
    const fields = CATEGORY_FIELDS[chain[i]];
    if (!fields) continue;
    for (const field of fields) byKey.set(field.key, field);
  }

  return [...byKey.values()];
}
