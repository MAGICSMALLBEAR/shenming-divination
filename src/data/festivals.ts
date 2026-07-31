// 台灣傳統節慶內容資料；農曆節日的公曆日期由統一曆法服務動態換算。

import { getLunarDate } from '@/services/lunarDeityCalendar';

export interface Festival {
  id: string;
  name: string;
  solarDate: string;       // MM/DD
  lunarDate?: string;      // 農曆 MM/DD
  type: 'solar' | 'lunar' | 'national';
  description: string;
  worshipGuide: string;    // 拜拜方式
  offerings: string[];     // 供品
  prayerFor: string[];     // 祈求事項
  godIds: number[];        // 適合拜的神明
  color: string;           // 主題色
  traditions: string[];    // 傳統習俗
  taboos: string[];        // 禁忌
}

export const FESTIVALS_2026: Festival[] = [
  {
    id: 'new-year',
    name: '元旦',
    solarDate: '1/1',
    type: 'national',
    description: '新年第一天，迎接嶄新的開始。',
    worshipGuide: '初一早晨面向東方（迎接新氣象），上香祈求全年平安順遂。',
    offerings: ['素果', '鮮花', '清茶', '糕點'],
    prayerFor: ['全年平安', '萬事如意', '事業順遂', '健康長壽'],
    godIds: [1, 2, 3, 6],
    color: '#C0392B',
    traditions: ['看元旦煙火', '吃長壽麵', '出門迎財神'],
    taboos: ['忌說不吉利的話', '忌打掃（會掃走財氣）'],
  },
  {
    id: 'chun-jie',
    name: '除夕',
    solarDate: '2/17',
    lunarDate: '12/30',
    type: 'lunar',
    description: '農曆年最後一天，全家圍爐守歲，迎接新年。',
    worshipGuide: '傍晚祭拜祖先，準備豐盛供品，感謝一年的庇佑，祈求新年更好。',
    offerings: ['三牲（雞鴨魚）', '五果', '年糕', '發糕', '壽金', '刈金'],
    prayerFor: ['闔家平安', '來年更順', '財源滾滾', '子孫滿堂'],
    godIds: [1, 2, 3, 6],
    color: '#C0392B',
    traditions: ['圍爐吃年夜飯', '守歲到半夜', '放鞭炮', '給紅包'],
    taboos: ['忌早睡', '忌打罵孩子', '忌借錢還錢'],
  },
  {
    id: 'chun-jie-2',
    name: '春節（大年初一）',
    solarDate: '2/18',
    lunarDate: '1/1',
    type: 'lunar',
    description: '農曆新年第一天，開春大吉，拜年迎財神。',
    worshipGuide: '凌晨12點後開門迎財神，焚香祝禱，初一拜天公（玉皇大帝）。',
    offerings: ['發糕', '年糕', '糖果', '素果', '天公金', '壽金'],
    prayerFor: ['新年大吉', '財源廣進', '事業騰飛', '身體健康'],
    godIds: [1, 6],
    color: '#C0392B',
    traditions: ['拜年說恭喜', '收紅包', '吃湯圓', '不掃地'],
    taboos: ['忌打破東西', '忌說喪氣話', '忌洗頭（洗去財運）', '忌倒垃圾'],
  },
  {
    id: 'yuan-xiao',
    name: '元宵節',
    solarDate: '3/4',
    lunarDate: '1/15',
    type: 'lunar',
    description: '農曆正月十五，月圓之夜，賞花燈、猜燈謎。',
    worshipGuide: '元宵夜向月老祈緣最靈驗；土地公生日前後，拜福德正神求財最佳。',
    offerings: ['湯圓', '元宵', '鮮花', '清茶'],
    prayerFor: ['月老賜緣', '財神賜福', '家庭和樂', '心願達成'],
    godIds: [13, 6, 2],
    color: '#F39C12',
    traditions: ['賞花燈', '猜燈謎', '吃湯圓', '走橋（走百病）'],
    taboos: ['忌在家悶坐', '忌爭吵'],
  },
  {
    id: 'tu-di-gong',
    name: '土地公生日（頭牙）',
    solarDate: '3/5',
    lunarDate: '2/2',
    type: 'lunar',
    description: '福德正神聖誕，俗稱「頭牙」，商家必拜求生意興隆。',
    worshipGuide: '準備五果、糕點、刈金，誠心祈求財源廣進，生意人更應虔誠祭拜。',
    offerings: ['五果', '糕點', '刈金', '土地公金', '麻薏'],
    prayerFor: ['財源廣進', '生意興隆', '家宅平安', '農作豐收'],
    godIds: [6],
    color: '#D4A017',
    traditions: ['拜拜祈財', '吃潤餅', '商家宴請員工'],
    taboos: ['忌浪費食物'],
  },
  {
    id: 'guanyin-birthday',
    name: '觀世音菩薩聖誕',
    solarDate: '3/10',
    lunarDate: '2/19',
    type: 'lunar',
    description: '觀音菩薩降生之日，是全年最重要的觀音節日。',
    worshipGuide: '全素供品最為誠心，可持誦「南無觀世音菩薩」，心存善念祈福。',
    offerings: ['鮮花', '素果', '清茶', '白蓮花', '壽金'],
    prayerFor: ['平安健康', '慈悲化難', '求子求嗣', '考試順利'],
    godIds: [2],
    color: '#D36BA1',
    traditions: ['吃素一天', '誦觀音經', '放生（需謹慎選擇）'],
    taboos: ['忌葷食', '忌殺生', '忌口出惡言'],
  },
  {
    id: 'wenchang-birthday',
    name: '文昌帝君聖誕',
    solarDate: '3/11',
    lunarDate: '2/3',
    type: 'lunar',
    description: '主管文運的文昌帝君聖誕，是考生祈求的重要時刻。',
    worshipGuide: '帶準考證或成績單來祝聖，準備文具當供品，誠心祈求金榜題名。',
    offerings: ['文具', '書本', '素果', '文昌筆', '壽金'],
    prayerFor: ['金榜題名', '學業精進', '考試順利', '文思泉湧'],
    godIds: [8],
    color: '#4169B1',
    traditions: ['祭拜文昌帝君', '整理書桌', '發憤讀書'],
    taboos: ['忌在書桌上放雜物', '忌說「掛科」等不吉之語'],
  },
  {
    id: 'qing-ming',
    name: '清明節',
    solarDate: '4/5',
    type: 'solar',
    description: '掃墓祭祖的重要節日，慎終追遠，飲水思源。',
    worshipGuide: '整理墓地、獻花、焚香，誠心告慰先人，祈求祖先庇佑後代平安。',
    offerings: ['鮮花', '水果', '飯菜', '清酒', '刈金', '冥紙'],
    prayerFor: ['祖先安息', '後代平安', '家族興旺', '事業順遂'],
    godIds: [2, 3],
    color: '#27AE60',
    traditions: ['掃墓祭祖', '踏青春遊', '吃潤餅', '放風箏'],
    taboos: ['忌著鮮豔服裝', '忌嬉鬧', '孕婦忌前往'],
  },
  {
    id: 'mazu-birthday',
    name: '媽祖聖誕',
    solarDate: '5/11',
    lunarDate: '3/23',
    type: 'lunar',
    description: '台灣最重要的民間信仰節日，媽祖遶境全台熱鬧非凡。',
    worshipGuide: '虔誠跟隨媽祖遶境，或在廟中祈願，求海上/出行平安及家庭和樂。',
    offerings: ['鮮花', '素果', '鳳梨', '清水', '壽金', '刈金'],
    prayerFor: ['出行平安', '家庭和樂', '事業順遂', '闔家健康'],
    godIds: [3],
    color: '#1A69B5',
    traditions: ['參與遶境', '鑽轎底（求平安）', '吃平安龜', '領平安符'],
    taboos: ['忌穿黑衣送行', '忌踩神轎'],
  },
  {
    id: 'duan-wu',
    name: '端午節',
    solarDate: '6/19',
    lunarDate: '5/5',
    type: 'lunar',
    description: '農曆五月五日，龍舟競渡、吃粽子，驅邪避疫的重要節日。',
    worshipGuide: '午時（11-13點）向鍾馗或關帝祈求驅邪保平安，插艾草於門口。',
    offerings: ['粽子', '雄黃酒', '艾草', '五果', '壽金'],
    prayerFor: ['驅邪保平安', '身體健康', '夏日無病', '闔家安康'],
    godIds: [1, 4],
    color: '#16A085',
    traditions: ['吃粽子', '賽龍舟', '掛艾草菖蒲', '喝雄黃酒', '立蛋（午時）'],
    taboos: ['忌說「端午節快樂」（應說平安）', '忌游泳'],
  },
  {
    id: 'qi-xi',
    name: '七夕情人節',
    solarDate: '8/22',
    lunarDate: '7/7',
    type: 'lunar',
    description: '牛郎織女相會之日，月下老人最靈驗的日子，求姻緣首選。',
    worshipGuide: '夜晚向月老及織女星祈緣，準備鮮花和紅色供品，默念心中所求之緣。',
    offerings: ['鮮花（紅色）', '紅豆湯', '糖果', '紅線', '壽金'],
    prayerFor: ['良緣早成', '感情和合', '婚姻美滿', '脫單'],
    godIds: [13, 7],
    color: '#E91E63',
    traditions: ['向織女許願', '做七巧手工', '吃巧食'],
    taboos: ['忌批評別人的感情', '忌爭吵（影響姻緣）'],
  },
  {
    id: 'zhong-yuan',
    name: '中元節（鬼月）',
    solarDate: '8/28',
    lunarDate: '7/15',
    type: 'lunar',
    description: '農曆七月十五，普渡好兄弟，台灣最重要的祭祀節日之一。',
    worshipGuide: '準備豐盛供品普渡，誠心祭拜，也可向地藏王菩薩祈求普渡眾生。',
    offerings: ['三牲', '五果', '白飯', '金紙', '銀紙', '清酒'],
    prayerFor: ['超渡孤魂', '平安無事', '化解煞氣', '普渡積德'],
    godIds: [2, 14],
    color: '#8E44AD',
    traditions: ['普渡拜拜', '放水燈', '搶孤（部分地區）', '焚燒冥紙'],
    taboos: ['忌晚上吹口哨', '忌拍肩膀', '忌涉水游泳', '忌亂踢冥紙'],
  },
  {
    id: 'zhong-qiu',
    name: '中秋節',
    solarDate: '9/25',
    lunarDate: '8/15',
    type: 'lunar',
    description: '月圓之夜，闔家賞月、拜月、吃月餅，台灣也有烤肉傳統。',
    worshipGuide: '月圓之夜向月老祈緣最靈驗，向天公感謝豐收，誠心拜月。',
    offerings: ['月餅', '柚子', '芋頭', '紅豆湯', '紅線（求姻緣）'],
    prayerFor: ['闔家團圓', '月老賜緣', '感謝豐收', '一切圓滿'],
    godIds: [13, 3, 2],
    color: '#E67E22',
    traditions: ['賞月', '吃月餅', '烤肉（台灣特色）', '剝柚子', '拜月老'],
    taboos: ['忌用手指月亮（會被割耳朵）', '忌破壞月餅'],
  },
  {
    id: 'chong-yang',
    name: '重陽節',
    solarDate: '10/19',
    lunarDate: '9/9',
    type: 'lunar',
    description: '農曆九月九日，登高望遠，尊老敬老，也是九皇大帝聖誕。',
    worshipGuide: '登高祈福，向九皇大帝禮敬，感謝先人，對長輩盡孝心。',
    offerings: ['重陽糕', '菊花茶', '素果', '壽金'],
    prayerFor: ['長輩健康', '家族平安', '高升高就', '延年益壽'],
    godIds: [5, 15],
    color: '#8B7355',
    traditions: ['登高爬山', '插茱萸', '吃重陽糕', '探望長輩'],
    taboos: ['忌忽視長輩', '忌討論死亡話題'],
  },
  {
    id: 'dong-zhi',
    name: '冬至',
    solarDate: '12/22',
    type: 'solar',
    description: '冬至為一年中夜最長的一天，祭祖、吃湯圓，象徵圓滿。',
    worshipGuide: '冬至祭祖，感謝祖先庇佑，全家一起吃湯圓象徵團圓。可向神明祈求來年健康。',
    offerings: ['湯圓', '紅豆湯', '素果', '壽金'],
    prayerFor: ['闔家圓滿', '健康長壽', '來年更好', '祖先安息'],
    godIds: [2, 3, 6],
    color: '#2C3E50',
    traditions: ['吃湯圓（增一歲）', '祭祖', '全家圍爐'],
    taboos: ['忌在外過冬至（要回家）'],
  },
  {
    id: 'tail-ya',
    name: '尾牙',
    solarDate: '12/24',
    lunarDate: '12/16',
    type: 'lunar',
    description: '每年最後一次拜土地公，商家感謝員工，員工等老闆的表示。',
    worshipGuide: '最後一次的牙祭，感謝土地公一年的照顧，準備豐盛供品。',
    offerings: ['雞鴨魚', '五果', '刈金', '土地公金'],
    prayerFor: ['感謝神恩', '來年更旺', '員工和諧', '生意興隆'],
    godIds: [6],
    color: '#D4A017',
    traditions: ['辦尾牙宴', '老闆請客', '土地公祭拜'],
    taboos: ['忌雞頭朝向員工（象徵解雇）'],
  },
];

