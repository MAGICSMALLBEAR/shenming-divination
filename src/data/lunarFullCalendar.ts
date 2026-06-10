// 完整農民曆資料：12時辰、沖煞、五行納音、神煞
// 以「日干支」推算時辰吉凶，遵循傳統命理規則

export interface ShiChen {
  name: string;        // 子、丑…
  timeRange: string;   // 23:00-01:00
  wuxing: string;      // 五行
  auspicious: boolean; // 是否吉時
  yi: string[];        // 宜
  ji: string[];        // 忌
  note?: string;       // 備註
}

export interface LunarFullDayInfo {
  solarDate: string;
  lunarDate: string;        // 農曆X月X日
  ganZhi: string;           // 干支：甲子、乙丑…
  wuxingNaYin: string;      // 五行納音
  chongSha: string;         // 沖煞（沖XX煞XX）
  suiSha: string;           // 歲煞方位
  auspiciousGods: string[]; // 吉神
  inauspiciousGods: string[]; // 凶神
  shiChen: ShiChen[];       // 12時辰
  yi: string[];
  ji: string[];
  jieqi?: string;
  godBirthday?: string;
}

// 12時辰基本資料
const BASE_SHI_CHEN: Omit<ShiChen, 'auspicious' | 'yi' | 'ji'>[] = [
  { name: '子', timeRange: '23:00–01:00', wuxing: '水' },
  { name: '丑', timeRange: '01:00–03:00', wuxing: '土' },
  { name: '寅', timeRange: '03:00–05:00', wuxing: '木' },
  { name: '卯', timeRange: '05:00–07:00', wuxing: '木' },
  { name: '辰', timeRange: '07:00–09:00', wuxing: '土' },
  { name: '巳', timeRange: '09:00–11:00', wuxing: '火' },
  { name: '午', timeRange: '11:00–13:00', wuxing: '火' },
  { name: '未', timeRange: '13:00–15:00', wuxing: '土' },
  { name: '申', timeRange: '15:00–17:00', wuxing: '金' },
  { name: '酉', timeRange: '17:00–19:00', wuxing: '金' },
  { name: '戌', timeRange: '19:00–21:00', wuxing: '土' },
  { name: '亥', timeRange: '21:00–23:00', wuxing: '水' },
];

// 依日干推算吉時（五虎遁年法推算日起時）
// 甲己日：甲子時起；乙庚日：丙子時起；丙辛日：戊子時起；丁壬日：庚子時起；戊癸日：壬子時起
const AUSPICIOUS_BY_DAY_STEM: Record<string, number[]> = {
  甲: [0, 1, 4, 5, 8, 9],   // 子丑辰巳申酉吉
  己: [0, 1, 4, 5, 8, 9],
  乙: [2, 3, 4, 7, 8, 11],  // 寅卯辰未申亥吉
  庚: [2, 3, 4, 7, 8, 11],
  丙: [2, 3, 6, 7, 10, 11], // 寅卯午未戌亥吉
  辛: [2, 3, 6, 7, 10, 11],
  丁: [0, 1, 4, 5, 6, 9],   // 子丑辰巳午酉吉
  壬: [0, 1, 4, 5, 6, 9],
  戊: [0, 3, 4, 7, 8, 11],  // 子卯辰未申亥吉
  癸: [0, 3, 4, 7, 8, 11],
};

const SHI_CHEN_YI: Record<string, string[]> = {
  子: ['祭祀', '祈福', '靜思'],
  丑: ['農耕', '種植', '安座'],
  寅: ['出行', '求財', '開市'],
  卯: ['嫁娶', '訂盟', '求嗣'],
  辰: ['祭祀', '祈福', '開工'],
  巳: ['開市', '交易', '立券'],
  午: ['祈福', '出行', '求財'],
  未: ['嫁娶', '入宅', '安葬'],
  申: ['出行', '開市', '交易'],
  酉: ['祭祀', '祈福', '入宅'],
  戌: ['安葬', '祭祀', '沐浴'],
  亥: ['祭祀', '入宅', '安床'],
};

const SHI_CHEN_JI: Record<string, string[]> = {
  子: ['破土', '行喪'],
  丑: ['出行', '開市'],
  寅: ['嫁娶', '安葬'],
  卯: ['開工', '破土'],
  辰: ['嫁娶', '移徙'],
  巳: ['嫁娶', '安葬'],
  午: ['嫁娶', '安葬'],
  未: ['破土', '開工'],
  申: ['嫁娶', '祭祀'],
  酉: ['嫁娶', '行喪'],
  戌: ['嫁娶', '開工'],
  亥: ['嫁娶', '破土'],
};

// 根據日干支生成12時辰資料
function buildShiChen(dayStem: string): ShiChen[] {
  const auspiciousIndices = AUSPICIOUS_BY_DAY_STEM[dayStem] ?? [0, 2, 4, 6, 8, 10];
  return BASE_SHI_CHEN.map((base, i) => ({
    ...base,
    auspicious: auspiciousIndices.includes(i),
    yi: SHI_CHEN_YI[base.name] ?? [],
    ji: SHI_CHEN_JI[base.name] ?? [],
  }));
}

// 60甲子干支循環
const GAN_ZHI_60 = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];

