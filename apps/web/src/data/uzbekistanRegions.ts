// Bu fayl O'zbekiston viloyat/tuman ro'yxatini avtomatik generatsiya qilingan.
// Manba: MIMAXUZ/uzbekistan-regions-data (nomlar) + akbartus/GeoJSON-Uzbekistan (viloyat markazining geometrik markazi)
// + wmgeolab/geoBoundaries UZB-ADM2 (tuman darajasidagi poligonlar, tuman markazi = tashqi konturning o'rtacha nuqtasi).
// Tuman nomlari geoBoundaries'dagi inglizcha/ruscha transliteratsiya nomlari bilan avtomatik moslashtirilib,
// so'ngra qo'lda tekshirilgan. 2020-2022 yillarda tashkil etilgan yangi tumanlar (masalan, Bo'zatov, Ko'kdala,
// G'ozg'on, Davlatobod, Yangi Namangan, Baxt shahar, Bandixon, Yangihayot, Tuproqqal'a) hamda "Toshkent
// shahrining tumanlari" kabi noaniq/joylashuvsiz yozuv geoBoundaries manbasida topilmadi — bunday hollarda
// tuman o'zining viloyat markazi koordinatasidan foydalanishda davom etadi (eski xatti-harakat saqlanadi).

export interface District {
  id: number;
  nameUz: string;
  lat: number;
  lng: number;
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
        "nameUz": "Amudaryo tumani",
        "lat": 42.129162,
        "lng": 60.020243
      },
      {
        "id": 202,
        "nameUz": "Beruniy tumani",
        "lat": 41.941953,
        "lng": 60.769941
      },
      {
        "id": 203,
        "nameUz": "Qorao'zak tumani",
        "lat": 42.68278,
        "lng": 60.07844
      },
      {
        "id": 204,
        "nameUz": "Kegeyli tumani",
        "lat": 42.859782,
        "lng": 59.471737
      },
      {
        "id": 205,
        "nameUz": "Qo'ng'irot tumani",
        "lat": 42.793674,
        "lng": 58.049831
      },
      {
        "id": 206,
        "nameUz": "Qanliko'l tumani",
        "lat": 42.746261,
        "lng": 59.047997
      },
      {
        "id": 207,
        "nameUz": "Mo'ynoq tumani",
        "lat": 43.804878,
        "lng": 59.709931
      },
      {
        "id": 208,
        "nameUz": "Nukus tumani",
        "lat": 42.555786,
        "lng": 59.47403
      },
      {
        "id": 209,
        "nameUz": "Taxiatosh tumani",
        "lat": 43.432618,
        "lng": 58.85095
      },
      {
        "id": 210,
        "nameUz": "Taxtako'pir tumani",
        "lat": 43.261237,
        "lng": 60.877774
      },
      {
        "id": 211,
        "nameUz": "To'rtko'l tumani",
        "lat": 41.590269,
        "lng": 61.266112
      },
      {
        "id": 212,
        "nameUz": "Xo'jayli tumani",
        "lat": 42.470656,
        "lng": 59.298097
      },
      {
        "id": 213,
        "nameUz": "Chimboy tumani",
        "lat": 43.037107,
        "lng": 59.514481
      },
      {
        "id": 214,
        "nameUz": "Shumanay tumani",
        "lat": 42.650781,
        "lng": 58.923689
      },
      {
        "id": 215,
        "nameUz": "Ellikqal'a tumani",
        "lat": 41.96407,
        "lng": 61.173478
      },
      {
        "id": 216,
        "nameUz": "Nukus",
        "lat": 42.42036,
        "lng": 59.567987
      },
      {
        "id": 8575,
        "nameUz": "Bo‘zatov tumani",
        "lat": 43.432618,
        "lng": 58.85095
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
        "nameUz": "Oltinko'l tumani",
        "lat": 40.813599,
        "lng": 72.129962
      },
      {
        "id": 17,
        "nameUz": "Andijon tumani",
        "lat": 40.806988,
        "lng": 72.393704
      },
      {
        "id": 18,
        "nameUz": "Baliqchi tumani",
        "lat": 40.860964,
        "lng": 71.959993
      },
      {
        "id": 19,
        "nameUz": "Bo'z tumani",
        "lat": 40.717356,
        "lng": 71.901601
      },
      {
        "id": 20,
        "nameUz": "Buloqboshi tumani",
        "lat": 40.644626,
        "lng": 72.45788
      },
      {
        "id": 21,
        "nameUz": "Jalaquduq tumani",
        "lat": 40.757745,
        "lng": 72.655278
      },
      {
        "id": 22,
        "nameUz": "Izboskan tumani",
        "lat": 40.926283,
        "lng": 72.248202
      },
      {
        "id": 23,
        "nameUz": "Ulug'nor tumani",
        "lat": 40.776442,
        "lng": 71.694034
      },
      {
        "id": 24,
        "nameUz": "Qo'rg'ontepa tumani",
        "lat": 40.813176,
        "lng": 72.855632
      },
      {
        "id": 25,
        "nameUz": "Asaka tumani",
        "lat": 40.676914,
        "lng": 72.225952
      },
      {
        "id": 26,
        "nameUz": "Marxamat tumani",
        "lat": 40.525314,
        "lng": 72.341622
      },
      {
        "id": 27,
        "nameUz": "Shahrixon tumani",
        "lat": 40.735984,
        "lng": 72.038084
      },
      {
        "id": 28,
        "nameUz": "Paxtaobod tumani",
        "lat": 40.985385,
        "lng": 72.428377
      },
      {
        "id": 29,
        "nameUz": "Xo'jaobod tumani",
        "lat": 40.632604,
        "lng": 72.566681
      },
      {
        "id": 30,
        "nameUz": "Andijon",
        "lat": 40.811189,
        "lng": 72.322538
      },
      {
        "id": 31,
        "nameUz": "Xonobod",
        "lat": 40.82379,
        "lng": 72.985575
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
        "nameUz": "Olot tumani",
        "lat": 39.21586,
        "lng": 64.057088
      },
      {
        "id": 33,
        "nameUz": "Buxoro tumani",
        "lat": 39.664928,
        "lng": 64.475012
      },
      {
        "id": 34,
        "nameUz": "Vobkent tumani",
        "lat": 39.935027,
        "lng": 64.497941
      },
      {
        "id": 35,
        "nameUz": "G'ijduvon tumani",
        "lat": 40.320763,
        "lng": 64.809509
      },
      {
        "id": 36,
        "nameUz": "Kogon tumani",
        "lat": 39.674388,
        "lng": 64.546578
      },
      {
        "id": 37,
        "nameUz": "Qorako'l tumani",
        "lat": 39.832928,
        "lng": 63.181524
      },
      {
        "id": 38,
        "nameUz": "Qorovulbozor tumani",
        "lat": 39.445103,
        "lng": 64.770082
      },
      {
        "id": 39,
        "nameUz": "Peshku tumani",
        "lat": 40.315658,
        "lng": 63.748229
      },
      {
        "id": 40,
        "nameUz": "Romitan tumani",
        "lat": 40.180349,
        "lng": 63.442089
      },
      {
        "id": 41,
        "nameUz": "Jondor tumani",
        "lat": 39.94824,
        "lng": 63.657452
      },
      {
        "id": 42,
        "nameUz": "Shofirkon tumani",
        "lat": 40.339566,
        "lng": 64.288177
      },
      {
        "id": 43,
        "nameUz": "Buxoro",
        "lat": 39.708892,
        "lng": 64.425153
      },
      {
        "id": 44,
        "nameUz": "Kogon",
        "lat": 39.677543,
        "lng": 64.53032
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
        "nameUz": "Arnasoy tumani",
        "lat": 40.548087,
        "lng": 67.81832
      },
      {
        "id": 46,
        "nameUz": "Baxmal tumani",
        "lat": 39.69547,
        "lng": 67.762723
      },
      {
        "id": 47,
        "nameUz": "G'allaorol tumani",
        "lat": 39.974302,
        "lng": 67.394677
      },
      {
        "id": 49,
        "nameUz": "Do'stlik tumani",
        "lat": 40.488492,
        "lng": 68.0131
      },
      {
        "id": 50,
        "nameUz": "Zomin tumani",
        "lat": 39.887953,
        "lng": 68.409935
      },
      {
        "id": 51,
        "nameUz": "Zarbdor tumani",
        "lat": 40.110492,
        "lng": 68.13582
      },
      {
        "id": 52,
        "nameUz": "Mirzacho'l tumani",
        "lat": 40.671103,
        "lng": 68.024818
      },
      {
        "id": 53,
        "nameUz": "Zafarobod tumani",
        "lat": 40.337713,
        "lng": 67.734
      },
      {
        "id": 54,
        "nameUz": "Paxtakor tumani",
        "lat": 40.3061,
        "lng": 68.003039
      },
      {
        "id": 55,
        "nameUz": "Forish tumani",
        "lat": 40.517164,
        "lng": 67.352906
      },
      {
        "id": 56,
        "nameUz": "Yangiobod tumani",
        "lat": 39.981722,
        "lng": 68.781255
      },
      {
        "id": 57,
        "nameUz": "Jizzax",
        "lat": 40.088805,
        "lng": 67.829187
      },
      {
        "id": 2905,
        "nameUz": "Sh.Rashidov tumani",
        "lat": 40.035053,
        "lng": 67.815947
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
        "nameUz": "G'uzor tumani",
        "lat": 38.547946,
        "lng": 66.159
      },
      {
        "id": 59,
        "nameUz": "Dehqonobod tumani",
        "lat": 38.435252,
        "lng": 66.721328
      },
      {
        "id": 60,
        "nameUz": "Qamashi tumani",
        "lat": 38.74533,
        "lng": 66.843292
      },
      {
        "id": 61,
        "nameUz": "Qarshi tumani",
        "lat": 38.760929,
        "lng": 65.825725
      },
      {
        "id": 62,
        "nameUz": "Koson tumani",
        "lat": 39.111854,
        "lng": 65.776298
      },
      {
        "id": 63,
        "nameUz": "Kitob tumani",
        "lat": 39.1613,
        "lng": 67.051579
      },
      {
        "id": 64,
        "nameUz": "Mirishkor tumani",
        "lat": 38.81798,
        "lng": 65.121848
      },
      {
        "id": 65,
        "nameUz": "Muborak tumani",
        "lat": 39.240002,
        "lng": 65.466192
      },
      {
        "id": 66,
        "nameUz": "Nishon tumani",
        "lat": 38.515399,
        "lng": 65.652496
      },
      {
        "id": 67,
        "nameUz": "Kasbi tumani",
        "lat": 38.863117,
        "lng": 65.457591
      },
      {
        "id": 68,
        "nameUz": "Chiroqchi tumani",
        "lat": 39.122332,
        "lng": 66.295854
      },
      {
        "id": 69,
        "nameUz": "Shahrisabz tumani",
        "lat": 38.996606,
        "lng": 67.0683
      },
      {
        "id": 70,
        "nameUz": "Yakkabog' tumani",
        "lat": 38.857271,
        "lng": 66.84386
      },
      {
        "id": 71,
        "nameUz": "Qarshi",
        "lat": 38.813521,
        "lng": 65.819083
      },
      {
        "id": 72,
        "nameUz": "Shahrisabz",
        "lat": 39.074242,
        "lng": 66.834116
      },
      {
        "id": 8591,
        "nameUz": "Ko‘kdala tumani",
        "lat": 38.853822,
        "lng": 66.102609
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
        "nameUz": "Konimex tumani",
        "lat": 40.674999,
        "lng": 64.924845
      },
      {
        "id": 74,
        "nameUz": "Qiziltepa tumani",
        "lat": 39.836223,
        "lng": 64.927935
      },
      {
        "id": 75,
        "nameUz": "Navbahor tumani",
        "lat": 40.133693,
        "lng": 65.400052
      },
      {
        "id": 76,
        "nameUz": "Karmana tumani",
        "lat": 39.990691,
        "lng": 65.237543
      },
      {
        "id": 77,
        "nameUz": "Nurota tumani",
        "lat": 40.444473,
        "lng": 65.932446
      },
      {
        "id": 78,
        "nameUz": "Tomdi tumani",
        "lat": 42.099789,
        "lng": 65.23189
      },
      {
        "id": 79,
        "nameUz": "Uchquduq tumani",
        "lat": 42.275461,
        "lng": 63.191941
      },
      {
        "id": 80,
        "nameUz": "Xatirchi tumani",
        "lat": 40.163793,
        "lng": 65.889107
      },
      {
        "id": 81,
        "nameUz": "Navoiy",
        "lat": 40.042349,
        "lng": 65.362144
      },
      {
        "id": 2939,
        "nameUz": "Zarafshon",
        "lat": 41.505531,
        "lng": 64.188211
      },
      {
        "id": 8584,
        "nameUz": "G‘ozg‘on tumani",
        "lat": 41.978887,
        "lng": 64.357687
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
        "nameUz": "Mingbuloq tumani",
        "lat": 40.79663,
        "lng": 71.363319
      },
      {
        "id": 84,
        "nameUz": "Kosonsoy tumani",
        "lat": 41.156886,
        "lng": 71.493219
      },
      {
        "id": 85,
        "nameUz": "Namangan tumani",
        "lat": 40.974197,
        "lng": 71.640942
      },
      {
        "id": 86,
        "nameUz": "Norin tumani",
        "lat": 40.96044,
        "lng": 71.989369
      },
      {
        "id": 87,
        "nameUz": "Pop tumani",
        "lat": 41.045244,
        "lng": 70.798885
      },
      {
        "id": 88,
        "nameUz": "To'raqo'rg'on tumani",
        "lat": 40.97523,
        "lng": 71.422287
      },
      {
        "id": 89,
        "nameUz": "Uychi tumani",
        "lat": 41.056915,
        "lng": 71.865503
      },
      {
        "id": 90,
        "nameUz": "Uchqo'rg'on tumani",
        "lat": 41.044577,
        "lng": 72.08062
      },
      {
        "id": 91,
        "nameUz": "Chortoq tumani",
        "lat": 41.263419,
        "lng": 71.808036
      },
      {
        "id": 92,
        "nameUz": "Chust tumani",
        "lat": 41.056336,
        "lng": 71.195088
      },
      {
        "id": 93,
        "nameUz": "Yangiqo'rg'on tumani",
        "lat": 41.322681,
        "lng": 71.695504
      },
      {
        "id": 94,
        "nameUz": "Namangan",
        "lat": 41.007931,
        "lng": 71.657919
      },
      {
        "id": 8595,
        "nameUz": "Davlatobod tumani",
        "lat": 41.046756,
        "lng": 71.252154
      },
      {
        "id": 8601,
        "nameUz": "Yangi Namangan tumani",
        "lat": 41.046756,
        "lng": 71.252154
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
        "nameUz": "Oqdaryo tumani",
        "lat": 39.805958,
        "lng": 66.738142
      },
      {
        "id": 96,
        "nameUz": "Bulung'ur tumani",
        "lat": 39.695704,
        "lng": 67.379669
      },
      {
        "id": 97,
        "nameUz": "Jomboy tumani",
        "lat": 39.760559,
        "lng": 67.127922
      },
      {
        "id": 98,
        "nameUz": "Ishtixon tumani",
        "lat": 39.979405,
        "lng": 66.580226
      },
      {
        "id": 99,
        "nameUz": "Kattaqo'rg'on tumani",
        "lat": 39.873625,
        "lng": 66.26299
      },
      {
        "id": 100,
        "nameUz": "Qo'shrabot tumani",
        "lat": 40.29234,
        "lng": 66.547901
      },
      {
        "id": 101,
        "nameUz": "Narpay tumani",
        "lat": 39.862076,
        "lng": 65.998127
      },
      {
        "id": 102,
        "nameUz": "Payariq tumani",
        "lat": 40.079794,
        "lng": 66.849781
      },
      {
        "id": 103,
        "nameUz": "Pastdarg'om tumani",
        "lat": 39.673672,
        "lng": 66.663901
      },
      {
        "id": 104,
        "nameUz": "Paxtachi tumani",
        "lat": 39.890186,
        "lng": 65.548055
      },
      {
        "id": 105,
        "nameUz": "Samarqand tumani",
        "lat": 39.573425,
        "lng": 66.933538
      },
      {
        "id": 106,
        "nameUz": "Nurobod tumani",
        "lat": 39.583423,
        "lng": 66.185914
      },
      {
        "id": 107,
        "nameUz": "Urgut tumani",
        "lat": 39.374615,
        "lng": 67.121563
      },
      {
        "id": 108,
        "nameUz": "Tayloq tumani",
        "lat": 39.530574,
        "lng": 67.151834
      },
      {
        "id": 109,
        "nameUz": "Samarqand",
        "lat": 39.627122,
        "lng": 66.965532
      },
      {
        "id": 110,
        "nameUz": "Kattaqo'rg'on",
        "lat": 39.85799,
        "lng": 66.272944
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
        "nameUz": "Oqoltin tumani",
        "lat": 40.530844,
        "lng": 68.337305
      },
      {
        "id": 126,
        "nameUz": "Boyovut tumani",
        "lat": 40.323292,
        "lng": 69.016497
      },
      {
        "id": 127,
        "nameUz": "Sayxunobod tumani",
        "lat": 40.641251,
        "lng": 68.901896
      },
      {
        "id": 128,
        "nameUz": "Guliston tumani",
        "lat": 40.489877,
        "lng": 68.945458
      },
      {
        "id": 129,
        "nameUz": "Sardoba tumani",
        "lat": 40.289598,
        "lng": 68.314697
      },
      {
        "id": 130,
        "nameUz": "Mirzaobod tumani",
        "lat": 40.47861,
        "lng": 68.603115
      },
      {
        "id": 131,
        "nameUz": "Sirdaryo tumani",
        "lat": 40.790505,
        "lng": 68.690021
      },
      {
        "id": 132,
        "nameUz": "Xovos tumani",
        "lat": 40.23981,
        "lng": 68.777991
      },
      {
        "id": 133,
        "nameUz": "Guliston",
        "lat": 40.476044,
        "lng": 68.758627
      },
      {
        "id": 134,
        "nameUz": "Shirin",
        "lat": 40.217077,
        "lng": 69.116824
      },
      {
        "id": 135,
        "nameUz": "Yangiyer",
        "lat": 40.251243,
        "lng": 68.817551
      },
      {
        "id": 8574,
        "nameUz": "Baxt shaxar",
        "lat": 40.491135,
        "lng": 68.661124
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
        "nameUz": "Oltinsoy tumani",
        "lat": 38.164938,
        "lng": 67.737761
      },
      {
        "id": 112,
        "nameUz": "Angor tumani",
        "lat": 37.447607,
        "lng": 67.299159
      },
      {
        "id": 113,
        "nameUz": "Boysun tumani",
        "lat": 38.138852,
        "lng": 67.246041
      },
      {
        "id": 114,
        "nameUz": "Muzrabot tumani",
        "lat": 37.402143,
        "lng": 66.888788
      },
      {
        "id": 115,
        "nameUz": "Denov tumani",
        "lat": 38.315475,
        "lng": 67.807836
      },
      {
        "id": 116,
        "nameUz": "Jarqo'rg'on tumani",
        "lat": 37.55006,
        "lng": 67.552192
      },
      {
        "id": 117,
        "nameUz": "Qumqo'rg'on tumani",
        "lat": 37.958582,
        "lng": 67.628942
      },
      {
        "id": 118,
        "nameUz": "Qiziriq tumani",
        "lat": 37.7104,
        "lng": 67.316635
      },
      {
        "id": 119,
        "nameUz": "Sariosiyo tumani",
        "lat": 38.681858,
        "lng": 67.808626
      },
      {
        "id": 120,
        "nameUz": "Termiz tumani",
        "lat": 37.271964,
        "lng": 67.469834
      },
      {
        "id": 121,
        "nameUz": "Uzun tumani",
        "lat": 38.306923,
        "lng": 68.004602
      },
      {
        "id": 122,
        "nameUz": "Sherobod tumani",
        "lat": 37.703712,
        "lng": 66.841056
      },
      {
        "id": 123,
        "nameUz": "Sho'rchi tumani",
        "lat": 37.972743,
        "lng": 67.866203
      },
      {
        "id": 2981,
        "nameUz": "Termiz",
        "lat": 37.241803,
        "lng": 67.329576
      },
      {
        "id": 8580,
        "nameUz": "Bandixon tumani",
        "lat": 38.039879,
        "lng": 67.471896
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
        "nameUz": "Oqqo'rg'on tumani",
        "lat": 40.815108,
        "lng": 69.044493
      },
      {
        "id": 149,
        "nameUz": "Ohangaron tumani",
        "lat": 40.980321,
        "lng": 69.976908
      },
      {
        "id": 150,
        "nameUz": "Bekobod tumani",
        "lat": 40.447375,
        "lng": 69.201069
      },
      {
        "id": 151,
        "nameUz": "Bo'stonliq tumani",
        "lat": 41.787978,
        "lng": 70.387059
      },
      {
        "id": 152,
        "nameUz": "Bo'ka tumani",
        "lat": 40.687239,
        "lng": 69.133849
      },
      {
        "id": 154,
        "nameUz": "Zangiota tumani",
        "lat": 41.217931,
        "lng": 69.11072
      },
      {
        "id": 155,
        "nameUz": "Yuqorichirchiq tumani",
        "lat": 41.182358,
        "lng": 69.462617
      },
      {
        "id": 156,
        "nameUz": "Qibray tumani",
        "lat": 41.417014,
        "lng": 69.435824
      },
      {
        "id": 157,
        "nameUz": "Parkent tumani",
        "lat": 41.26341,
        "lng": 69.727164
      },
      {
        "id": 158,
        "nameUz": "Piskent tumani",
        "lat": 40.795358,
        "lng": 69.446549
      },
      {
        "id": 159,
        "nameUz": "O'rtachirchiq tumani",
        "lat": 41.092963,
        "lng": 69.284191
      },
      {
        "id": 160,
        "nameUz": "Chinoz tumani",
        "lat": 40.967638,
        "lng": 68.81049
      },
      {
        "id": 161,
        "nameUz": "Yangiyo'l tumani",
        "lat": 41.098786,
        "lng": 69.010197
      },
      {
        "id": 162,
        "nameUz": "Toshkent tumani",
        "lat": 41.374377,
        "lng": 69.180342
      },
      {
        "id": 163,
        "nameUz": "Nurafshon",
        "lat": 41.048922,
        "lng": 69.353413
      },
      {
        "id": 164,
        "nameUz": "Olmaliq",
        "lat": 40.828998,
        "lng": 69.571391
      },
      {
        "id": 165,
        "nameUz": "Angren",
        "lat": 41.003813,
        "lng": 70.099834
      },
      {
        "id": 166,
        "nameUz": "Bekobod",
        "lat": 40.224449,
        "lng": 69.253845
      },
      {
        "id": 167,
        "nameUz": "Ohangaron",
        "lat": 40.880662,
        "lng": 69.611227
      },
      {
        "id": 168,
        "nameUz": "Chirchiq",
        "lat": 41.444638,
        "lng": 69.529414
      },
      {
        "id": 169,
        "nameUz": "Yangiyo'l",
        "lat": 41.083849,
        "lng": 69.027386
      },
      {
        "id": 5867,
        "nameUz": "Quyichirchiq tumani",
        "lat": 40.937393,
        "lng": 68.970591
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
        "nameUz": "Uchtepa tumani",
        "lat": 41.254595,
        "lng": 69.12587
      },
      {
        "id": 138,
        "nameUz": "Bektemir tumani",
        "lat": 41.189313,
        "lng": 69.299113
      },
      {
        "id": 139,
        "nameUz": "Yunusobod tumani",
        "lat": 41.313688,
        "lng": 69.260604
      },
      {
        "id": 140,
        "nameUz": "Mirzo Ulug'bek tumani",
        "lat": 41.298265,
        "lng": 69.303791
      },
      {
        "id": 141,
        "nameUz": "Mirobod tumani",
        "lat": 41.234057,
        "lng": 69.266275
      },
      {
        "id": 142,
        "nameUz": "Shayxontohur tumani",
        "lat": 41.290506,
        "lng": 69.183369
      },
      {
        "id": 143,
        "nameUz": "Olmazor tumani",
        "lat": 41.315462,
        "lng": 69.189722
      },
      {
        "id": 144,
        "nameUz": "Sirg'ali tumani",
        "lat": 41.187229,
        "lng": 69.202681
      },
      {
        "id": 145,
        "nameUz": "Yakkasaroy tumani",
        "lat": 41.251037,
        "lng": 69.221378
      },
      {
        "id": 146,
        "nameUz": "Yashnobod tumani",
        "lat": 41.256097,
        "lng": 69.309013
      },
      {
        "id": 147,
        "nameUz": "Chilonzor tumani",
        "lat": 41.241712,
        "lng": 69.17488
      },
      {
        "id": 2993,
        "nameUz": "Toshkent shahrining tumanlari",
        "lat": 41.284315,
        "lng": 69.261541
      },
      {
        "id": 8587,
        "nameUz": "Yangihayot tumani",
        "lat": 41.284315,
        "lng": 69.261541
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
        "nameUz": "Oltiariq tumani",
        "lat": 40.451531,
        "lng": 71.409934
      },
      {
        "id": 171,
        "nameUz": "Qo'shtepa tumani",
        "lat": 40.527982,
        "lng": 71.640661
      },
      {
        "id": 172,
        "nameUz": "Bog'dod tumani",
        "lat": 40.490178,
        "lng": 71.20556
      },
      {
        "id": 173,
        "nameUz": "Buvayda tumani",
        "lat": 40.639895,
        "lng": 71.093798
      },
      {
        "id": 174,
        "nameUz": "Beshariq tumani",
        "lat": 40.392997,
        "lng": 70.567984
      },
      {
        "id": 175,
        "nameUz": "Quva tumani",
        "lat": 40.508989,
        "lng": 72.010435
      },
      {
        "id": 176,
        "nameUz": "Uchko'prik tumani",
        "lat": 40.531529,
        "lng": 71.02041
      },
      {
        "id": 177,
        "nameUz": "Rishton tumani",
        "lat": 40.385494,
        "lng": 71.247892
      },
      {
        "id": 178,
        "nameUz": "So'x tumani",
        "lat": 40.038944,
        "lng": 71.112438
      },
      {
        "id": 179,
        "nameUz": "Toshloq tumani",
        "lat": 40.55149,
        "lng": 71.830449
      },
      {
        "id": 180,
        "nameUz": "O'zbekiston tumani",
        "lat": 40.347095,
        "lng": 70.866317
      },
      {
        "id": 181,
        "nameUz": "Farg'ona tumani",
        "lat": 40.225393,
        "lng": 71.796117
      },
      {
        "id": 182,
        "nameUz": "Dang'ara tumani",
        "lat": 40.62551,
        "lng": 70.817206
      },
      {
        "id": 183,
        "nameUz": "Furqat tumani",
        "lat": 40.521201,
        "lng": 70.735064
      },
      {
        "id": 184,
        "nameUz": "Yozyovon tumani",
        "lat": 40.647357,
        "lng": 71.63252
      },
      {
        "id": 185,
        "nameUz": "Farg'ona",
        "lat": 40.393595,
        "lng": 71.795866
      },
      {
        "id": 186,
        "nameUz": "Qo'qon",
        "lat": 40.533145,
        "lng": 70.933416
      },
      {
        "id": 187,
        "nameUz": "Quvasoy",
        "lat": 40.327922,
        "lng": 71.944322
      },
      {
        "id": 188,
        "nameUz": "Marg'ilon",
        "lat": 40.481668,
        "lng": 71.732835
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
        "nameUz": "Bog'ot tumani",
        "lat": 41.315129,
        "lng": 60.845993
      },
      {
        "id": 190,
        "nameUz": "Gurlan tumani",
        "lat": 41.824572,
        "lng": 60.266555
      },
      {
        "id": 191,
        "nameUz": "Qo'shko'pir tumani",
        "lat": 41.475643,
        "lng": 60.300273
      },
      {
        "id": 192,
        "nameUz": "Urganch tumani",
        "lat": 41.561507,
        "lng": 60.525142
      },
      {
        "id": 193,
        "nameUz": "Xazorasp tumani",
        "lat": 41.124383,
        "lng": 61.532408
      },
      {
        "id": 194,
        "nameUz": "Xonqa tumani",
        "lat": 41.425915,
        "lng": 60.741717
      },
      {
        "id": 195,
        "nameUz": "Xiva tumani",
        "lat": 41.38985,
        "lng": 60.389642
      },
      {
        "id": 196,
        "nameUz": "Shovot tumani",
        "lat": 41.681056,
        "lng": 60.22981
      },
      {
        "id": 197,
        "nameUz": "Yangiariq tumani",
        "lat": 41.305176,
        "lng": 60.527189
      },
      {
        "id": 198,
        "nameUz": "Yangibozor tumani",
        "lat": 41.658043,
        "lng": 60.467119
      },
      {
        "id": 199,
        "nameUz": "Urganch",
        "lat": 41.51501,
        "lng": 60.589631
      },
      {
        "id": 200,
        "nameUz": "Xiva",
        "lat": 41.380692,
        "lng": 60.356428
      },
      {
        "id": 8581,
        "nameUz": "Tuproqqal’a tumani",
        "lat": 41.338451,
        "lng": 61.023006
      }
    ]
  }
];
