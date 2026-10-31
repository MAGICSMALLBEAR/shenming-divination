/**
 * 廟宇社群心得、即時香火熱度與參拜指南
 */

export interface CommunityReview {
  id: string;
  templeId: string;
  author: string;
  avatarEmoji: string;
  tag: string;         // 如「求職還願」、「求姻緣靈驗」、「消災收驚」、「祈福考運」
  rating: number;      // 1-5
  text: string;
  dateStr: string;
  likes: number;
}

export interface IncenseHeatInfo {
  level: 'blazing' | 'bustling' | 'serene';
  heatLabel: string;
  flameIcon: string;
  crowdIndex: number; // 0 - 100%
  recommendedHours: string;
  specialNotice?: string;
}

// 台灣知名宮廟精選信眾靈驗心得庫
export const CURATED_TEMPLE_REVIEWS: Record<string, CommunityReview[]> = {
  xingtiangong_taipei: [
    {
      id: 'xtg_1',
      templeId: 'xingtiangong_taipei',
      author: '林信士 (台北)',
      avatarEmoji: '🙏',
      tag: '消災收驚',
      rating: 5,
      text: '行天宮效勞生阿嬤收驚非常慈悲靈驗，幾年前孩子受驚夜啼，經過阿嬤捧香祝禱後，當晚就能安穩入睡。恩主公殿前香火鼎盛，令人內心安定。',
      dateStr: '2026-10-18',
      likes: 64,
    },
    {
      id: 'xtg_2',
      templeId: 'xingtiangong_taipei',
      author: '陳弟子 (新北)',
      avatarEmoji: '💼',
      tag: '轉職求籤',
      rating: 5,
      text: '轉職猶豫時求得關聖帝君雷雨師第 1 籤「巍巍獨步向雲間」，帝君勉勵勇敢承擔。後來錄取理想外商，特地回來行天宮雙手合十還願感謝帝君！',
      dateStr: '2026-09-25',
      likes: 82,
    },
  ],
  longshan_taipei: [
    {
      id: 'ls_1',
      templeId: 'longshan_taipei',
      author: '張居士',
      avatarEmoji: '🌸',
      tag: '月老良緣',
      rating: 5,
      text: '在後殿向月老神君求紅線，按順序報上姓名生辰。半年後認識了現在的先生，相知相惜，今天帶喜糖與鉛錢回來向龍山寺月老答謝！',
      dateStr: '2026-10-22',
      likes: 110,
    },
    {
      id: 'ls_2',
      templeId: 'longshan_taipei',
      author: '王同學',
      avatarEmoji: '📚',
      tag: '文昌考運',
      rating: 5,
      text: '國家考試前把准考證影本帶來過文昌爐，觀世音菩薩與文昌帝君庇佑，考試時思緒異常清晰，順利榜上有名！古蹟雕刻與香火氣息十分莊嚴。',
      dateStr: '2026-08-30',
      likes: 53,
    },
  ],
  xiahai_taipei: [
    {
      id: 'xh_1',
      templeId: 'xiahai_taipei',
      author: '黃小姐 (板橋)',
      avatarEmoji: '🏮',
      tag: '月老喜餅',
      rating: 5,
      text: '霞海城隍廟月老名不虛傳，廟方工作人員引導非常專業親切。求得鉛錢與紅線後，遇到同頻共振的另一半，今天特地送上一盒喜餅答謝城隍爺與月老！',
      dateStr: '2026-10-12',
      likes: 135,
    },
  ],
  hongludi_zhonghe: [
    {
      id: 'hld_1',
      templeId: 'hongludi_zhonghe',
      author: '周業務',
      avatarEmoji: '💰',
      tag: '換母錢求財',
      rating: 5,
      text: '爬上烘爐地向土地公爺爺摸金元寶、換發財母錢。放在錢包當錢母後，這半年業績大幅成長！晚上夜景更是俯瞰雙北的絕佳清幽勝地。',
      dateStr: '2026-10-05',
      likes: 97,
    },
  ],
  dajia_mazu: [
    {
      id: 'dj_1',
      templeId: 'dajia_mazu',
      author: '李信徒 (台中)',
      avatarEmoji: '⛵',
      tag: '平安繞境',
      rating: 5,
      text: '每年跟隨大甲媽遶境，鎮瀾宮地下室的金媽祖與翡翠媽祖威嚴慈祥。向聖母娘娘求籤六十甲子，指點家運豁然開朗，感受滿滿神聖力量。',
      dateStr: '2026-09-19',
      likes: 148,
    },
  ],
  beigang_mazu: [
    {
      id: 'bg_1',
      templeId: 'beigang_mazu',
      author: '吳弟子 (雲林)',
      avatarEmoji: '🔥',
      tag: '生意祈福',
      rating: 5,
      text: '北港朝天宮是台灣媽祖總本山之一，千里眼與順風耳將軍神威顯赫。店面開幕前來此請香火令旗，庇佑生意興隆、出入平安。',
      dateStr: '2026-10-02',
      likes: 76,
    },
  ],
  beijidian_tainan: [
    {
      id: 'bjd_1',
      templeId: 'beijidian_tainan',
      author: '郭弟子 (台南)',
      avatarEmoji: '⚔️',
      tag: '消災解厄',
      rating: 5,
      text: '全台首邑北極殿，明代玄天上帝金身莊嚴肅穆。遇到難以決斷的公事官非，敬拜上帝公後心定神清，順利化險為夷。',
      dateStr: '2026-08-15',
      likes: 42,
    },
  ],
  checheng_fuan: [
    {
      id: 'fa_1',
      templeId: 'checheng_fuan',
      author: '施信士 (屏東)',
      avatarEmoji: '🌟',
      tag: '發財求福',
      rating: 5,
      text: '東南亞最大的土地公廟，八角金爐自動吸金紙的奇觀令人讚嘆！向身著龍袍的福德正神求得發財米與平安符，闔家安康。',
      dateStr: '2026-09-10',
      likes: 68,
    },
  ],
};