// 五行納音（每兩個干支共用一個納音）
const NA_YIN = [
  '海中金','海中金','爐中火','爐中火','大林木','大林木','路傍土','路傍土','劍鋒金','劍鋒金',
  '山頭火','山頭火','澗下水','澗下水','城頭土','城頭土','白蠟金','白蠟金','楊柳木','楊柳木',
  '井泉水','井泉水','屋上土','屋上土','霹靂火','霹靂火','松柏木','松柏木','長流水','長流水',
  '砂中金','砂中金','山下火','山下火','平地木','平地木','壁上土','壁上土','金箔金','金箔金',
  '覆燈火','覆燈火','天河水','天河水','大驛土','大驛土','釵釧金','釵釧金','桑柘木','桑柘木',
  '大溪水','大溪水','沙中土','沙中土','天上火','天上火','石榴木','石榴木','大海水','大海水',
];

// 十二生肖沖煞對應
const CHONG_SHA: Record<string, { chong: string; sha: string }> = {
  子: { chong: '馬', sha: '南' }, 丑: { chong: '羊', sha: '東' },
  寅: { chong: '猴', sha: '北' }, 卯: { chong: '雞', sha: '西' },
  辰: { chong: '狗', sha: '南' }, 巳: { chong: '豬', sha: '東' },
  午: { chong: '鼠', sha: '北' }, 未: { chong: '牛', sha: '西' },
  申: { chong: '虎', sha: '南' }, 酉: { chong: '兔', sha: '東' },
  戌: { chong: '龍', sha: '北' }, 亥: { chong: '蛇', sha: '西' },
};

// 常見吉神
const AUSPICIOUS_GODS = ['天德', '月德', '天恩', '母倉', '時德', '民日', '三合', '天喜', '天醫', '月空'];
// 常見凶神
const INAUSPICIOUS_GODS = ['月破', '大耗', '五虛', '五離', '勾陳', '朱雀', '白虎', '天牢', '元武', '玄武'];

// 根據干支索引計算吉神凶神（簡化模型）
function getGodsForDay(ganzhiIndex: number): { auspicious: string[]; inauspicious: string[] } {
  const auspiciousCount = 2 + (ganzhiIndex % 3);
  const inauspiciousCount = 1 + (ganzhiIndex % 2);
  const aStart = ganzhiIndex % AUSPICIOUS_GODS.length;
  const iStart = ganzhiIndex % INAUSPICIOUS_GODS.length;

  const auspicious: string[] = [];
  const inauspicious: string[] = [];
  for (let i = 0; i < auspiciousCount; i++) {
    auspicious.push(AUSPICIOUS_GODS[(aStart + i) % AUSPICIOUS_GODS.length]);
  }
  for (let i = 0; i < inauspiciousCount; i++) {
    inauspicious.push(INAUSPICIOUS_GODS[(iStart + i) % INAUSPICIOUS_GODS.length]);
  }
  return { auspicious, inauspicious };
}

// 計算某日的完整農曆資訊（以 lunarCalendar 的基礎資料為輸入）
export function buildFullDayInfo(params: {
  solarDate: string;
  lunarMonth: number;
  lunarDay: number;
  yi: string[];
  ji: string[];
  jieqi?: string;
  godBirthday?: string;
  // 干支索引（從 2026-01-01 算起，丙午年甲子日）
  dayOffset: number;
}): LunarFullDayInfo {
  const { solarDate, lunarMonth, lunarDay, yi, ji, jieqi, godBirthday, dayOffset } = params;

  // 2026-01-01 對應干支索引（丙午年，日柱從甲子起算）
  // 2026-01-01 = 農曆11月13日，日干支為甲戌（索引10）
  const BASE_DAY_GANZHI_INDEX = 10;
  const ganzhiIndex = ((BASE_DAY_GANZHI_INDEX + dayOffset) % 60 + 60) % 60;
  const ganZhi = GAN_ZHI_60[ganzhiIndex];
  const stem = ganZhi[0];
  const branch = ganZhi[1];
  const naYin = NA_YIN[ganzhiIndex];
  const chongInfo = CHONG_SHA[branch] ?? { chong: '未知', sha: '未知' };
  const { auspicious, inauspicious } = getGodsForDay(ganzhiIndex);

  return {
    solarDate,
    lunarDate: `農曆${lunarMonth}月${lunarDay}日`,
    ganZhi,
    wuxingNaYin: naYin,
    chongSha: `沖${chongInfo.chong}（${chongInfo.sha}方）`,
    suiSha: `${chongInfo.sha}方`,
    auspiciousGods: auspicious,
    inauspiciousGods: inauspicious,
    shiChen: buildShiChen(stem),
    yi,
    ji,
    jieqi,
    godBirthday,
  };
}

// 取得今日完整農民曆資訊
export function getTodayFullLunarInfo(): LunarFullDayInfo | null {
  const today = new Date();
  const base = new Date(2026, 0, 1); // 2026-01-01
  const dayOffset = Math.round((today.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));

  // 從 lunarCalendar 取得基礎資料
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // 暫時先產生基本資料（實際應從 lunarCalendar 匯入）
  const solarDate = `${today.getMonth() + 1}/${today.getDate()}`;
  const lunarMonth = today.getMonth() + 4; // 粗略估算
  const lunarDay = today.getDate();

  return buildFullDayInfo({
    solarDate,
    lunarMonth: Math.min(lunarMonth, 12),
    lunarDay,
    yi: ['祭祀', '祈福', '出行'],
    ji: ['動土', '破土'],
    dayOffset,
  });
}

// 取得今日12時辰中的當前時辰
export function getCurrentShiChen(shiChen: ShiChen[]): ShiChen {
  const hour = new Date().getHours();
  const index = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  return shiChen[Math.min(index, 11)];
}

// 取得今日吉時列表
export function getAuspiciousHours(shiChen: ShiChen[]): ShiChen[] {
  return shiChen.filter(s => s.auspicious);
}
