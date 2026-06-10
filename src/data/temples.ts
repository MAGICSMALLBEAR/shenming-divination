// 台灣主要廟宇資料庫
// 含座標、主祀神明、地址等資訊

export interface Temple {
  id: string;
  name: string;
  mainGod: string;       // 主祀神明名稱
  godIds: number[];      // 對應神明ID
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  openHours: string;
  description: string;
  specialty: string;     // 靈驗傳說/特色祈求
  founded?: string;      // 建廟年代
  tags: string[];        // 標籤：財神、姻緣、考運...
}

export const TEMPLES: Temple[] = [
  // === 台北市 ===
  {
    id: 'xingtiangong_taipei',
    name: '行天宮',
    mainGod: '恩主公（關聖帝君）',
    godIds: [3],
    address: '台北市中山區民權東路二段109號',
    city: '台北市',
    district: '中山區',
    lat: 25.0659,
    lng: 121.5342,
    openHours: '04:00-22:30',
    description: '全台最著名的關帝廟之一，以商業、事業祈求最靈驗，每日人潮絡繹不絕。',
    specialty: '事業、財運、考運',
    founded: '民國50年',
    tags: ['財神', '事業', '考運', '免費服務'],
  },
  {
    id: 'longshan_taipei',
    name: '龍山寺',
    mainGod: '觀世音菩薩',
    godIds: [1],
    address: '台北市萬華區廣州街211號',
    city: '台北市',
    district: '萬華區',
    lat: 25.0366,
    lng: 121.4997,
    openHours: '06:00-22:00',
    description: '台北最古老的廟宇之一，供奉菩薩與多位神明，香火鼎盛，為台灣佛道合一信仰代表。',
    specialty: '姻緣、健康、普渡',
    founded: '清乾隆3年（1738年）',
    tags: ['姻緣', '健康', '觀光', '月老'],
  },
  {
    id: 'zhinan_taipei',
    name: '指南宮',
    mainGod: '呂純陽祖師（八仙呂洞賓）',
    godIds: [5],
    address: '台北市文山區指南路三段38巷65號',
    city: '台北市',
    district: '文山區',
    lat: 24.9836,
    lng: 121.5801,
    openHours: '06:00-21:00',
    description: '位於貓空山上，供奉呂洞賓，香火鼎盛，是台灣著名的道教聖地，纜車可達。',
    specialty: '考運、去病、問卜',
    founded: '清光緒10年（1884年）',
    tags: ['考運', '道教', '觀光', '問卜'],
  },
  {
    id: 'mazu_datong',
    name: '大稻埕慈聖宮',
    mainGod: '天上聖母（媽祖）',
    godIds: [7],
    address: '台北市大同區保安街49巷17號',
    city: '台北市',
    district: '大同區',
    lat: 25.0579,
    lng: 121.5121,
    openHours: '06:00-21:30',
    description: '大稻埕著名媽祖廟，廟旁是著名的露天美食廣場，信眾眾多。',
    specialty: '平安、航海、婦女祈求',
    founded: '清同治年間',
    tags: ['媽祖', '平安', '美食'],
  },

  // === 新北市 ===
  {
    id: 'bitan_xindian',
    name: '碧潭福德祠',
    mainGod: '福德正神（土地公）',
    godIds: [4],
    address: '新北市新店區碧潭路旁',
    city: '新北市',
    district: '新店區',
    lat: 24.9687,
    lng: 121.5405,
    openHours: '06:00-21:00',
    description: '鄰近碧潭風景區的土地公廟，是新店地區居民祈求財運的重要廟宇。',
    specialty: '財運、商業、田地',
    tags: ['土地公', '財運', '社區'],
  },
  {
    id: 'sanxia_zushi',
    name: '三峽祖師廟',
    mainGod: '清水祖師',
    godIds: [],
    address: '新北市三峽區長福街1號',
    city: '新北市',
    district: '三峽區',
    lat: 24.9353,
    lng: 121.3694,
    openHours: '06:00-21:30',
    description: '以精緻木雕與石雕藝術著稱，是台灣廟宇藝術的代表作，也是三峽的精神象徵。',
    specialty: '藝術、工藝、平安',
    founded: '清嘉慶7年（1802年）',
    tags: ['藝術廟宇', '觀光', '木雕'],
  },

  // === 桃園市 ===
  {
    id: 'daxi_furen',
    name: '大溪福仁宮',
    mainGod: '關聖帝君',
    godIds: [3],
    address: '桃園市大溪區中央路6號',
    city: '桃園市',
    district: '大溪區',
    lat: 24.8847,
    lng: 121.2884,
    openHours: '06:00-21:00',
    description: '大溪地區信仰中心，以農曆6月24日關帝誕辰繞境最為盛大。',
    specialty: '事業、忠義、武德',
    tags: ['關帝', '繞境', '事業'],
  },

  // === 台中市 ===
  {
    id: 'dakengfudi',
    name: '大坑福德祠',
    mainGod: '福德正神',
    godIds: [4],
    address: '台中市北屯區大坑路區域',
    city: '台中市',
    district: '北屯區',
    lat: 24.1839,
    lng: 120.7316,
    openHours: '07:00-21:00',
    description: '大坑地區著名土地公廟，登山客參拜聖地。',
    specialty: '財運、登山平安',
    tags: ['土地公', '財運', '登山'],
  },
  {
    id: 'leshan_zhonghua',
    name: '樂成宮（旱溪媽祖）',
    mainGod: '天上聖母',
    godIds: [7],
    address: '台中市東區旱溪街48號',
    city: '台中市',
    district: '東區',
    lat: 24.1396,
    lng: 120.6924,
    openHours: '05:30-22:00',
    description: '旱溪媽祖聞名全台，每年農曆三月廿三日繞境活動是台中最盛大的民俗活動之一。',
    specialty: '平安、海上保護、求子',
    founded: '清嘉慶年間',
    tags: ['媽祖', '繞境', '求子', '平安'],
  },

  // === 彰化縣 ===
  {
    id: 'nanyao_changhua',
    name: '南瑤宮',
    mainGod: '天上聖母',
    godIds: [7],
    address: '彰化縣彰化市南瑤路43號',
    city: '彰化縣',
    district: '彰化市',
    lat: 24.0747,
    lng: 120.5348,
    openHours: '05:30-22:00',
    description: '彰化媽祖信仰中心，每年笨港進香活動吸引數十萬信徒參與，為重要民俗活動。',
    specialty: '平安、求子、航海',
    founded: '清乾隆年間',
    tags: ['媽祖', '進香', '平安', '著名'],
  },

  // === 雲林縣 ===
  {
    id: 'beigang_chaotian',
    name: '北港朝天宮',
    mainGod: '天上聖母',
    godIds: [7],
    address: '雲林縣北港鎮中山路178號',
    city: '雲林縣',
    district: '北港鎮',
    lat: 23.5712,
    lng: 120.3011,
    openHours: '05:30-22:30',
    description: '全台最著名的媽祖廟之一，香火鼎盛，每年媽祖誕辰吸引百萬信眾朝拜。',
    specialty: '平安、求子、出行保護',
    founded: '清康熙33年（1694年）',
    tags: ['媽祖', '著名', '進香', '平安', '觀光'],
  },

  // === 台南市 ===
  {
    id: 'tainan_kaiji_mazu',
    name: '開基天后祖廟',
    mainGod: '天上聖母',
    godIds: [7],
    address: '台南市中西區媽祖樓街18號',
    city: '台南市',
    district: '中西區',
    lat: 22.9979,
    lng: 120.2022,
    openHours: '05:00-21:30',
    description: '台灣最早的媽祖廟之一，歷史悠久，香火鼎盛，是台南重要的文化資產。',
    specialty: '平安、求子、婦女庇護',
    founded: '明永曆年間',
    tags: ['媽祖', '歷史', '著名', '平安'],
  },
  {
    id: 'tainan_chenghuang',
    name: '台南大天后宮',
    mainGod: '天上聖母',
    godIds: [7],
    address: '台南市中西區永福路二段227巷18號',
    city: '台南市',
    district: '中西區',
    lat: 22.9979,
    lng: 120.1992,
    openHours: '05:30-21:30',
    description: '台灣第一座官建媽祖廟，清代即為國家祭祀廟宇，地位崇高。',
    specialty: '平安、航海、婦女',
    founded: '清康熙23年（1684年）',
    tags: ['媽祖', '官廟', '歷史', '著名'],
  },
  {
    id: 'tainan_guanghualou',
    name: '台南武廟',
    mainGod: '關聖帝君',
    godIds: [3],
    address: '台南市中西區永福路二段229號',
    city: '台南市',
    district: '中西區',
    lat: 22.9981,
    lng: 120.2006,
    openHours: '06:00-21:00',
    description: '台灣歷史最悠久的關帝廟，清代時被視為武廟的代表，香火旺盛。',
    specialty: '武德、忠義、事業',
    founded: '明永曆年間',
    tags: ['關帝', '歷史', '著名', '事業'],
  },

  // === 高雄市 ===
  {
    id: 'zuoying_cihji',
    name: '左營慈濟宮',
    mainGod: '保生大帝',
    godIds: [8],
    address: '高雄市左營區左營大路218號',
    city: '高雄市',
    district: '左營區',
    lat: 22.6868,
    lng: 120.2985,
    openHours: '05:30-22:00',
    description: '高雄著名的保生大帝廟宇，醫療、健康祈求靈驗聞名，香火旺盛。',
    specialty: '健康、醫療、除病',
    tags: ['保生大帝', '健康', '醫療'],
  },
  {
    id: 'sanfengjungshan',
    name: '三鳳中街三鳳宮',
    mainGod: '中壇元帥（哪吒太子）',
    godIds: [6],
    address: '高雄市三民區河北二路134號',
    city: '高雄市',
    district: '三民區',
    lat: 22.6421,
    lng: 120.3040,
    openHours: '06:00-22:00',
    description: '高雄著名的哪吒廟，與三鳳中街傳統市場相鄰，是高雄城隍及哪吒信仰中心。',
    specialty: '驅邪、保護孩童、商業',
    tags: ['哪吒', '驅邪', '兒童保護', '商業'],
  },

  // === 宜蘭縣 ===
  {
    id: 'zhaoling_yuhuang',
    name: '昭靈廟',
    mainGod: '玉皇大帝',
    godIds: [2],
    address: '宜蘭縣礁溪鄉礁溪路',
    city: '宜蘭縣',
    district: '礁溪鄉',
    lat: 24.8218,
    lng: 121.7739,
    openHours: '07:00-21:00',
    description: '礁溪地區重要廟宇，供奉玉皇大帝，是宜蘭信眾天公誕拜拜重要場所。',
    specialty: '天公、萬事祈求、祈年',
    tags: ['天公', '玉皇', '全能祈求'],
  },

  // === 花蓮縣 ===
  {
    id: 'hualien_jici_mazu',
    name: '花蓮慶修院',
    mainGod: '弘法大師（空海）',
    godIds: [],
    address: '花蓮縣吉安鄉中興路345-1號',
    city: '花蓮縣',
    district: '吉安鄉',
    lat: 23.9564,
    lng: 121.5855,
    openHours: '08:00-17:00',
    description: '日治時期日式佛寺，台灣保存最完整的日式寺廟之一，已列為三級古蹟。',
    specialty: '心靈平靜、文化參訪',
    founded: '大正9年（1920年）',
    tags: ['日式廟宇', '古蹟', '觀光', '文化'],
  },

  // === 澎湖縣 ===
  {
    id: 'penghu_tianhou',
    name: '澎湖天后宮',
    mainGod: '天上聖母',
    godIds: [7],
    address: '澎湖縣馬公市中正路1號',
    city: '澎湖縣',
    district: '馬公市',
    lat: 23.5614,
    lng: 119.5617,
    openHours: '05:30-22:00',
    description: '台灣最古老的媽祖廟，建於明萬曆年間，為台灣一級古蹟，香火極盛。',
    specialty: '海上保護、漁民祈求、平安',
    founded: '明萬曆32年（1604年）',
    tags: ['媽祖', '最古老', '古蹟', '著名', '觀光'],
  },
];

// 依城市分組
export function getTemplesByCity(city: string): Temple[] {
  return TEMPLES.filter(t => t.city === city);
}

// 依神明ID查找廟宇
export function getTemplesByGodId(godId: number): Temple[] {
  return TEMPLES.filter(t => t.godIds.includes(godId));
}

// 依標籤搜尋
export function getTemplesByTag(tag: string): Temple[] {
  return TEMPLES.filter(t => t.tags.includes(tag));
}

// 取得所有城市列表
export function getAllCities(): string[] {
  return [...new Set(TEMPLES.map(t => t.city))].sort();
}

// 依距離排序（近到遠）
export function sortByDistance(temples: Temple[], lat: number, lng: number): Temple[] {
  return [...temples].sort((a, b) => {
    const distA = Math.sqrt((a.lat - lat) ** 2 + (a.lng - lng) ** 2);
    const distB = Math.sqrt((b.lat - lat) ** 2 + (b.lng - lng) ** 2);
    return distA - distB;
  });
}

// 計算兩點距離（公里）
export function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