// 通用廟宇精選心得（針對未獨立收錄之廟宇）
export const GENERIC_TEMPLE_REVIEWS: CommunityReview[] = [
  {
    id: 'gen_1',
    templeId: 'generic',
    author: '虔誠信眾',
    avatarEmoji: '🙏',
    tag: '平安祈願',
    rating: 5,
    text: '此廟主神慈悲護佑，環境清幽雅緻。殿內香煙繚繞，向神明誠心祈求家宅平安、工作順遂，參拜後身心備感安詳。',
    dateStr: '2026-10-25',
    likes: 31,
  },
  {
    id: 'gen_2',
    templeId: 'generic',
    author: '陳弟子',
    avatarEmoji: '🕯️',
    tag: '誠心禮拜',
    rating: 5,
    text: '廟宇維護乾淨整潔，志工與廟祝親切熱心指引參拜動線與求籤禮儀，是地方信眾的心靈寄託所在。',
    dateStr: '2026-09-18',
    likes: 24,
  },
];

/**
 * 動態計算廟宇即時香火熱度指數
 * 支援傳入自訂時段與星期（0-6），便於預測與單元測試
 */
export function calculateIncenseHeat(
  templeId: string,
  customHour?: number,
  customDayOfWeek?: number
): IncenseHeatInfo {
  const now = new Date();
  const hour = typeof customHour === 'number' ? customHour : now.getHours();
  const dayOfWeek = typeof customDayOfWeek === 'number' ? customDayOfWeek : now.getDay(); // 0 is Sunday, 6 is Saturday

  // 重點大廟基底權重較高
  const isMajorTemple = [
    'xingtiangong_taipei',
    'longshan_taipei',
    'xiahai_taipei',
    'dajia_mazu',
    'beigang_mazu',
    'hongludi_zhonghe',
  ].includes(templeId);

  let crowd = isMajorTemple ? 50 : 25;

  // 週末人潮加成
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    crowd += 25;
  }

  // 時段人流波動
  if (hour >= 9 && hour <= 12) {
    crowd += 30; // 上午進香高峰
  } else if (hour >= 14 && hour <= 17) {
    crowd += 20; // 下午參拜人潮
  } else if (hour >= 18 && hour <= 21) {
    crowd += 15; // 晚間祈福
  } else if (hour < 7 || hour > 21) {
    crowd -= 25; // 清晨或夜間安靜
  }

  crowd = Math.max(10, Math.min(98, crowd));

  let level: IncenseHeatInfo['level'] = 'serene';
  let heatLabel = '香火清幽 🕊️';
  let flameIcon = '🕊️';

  if (crowd >= 75) {
    level = 'blazing';
    heatLabel = '香火鼎盛 🔥🔥🔥';
    flameIcon = '🔥';
  } else if (crowd >= 45) {
    level = 'bustling';
    heatLabel = '香客絡繹 🔥🔥';
    flameIcon = '🏮';
  }

  const recommendedHours = isMajorTemple
    ? '平日上午 07:00-09:00 或午後 14:00 清幽宜人'
    : '每日 08:00-11:00 晨光敬拜為佳';

  return {
    level,
    heatLabel,
    flameIcon,
    crowdIndex: crowd,
    recommendedHours,
  };
}

/**
 * 取得該宮廟之精選社群信眾心得
 */
export function getCuratedReviews(templeId: string): CommunityReview[] {
  return CURATED_TEMPLE_REVIEWS[templeId] || GENERIC_TEMPLE_REVIEWS;
}