function getSolarKey(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getLocalDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function getFestivalForDate(date: Date): Festival | null {
  const lunar = getLunarDate(date);
  const lunarKey = `${lunar.month}/${lunar.day}`;
  const solarKey = getSolarKey(date);
  const festival = FESTIVALS_2026.find((item) => {
    if (item.type === 'lunar') {
      return !lunar.isLeapMonth && item.lunarDate === lunarKey;
    }
    return item.solarDate === solarKey;
  });

  return festival ? { ...festival, solarDate: solarKey } : null;
}

// 取得指定日期（預設今日）的節慶
export function getTodayFestival(date = new Date()): Festival | null {
  return getFestivalForDate(date);
}

// 取得未來 N 天內的節慶
export function getUpcomingFestivals(
  daysAhead = 30,
  fromDate = new Date(),
): (Festival & { daysUntil: number; date: Date })[] {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 12);
  const startDay = getLocalDayNumber(start);
  const results: (Festival & { daysUntil: number; date: Date })[] = [];

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset, 12);
    const festival = getFestivalForDate(date);
    if (festival) {
      results.push({
        ...festival,
        date,
        daysUntil: getLocalDayNumber(date) - startDay,
      });
    }
  }

  return results;
}

// 取得本月節慶
export function getMonthFestivals(date = new Date()): Festival[] {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const results: Festival[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const festival = getFestivalForDate(new Date(date.getFullYear(), date.getMonth(), day, 12));
    if (festival) results.push(festival);
  }
  return results;
}
