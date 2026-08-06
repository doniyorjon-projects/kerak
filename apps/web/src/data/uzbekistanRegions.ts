// Bu fayl O'zbekiston viloyat/tuman ro'yxatini avtomatik generatsiya qilingan.
// Manba: MIMAXUZ/uzbekistan-regions-data (nomlar) + akbartus/GeoJSON-Uzbekistan (viloyat markazining geometrik markazi).
// Har bir tuman o'z viloyatining markaziy koordinatasini oladi (tuman darajasida aniq koordinata mavjud emas,
// shuning uchun "eng yaqin" filtri viloyat darajasida taxminiy ishlaydi).

export interface District {
  id: number;
  nameUz: string;
}

export interface Region {
  id: number;
  nameUz: string;
  lat: number;
  lng: number;
  districts: District[];
}

export const REGIONS: Region[] = [
  {
    "id": 15,
    "nameUz": "Qoraqalpog'iston Respublikasi",
    "lat": 43.432618,
    "lng": 58.85095,
    "districts": [
      {
        "id": 201,
        "nameUz": "Amudaryo tumani"
      },
      {
        "id": 202,
        "nameUz": "Beruniy tumani"
      },
      {
        "id": 203,
        "nameUz": "Qorao'zak tumani"
      },
      {
        "id": 204,
        "nameUz": "Kegeyli tumani"
      },
      {
        "id": 205,
        "nameUz": "Qo'ng'irot tumani"
      },
      {
        "id": 206,
        "nameUz": "Qanliko'l tumani"
      },
      {
        "id": 207,
        "nameUz": "Mo'ynoq tumani"
      },
      {
        "id": 208,
        "nameUz": "Nukus tumani"
      },
      {
        "id": 209,
        "nameUz": "Taxiatosh tumani"
      },
      {
        "id": 210,
        "nameUz": "Taxtako'pir tumani"
      },
      {
        "id": 211,
        "nameUz": "To'rtko'l tumani"
      },
      {
        "id": 212,
        "nameUz": "Xo'jayli tumani"
      },
      {
        "id": 213,
        "nameUz": "Chimboy tumani"
      },
      {
        "id": 214,
        "nameUz": "Shumanay tumani"
      },
      {
        "id": 215,
        "nameUz": "Ellikqal'a tumani"
      },
      {
        "id": 216,
        "nameUz": "Nukus"
      },
      {
        "id": 8575,
        "nameUz": "Bo‘zatov tumani"
      }
    ]
  },
  {
    "id": 2,
    "nameUz": "Andijon viloyati",
    "lat": 40.75397,
    "lng": 72.297369,
    "districts": [
      {
        "id": 16,
        "nameUz": "Oltinko'l tumani"
      },
      {
        "id": 17,
        "nameUz": "Andijon tumani"
      },
      {
        "id": 18,
        "nameUz": "Baliqchi tumani"
      },
      {
        "id": 19,
        "nameUz": "Bo'z tumani"
      },
      {
        "id": 20,
        "nameUz": "Buloqboshi tumani"
      },
      {
        "id": 21,
        "nameUz": "Jalaquduq tumani"
      },
      {
        "id": 22,
        "nameUz": "Izboskan tumani"
      },
      {
        "id": 23,
        "nameUz": "Ulug'nor tumani"
      },
      {
        "id": 24,
        "nameUz": "Qo'rg'ontepa tumani"
      },
      {
        "id": 25,
        "nameUz": "Asaka tumani"
      },
      {
        "id": 26,
        "nameUz": "Marxamat tumani"
      },
      {
        "id": 27,
        "nameUz": "Shahrixon tumani"
      },
      {
        "id": 28,
        "nameUz": "Paxtaobod tumani"
      },
      {
        "id": 29,
        "nameUz": "Xo'jaobod tumani"
      },
      {
        "id": 30,
        "nameUz": "Andijon"
      },
      {
        "id": 31,
        "nameUz": "Xonobod"
      }
    ]
  },
  {
    "id": 3,
    "nameUz": "Buxoro viloyati",
    "lat": 40.177564,
    "lng": 63.712085,
    "districts": [
      {
        "id": 32,
        "nameUz": "Olot tumani"
      },
      {
        "id": 33,
        "nameUz": "Buxoro tumani"
      },
      {
        "id": 34,
        "nameUz": "Vobkent tumani"
      },
      {
        "id": 35,
        "nameUz": "G'ijduvon tumani"
      },
      {
        "id": 36,
        "nameUz": "Kogon tumani"
      },
      {
        "id": 37,
        "nameUz": "Qorako'l tumani"
      },
      {
        "id": 38,
        "nameUz": "Qorovulbozor tumani"
      },
      {
        "id": 39,
        "nameUz": "Peshku tumani"
      },
      {
        "id": 40,
        "nameUz": "Romitan tumani"
      },
      {
        "id": 41,
        "nameUz": "Jondor tumani"
      },
      {
        "id": 42,
        "nameUz": "Shofirkon tumani"
      },
      {
        "id": 43,
        "nameUz": "Buxoro"
      },
      {
        "id": 44,
        "nameUz": "Kogon"
      }
    ]
  },
  {
    "id": 4,
    "nameUz": "Jizzax viloyati",
    "lat": 40.363165,
    "lng": 67.681934,
    "districts": [
      {
        "id": 45,
        "nameUz": "Arnasoy tumani"
      },
      {
        "id": 46,
        "nameUz": "Baxmal tumani"
      },
      {
        "id": 47,
        "nameUz": "G'allaorol tumani"
      },
      {
        "id": 49,
        "nameUz": "Do'stlik tumani"
      },
      {
        "id": 50,
        "nameUz": "Zomin tumani"
      },
      {
        "id": 51,
        "nameUz": "Zarbdor tumani"
      },
      {
        "id": 52,
        "nameUz": "Mirzacho'l tumani"
      },
      {
        "id": 53,
        "nameUz": "Zafarobod tumani"
      },
      {
        "id": 54,
        "nameUz": "Paxtakor tumani"
      },
      {
        "id": 55,
        "nameUz": "Forish tumani"
      },
      {
        "id": 56,
        "nameUz": "Yangiobod tumani"
      },
      {
        "id": 57,
        "nameUz": "Jizzax"
      },
      {
        "id": 2905,
        "nameUz": "Sh.Rashidov tumani"
      }
    ]
  },
  {
    "id": 5,
    "nameUz": "Qashqadaryo viloyati",
    "lat": 38.853822,
    "lng": 66.102609,
    "districts": [
      {
        "id": 58,
        "nameUz": "G'uzor tumani"
      },
      {
        "id": 59,
        "nameUz": "Dehqonobod tumani"
      },
      {
        "id": 60,
        "nameUz": "Qamashi tumani"
      },
      {
        "id": 61,
        "nameUz": "Qarshi tumani"
      },
      {
        "id": 62,
        "nameUz": "Koson tumani"
      },
      {
        "id": 63,
        "nameUz": "Kitob tumani"
      },
      {
        "id": 64,
        "nameUz": "Mirishkor tumani"
      },
      {
        "id": 65,
        "nameUz": "Muborak tumani"
      },
      {
        "id": 66,
        "nameUz": "Nishon tumani"
      },
      {
        "id": 67,
        "nameUz": "Kasbi tumani"
      },
      {
        "id": 68,
        "nameUz": "Chiroqchi tumani"
      },
      {
        "id": 69,
        "nameUz": "Shahrisabz tumani"
      },
      {
        "id": 70,
        "nameUz": "Yakkabog' tumani"
      },
      {
        "id": 71,
        "nameUz": "Qarshi"
      },
      {
        "id": 72,
        "nameUz": "Shahrisabz"
      },
      {
        "id": 8591,
        "nameUz": "Ko‘kdala tumani"
      }
    ]
  },
  {
    "id": 6,
    "nameUz": "Navoiy viloyati",
    "lat": 41.978887,
    "lng": 64.357687,
    "districts": [
      {
        "id": 73,
        "nameUz": "Konimex tumani"
      },
      {
        "id": 74,
        "nameUz": "Qiziltepa tumani"
      },
      {
        "id": 75,
        "nameUz": "Navbahor tumani"
      },
      {
        "id": 76,
        "nameUz": "Karmana tumani"
      },
      {
        "id": 77,
        "nameUz": "Nurota tumani"
      },
      {
        "id": 78,
        "nameUz": "Tomdi tumani"
      },
      {
        "id": 79,
        "nameUz": "Uchquduq tumani"
      },
      {
        "id": 80,
        "nameUz": "Xatirchi tumani"
      },
      {
        "id": 81,
        "nameUz": "Navoiy"
      },
      {
        "id": 2939,
        "nameUz": "Zarafshon"
      },
      {
        "id": 8584,
        "nameUz": "G‘ozg‘on tumani"
      }
    ]
  },
  {
    "id": 7,
    "nameUz": "Namangan viloyati",
    "lat": 41.046756,
    "lng": 71.252154,
    "districts": [
      {
        "id": 83,
        "nameUz": "Mingbuloq tumani"
      },
      {
        "id": 84,
        "nameUz": "Kosonsoy tumani"
      },
      {
        "id": 85,
        "nameUz": "Namangan tumani"
      },
      {
        "id": 86,
        "nameUz": "Norin tumani"
      },
      {
        "id": 87,
        "nameUz": "Pop tumani"
      },
      {
        "id": 88,
        "nameUz": "To'raqo'rg'on tumani"
      },
      {
        "id": 89,
        "nameUz": "Uychi tumani"
      },
      {
        "id": 90,
        "nameUz": "Uchqo'rg'on tumani"
      },
      {
        "id": 91,
        "nameUz": "Chortoq tumani"
      },
      {
        "id": 92,
        "nameUz": "Chust tumani"
      },
      {
        "id": 93,
        "nameUz": "Yangiqo'rg'on tumani"
      },
      {
        "id": 94,
        "nameUz": "Namangan"
      },
      {
        "id": 8595,
        "nameUz": "Davlatobod tumani"
      },
      {
        "id": 8601,
        "nameUz": "Yangi Namangan tumani"
      }
    ]
  },
  {
    "id": 8,
    "nameUz": "Samarqand viloyati",
    "lat": 39.830201,
    "lng": 66.409035,
    "districts": [
      {
        "id": 95,
        "nameUz": "Oqdaryo tumani"
      },
      {
        "id": 96,
        "nameUz": "Bulung'ur tumani"
      },
      {
        "id": 97,
        "nameUz": "Jomboy tumani"
      },
      {
        "id": 98,
        "nameUz": "Ishtixon tumani"
      },
      {
        "id": 99,
        "nameUz": "Kattaqo'rg'on tumani"
      },
      {
        "id": 100,
        "nameUz": "Qo'shrabot tumani"
      },
      {
        "id": 101,
        "nameUz": "Narpay tumani"
      },
      {
        "id": 102,
        "nameUz": "Payariq tumani"
      },
      {
        "id": 103,
        "nameUz": "Pastdarg'om tumani"
      },
      {
        "id": 104,
        "nameUz": "Paxtachi tumani"
      },
      {
        "id": 105,
        "nameUz": "Samarqand tumani"
      },
      {
        "id": 106,
        "nameUz": "Nurobod tumani"
      },
      {
        "id": 107,
        "nameUz": "Urgut tumani"
      },
      {
        "id": 108,
        "nameUz": "Tayloq tumani"
      },
      {
        "id": 109,
        "nameUz": "Samarqand"
      },
      {
        "id": 110,
        "nameUz": "Kattaqo'rg'on"
      }
    ]
  },
  {
    "id": 10,
    "nameUz": "Sirdaryo viloyati",
    "lat": 40.491135,
    "lng": 68.661124,
    "districts": [
      {
        "id": 125,
        "nameUz": "Oqoltin tumani"
      },
      {
        "id": 126,
        "nameUz": "Boyovut tumani"
      },
      {
        "id": 127,
        "nameUz": "Sayxunobod tumani"
      },
      {
        "id": 128,
        "nameUz": "Guliston tumani"
      },
      {
        "id": 129,
        "nameUz": "Sardoba tumani"
      },
      {
        "id": 130,
        "nameUz": "Mirzaobod tumani"
      },
      {
        "id": 131,
        "nameUz": "Sirdaryo tumani"
      },
      {
        "id": 132,
        "nameUz": "Xovos tumani"
      },
      {
        "id": 133,
        "nameUz": "Guliston"
      },
      {
        "id": 134,
        "nameUz": "Shirin"
      },
      {
        "id": 135,
        "nameUz": "Yangiyer"
      },
      {
        "id": 8574,
        "nameUz": "Baxt shaxar"
      }
    ]
  },
  {
    "id": 5723,
    "nameUz": "Surxondaryo viloyati",
    "lat": 38.039879,
    "lng": 67.471896,
    "districts": [
      {
        "id": 111,
        "nameUz": "Oltinsoy tumani"
      },
      {
        "id": 112,
        "nameUz": "Angor tumani"
      },
      {
        "id": 113,
        "nameUz": "Boysun tumani"
      },
      {
        "id": 114,
        "nameUz": "Muzrabot tumani"
      },
      {
        "id": 115,
        "nameUz": "Denov tumani"
      },
      {
        "id": 116,
        "nameUz": "Jarqo'rg'on tumani"
      },
      {
        "id": 117,
        "nameUz": "Qumqo'rg'on tumani"
      },
      {
        "id": 118,
        "nameUz": "Qiziriq tumani"
      },
      {
        "id": 119,
        "nameUz": "Sariosiyo tumani"
      },
      {
        "id": 120,
        "nameUz": "Termiz tumani"
      },
      {
        "id": 121,
        "nameUz": "Uzun tumani"
      },
      {
        "id": 122,
        "nameUz": "Sherobod tumani"
      },
      {
        "id": 123,
        "nameUz": "Sho'rchi tumani"
      },
      {
        "id": 2981,
        "nameUz": "Termiz"
      },
      {
        "id": 8580,
        "nameUz": "Bandixon tumani"
      }
    ]
  },
  {
    "id": 12,
    "nameUz": "Toshkent viloyati",
    "lat": 41.246492,
    "lng": 69.774654,
    "districts": [
      {
        "id": 148,
        "nameUz": "Oqqo'rg'on tumani"
      },
      {
        "id": 149,
        "nameUz": "Ohangaron tumani"
      },
      {
        "id": 150,
        "nameUz": "Bekobod tumani"
      },
      {
        "id": 151,
        "nameUz": "Bo'stonliq tumani"
      },
      {
        "id": 152,
        "nameUz": "Bo'ka tumani"
      },
      {
        "id": 154,
        "nameUz": "Zangiota tumani"
      },
      {
        "id": 155,
        "nameUz": "Yuqorichirchiq tumani"
      },
      {
        "id": 156,
        "nameUz": "Qibray tumani"
      },
      {
        "id": 157,
        "nameUz": "Parkent tumani"
      },
      {
        "id": 158,
        "nameUz": "Piskent tumani"
      },
      {
        "id": 159,
        "nameUz": "O'rtachirchiq tumani"
      },
      {
        "id": 160,
        "nameUz": "Chinoz tumani"
      },
      {
        "id": 161,
        "nameUz": "Yangiyo'l tumani"
      },
      {
        "id": 162,
        "nameUz": "Toshkent tumani"
      },
      {
        "id": 163,
        "nameUz": "Nurafshon"
      },
      {
        "id": 164,
        "nameUz": "Olmaliq"
      },
      {
        "id": 165,
        "nameUz": "Angren"
      },
      {
        "id": 166,
        "nameUz": "Bekobod"
      },
      {
        "id": 167,
        "nameUz": "Ohangaron"
      },
      {
        "id": 168,
        "nameUz": "Chirchiq"
      },
      {
        "id": 169,
        "nameUz": "Yangiyo'l"
      },
      {
        "id": 5867,
        "nameUz": "Quyichirchiq tumani"
      }
    ]
  },
  {
    "id": 11,
    "nameUz": "Toshkent shahri",
    "lat": 41.284315,
    "lng": 69.261541,
    "districts": [
      {
        "id": 137,
        "nameUz": "Uchtepa tumani"
      },
      {
        "id": 138,
        "nameUz": "Bektemir tumani"
      },
      {
        "id": 139,
        "nameUz": "Yunusobod tumani"
      },
      {
        "id": 140,
        "nameUz": "Mirzo Ulug'bek tumani"
      },
      {
        "id": 141,
        "nameUz": "Mirobod tumani"
      },
      {
        "id": 142,
        "nameUz": "Shayxontohur tumani"
      },
      {
        "id": 143,
        "nameUz": "Olmazor tumani"
      },
      {
        "id": 144,
        "nameUz": "Sirg'ali tumani"
      },
      {
        "id": 145,
        "nameUz": "Yakkasaroy tumani"
      },
      {
        "id": 146,
        "nameUz": "Yashnobod tumani"
      },
      {
        "id": 147,
        "nameUz": "Chilonzor tumani"
      },
      {
        "id": 2993,
        "nameUz": "Toshkent shahrining tumanlari"
      },
      {
        "id": 8587,
        "nameUz": "Yangihayot tumani"
      }
    ]
  },
  {
    "id": 13,
    "nameUz": "Farg'ona viloyati",
    "lat": 40.454159,
    "lng": 71.281679,
    "districts": [
      {
        "id": 170,
        "nameUz": "Oltiariq tumani"
      },
      {
        "id": 171,
        "nameUz": "Qo'shtepa tumani"
      },
      {
        "id": 172,
        "nameUz": "Bog'dod tumani"
      },
      {
        "id": 173,
        "nameUz": "Buvayda tumani"
      },
      {
        "id": 174,
        "nameUz": "Beshariq tumani"
      },
      {
        "id": 175,
        "nameUz": "Quva tumani"
      },
      {
        "id": 176,
        "nameUz": "Uchko'prik tumani"
      },
      {
        "id": 177,
        "nameUz": "Rishton tumani"
      },
      {
        "id": 178,
        "nameUz": "So'x tumani"
      },
      {
        "id": 179,
        "nameUz": "Toshloq tumani"
      },
      {
        "id": 180,
        "nameUz": "O'zbekiston tumani"
      },
      {
        "id": 181,
        "nameUz": "Farg'ona tumani"
      },
      {
        "id": 182,
        "nameUz": "Dang'ara tumani"
      },
      {
        "id": 183,
        "nameUz": "Furqat tumani"
      },
      {
        "id": 184,
        "nameUz": "Yozyovon tumani"
      },
      {
        "id": 185,
        "nameUz": "Farg'ona"
      },
      {
        "id": 186,
        "nameUz": "Qo'qon"
      },
      {
        "id": 187,
        "nameUz": "Quvasoy"
      },
      {
        "id": 188,
        "nameUz": "Marg'ilon"
      }
    ]
  },
  {
    "id": 14,
    "nameUz": "Xorazm viloyati",
    "lat": 41.338451,
    "lng": 61.023006,
    "districts": [
      {
        "id": 189,
        "nameUz": "Bog'ot tumani"
      },
      {
        "id": 190,
        "nameUz": "Gurlan tumani"
      },
      {
        "id": 191,
        "nameUz": "Qo'shko'pir tumani"
      },
      {
        "id": 192,
        "nameUz": "Urganch tumani"
      },
      {
        "id": 193,
        "nameUz": "Xazorasp tumani"
      },
      {
        "id": 194,
        "nameUz": "Xonqa tumani"
      },
      {
        "id": 195,
        "nameUz": "Xiva tumani"
      },
      {
        "id": 196,
        "nameUz": "Shovot tumani"
      },
      {
        "id": 197,
        "nameUz": "Yangiariq tumani"
      },
      {
        "id": 198,
        "nameUz": "Yangibozor tumani"
      },
      {
        "id": 199,
        "nameUz": "Urganch"
      },
      {
        "id": 200,
        "nameUz": "Xiva"
      },
      {
        "id": 8581,
        "nameUz": "Tuproqqal’a tumani"
      }
    ]
  }
];
