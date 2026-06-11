// 完整八字命理服務：四柱、十神、大運、流年
// 基於傳統命理學規則

export interface Pillar {
  gan: string;   // 天干
  zhi: string;   // 地支
  naYin: string; // 五行納音
  wuxing: string; // 天干五行
}

export interface ShiShen {
  name: string;   // 十神名稱
  trait: string;  // 特質說明
}

export interface DaYun {
  startAge: number;
  endAge: number;
  pillar: Pillar;
  overview: string;
}

export interface FullBaziInfo {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;       // 日主（日干）
  dayMasterWuxing: string; // 日主五行
  shiShen: {               // 四柱十神
    year: ShiShen;
    month: ShiShen;
    hour: ShiShen;
  };
  wuxingBalance: Record<string, number>; // 五行強弱
  daYun: DaYun[];          // 大運（10年一運）
  yearFortune2026: string; // 2026流年解析
  personality: string;     // 命格個性
  lifeTheme: string;       // 人生主題
}

// 天干
const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
// 地支
const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 天干五行
const GAN_WUXING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

// 天干陰陽
const GAN_YIN_YANG: Record<string, string> = {
  甲: '陽', 乙: '陰', 丙: '陽', 丁: '陰', 戊: '陽',
  己: '陰', 庚: '陽', 辛: '陰', 壬: '陽', 癸: '陰',
};

// 地支五行
const ZHI_WUXING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

// 60甲子干支
const GAN_ZHI_60 = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];

const NA_YIN: string[] = [
  '海中金','海中金','爐中火','爐中火','大林木','大林木','路傍土','路傍土','劍鋒金','劍鋒金',
  '山頭火','山頭火','澗下水','澗下水','城頭土','城頭土','白蠟金','白蠟金','楊柳木','楊柳木',
  '井泉水','井泉水','屋上土','屋上土','霹靂火','霹靂火','松柏木','松柏木','長流水','長流水',
  '砂中金','砂中金','山下火','山下火','平地木','平地木','壁上土','壁上土','金箔金','金箔金',
  '覆燈火','覆燈火','天河水','天河水','大驛土','大驛土','釵釧金','釵釧金','桑柘木','桑柘木',
  '大溪水','大溪水','沙中土','沙中土','天上火','天上火','石榴木','石榴木','大海水','大海水',
];

// 十神關係（日主 → 相對天干）
function getShiShen(dayMaster: string, targetGan: string): ShiShen {
  const dm = GAN_WUXING[dayMaster];
  const tg = GAN_WUXING[targetGan];
  const dmYy = GAN_YIN_YANG[dayMaster];
  const tgYy = GAN_YIN_YANG[targetGan];
  const same = dmYy === tgYy;

  const wuxingRelation = getWuxingRelation(dm, tg);

  if (dayMaster === targetGan) return { name: '比肩', trait: '平輩、兄弟姊妹、競爭' };

  switch (wuxingRelation) {
    case 'same':
      return same
        ? { name: '比肩', trait: '兄弟、平輩、競爭心強' }
        : { name: '劫財', trait: '奪財、合作又競爭' };
    case 'generates_me': // 生我者
      return same
        ? { name: '偏印', trait: '偏才、獨特學習、藝術' }
        : { name: '正印', trait: '正規教育、母親、貴人' };
    case 'i_generate': // 我生者
      return same
        ? { name: '食神', trait: '才藝、口福、子女緣' }
        : { name: '傷官', trait: '叛逆、才華、破規則' };
    case 'controls_me': // 剋我者
      return same
        ? { name: '偏官', trait: '七殺、挑戰、壓力' }
        : { name: '正官', trait: '正官、事業、紀律' };
    case 'i_control': // 我剋者
      return same
        ? { name: '偏財', trait: '偏財、父親、投機財' }
        : { name: '正財', trait: '正財、穩定收入、配偶' };
    default:
      return { name: '未知', trait: '' };
  }
}

type WuxingRel = 'same' | 'generates_me' | 'i_generate' | 'controls_me' | 'i_control';

function getWuxingRelation(base: string, target: string): WuxingRel {
  if (base === target) return 'same';
  const generates: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const controls: Record<string, string>  = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  if (generates[target] === base) return 'generates_me';
  if (generates[base] === target) return 'i_generate';
  if (controls[target] === base) return 'controls_me';
  if (controls[base] === target) return 'i_control';
  return 'same';
}

// 年柱計算（天干地支）
function getYearPillar(year: number): Pillar {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  const gz = GAN_ZHI_60[((year - 4) % 60 + 60) % 60];
  const naYin = NA_YIN[((year - 4) % 60 + 60) % 60];
  return {
    gan: TIAN_GAN[(ganIndex + 10) % 10],
    zhi: DI_ZHI[(zhiIndex + 12) % 12],
    naYin,
    wuxing: GAN_WUXING[gz[0]],
  };
}

// 月柱計算（依出生月份，丙辛年從戊寅月起）
function getMonthPillar(year: number, month: number): Pillar {
  const yearGanIndex = (year - 4) % 10;
  // 月干起法：甲己年從丙寅，乙庚年從戊寅，丙辛年從庚寅，丁壬年從壬寅，戊癸年從甲寅
  const monthGanStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearGanIndex]; // 天干索引起點
  const monthGanIndex = (monthGanStart + (month - 1)) % 10;
  const monthZhiIndex = (month + 1) % 12; // 寅月=1月，卯月=2月...
  const gzIndex = (monthGanIndex * 6 + Math.floor(monthZhiIndex / 2)) % 60;
  const gz = GAN_ZHI_60[gzIndex] ?? GAN_ZHI_60[0];
  return {
    gan: TIAN_GAN[monthGanIndex],
    zhi: DI_ZHI[monthZhiIndex],
    naYin: NA_YIN[gzIndex],
    wuxing: GAN_WUXING[TIAN_GAN[monthGanIndex]],
  };
}

// 日柱計算（以 2026-01-01 = 乙未 為基準，index=31，依 1900-01-31=甲子 JDN 推算）
function getDayPillar(year: number, month: number, day: number): Pillar {
  const base = new Date(2026, 0, 1);
  const target = new Date(year, month - 1, day);
  const diff = Math.round((target.getTime() - base.getTime()) / 86400000);
  const BASE_INDEX = 31; // 乙未=31
  const gzIndex = ((BASE_INDEX + diff) % 60 + 60) % 60;
  const gz = GAN_ZHI_60[gzIndex];
  return {
    gan: gz[0],
    zhi: gz[1],
    naYin: NA_YIN[gzIndex],
    wuxing: GAN_WUXING[gz[0]],
  };
}

// 時柱計算
function getHourPillar(dayGan: string, hour: number): Pillar {
  const zhiIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  // 時干起法：甲己日從甲子，乙庚日從丙子，丙辛日從戊子，丁壬日從庚子，戊癸日從壬子
  const hourGanStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][dayGanIndex];
  const hourGanIndex = (hourGanStart + zhiIndex) % 10;
  const gzIndex = (hourGanIndex * 6 + Math.floor(zhiIndex / 2)) % 60;
  return {
    gan: TIAN_GAN[hourGanIndex],
    zhi: DI_ZHI[zhiIndex],
    naYin: NA_YIN[gzIndex < 60 ? gzIndex : 0],
    wuxing: GAN_WUXING[TIAN_GAN[hourGanIndex]],
  };
}

// 五行強弱統計
function calcWuxingBalance(pillars: Pillar[]): Record<string, number> {
  const balance: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach(p => {
    balance[GAN_WUXING[p.gan]] = (balance[GAN_WUXING[p.gan]] ?? 0) + 1;
    balance[ZHI_WUXING[p.zhi]] = (balance[ZHI_WUXING[p.zhi]] ?? 0) + 1;
  });
  return balance;
}

// 大運計算（依月柱順逆行，每10年一運）
function calcDaYun(monthPillar: Pillar, yearGan: string, gender: 'male' | 'female', birthYear: number): DaYun[] {
  const yearGanIndex = TIAN_GAN.indexOf(yearGan);
  const isYangYear = yearGanIndex % 2 === 0;
  const isMale = gender === 'male';
  // 陽男陰女順行，陰男陽女逆行
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale);

  const monthGzIndex = GAN_ZHI_60.indexOf(monthPillar.gan + monthPillar.zhi);
  const dayun: DaYun[] = [];

  for (let i = 1; i <= 8; i++) {
    const gzIndex = ((monthGzIndex + (forward ? i : -i)) % 60 + 60) % 60;
    const gz = GAN_ZHI_60[gzIndex];
    const startAge = i * 10 - 9;
    const wuxing = GAN_WUXING[gz[0]];
    const overviews: Record<string, string> = {
      木: '事業成長期，適合拓展、學習、植根。',
      火: '名聲旺盛期，機會多，但需控制情緒。',
      土: '穩健積累期，踏實工作，家庭穩固。',
      金: '財富豐收期，事業有成，但防金剋木。',
      水: '智慧洞察期，靈感豐富，需防漂泊不定。',
    };
    dayun.push({
      startAge,
      endAge: startAge + 9,
      pillar: {
        gan: gz[0],
        zhi: gz[1],
        naYin: NA_YIN[gzIndex],
        wuxing,
      },
      overview: overviews[wuxing] ?? '平穩運行期。',
    });
  }
  return dayun;
}

// 命格個性描述（依日主）
const DAY_MASTER_PERSONALITY: Record<string, string> = {
  甲: '性格正直、有理想、追求上進，如大樹般頂天立地，領導力強但有時固執。',
  乙: '溫柔細膩、適應力強、善於交際，如藤蔓般靈活，處世圓融。',
  丙: '熱情開朗、慷慨大方、追求光明，如太陽般溫暖，但有時過於衝動。',
  丁: '聰明敏感、有藝術氣質、心思細膩，如燭光般溫柔，但有時易波動。',
  戊: '穩重踏實、寬厚包容、重情義，如大山般可靠，但有時過於保守。',
  己: '細心謹慎、善於規劃、重細節，如田地般豐饒，適合幕後工作。',
  庚: '果決剛毅、有執行力、重義氣，如寶劍般銳利，但有時過於強硬。',
  辛: '精緻優雅、完美主義、有品味，如珠寶般閃亮，重視外在形象。',
  壬: '聰明才智、包容萬象、善於謀略，如大海般深邃，思維靈活。',
  癸: '直覺敏銳、富有同情心、神秘感強，如細雨般滋潤，有療癒能力。',
};

// 2026丙午流年分析（依日主）
const LIU_NIAN_2026: Record<string, string> = {
  甲: '2026丙午年，甲木生丙火（食傷），才華展現機會多，適合創作、演講、表達自我。財運隨才氣旺，但要避免洩氣過度。',
  乙: '2026丙午年，乙木生丙火（食傷），個人魅力提升，社交活躍，有機會透過才藝獲財。情感豐富，有桃花機緣。',
  丙: '2026丙午年，丙火比肩，競爭加劇，需突出個人特色。人際關係複雜，合作需謹慎，財務注意破耗。',
  丁: '2026丙午年，丙火生丁（劫財），有貴人但也有財務競爭，情感關係有轉折，需要主動出擊。',
  戊: '2026丙午年，丙火生戊土（印綬），學習運佳，有貴人提攜，適合進修、考試、爭取晉升。',
  己: '2026丙午年，丙火生己土（偏印），靈感豐富，適合藝術創作，但要避免思慮過多而猶豫不決。',
  庚: '2026丙午年，丙火剋庚金（七殺），工作壓力大，有挑戰需克服，但突破後能提升實力。健康需注意。',
  辛: '2026丙午年，丙火剋辛金（正官），有上司或長輩的要求，責任感增加，適合努力表現，職場有正面發展。',
  壬: '2026丙午年，壬水剋丙火（偏財），財運旺，有機會開拓財源，投資可積極，但要防破財陷阱。',
  癸: '2026丙午年，癸水剋丙火（正財），正財運強，穩定收入有望增加，感情穩定，適合置產或大採購。',
};

// 主要對外 API
export function calculateFullBazi(params: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  gender?: 'male' | 'female';
}): FullBaziInfo {
  const { birthYear, birthMonth, birthDay, birthHour = 12, gender = 'male' } = params;

  const year = getYearPillar(birthYear);
  const month = getMonthPillar(birthYear, birthMonth);
  const day = getDayPillar(birthYear, birthMonth, birthDay);
  const hour = getHourPillar(day.gan, birthHour);

  const dayMaster = day.gan;
  const dayMasterWuxing = GAN_WUXING[dayMaster];

  const shiShen = {
    year:  getShiShen(dayMaster, year.gan),
    month: getShiShen(dayMaster, month.gan),
    hour:  getShiShen(dayMaster, hour.gan),
  };

  const wuxingBalance = calcWuxingBalance([year, month, day, hour]);
  const daYun = calcDaYun(month, year.gan, gender, birthYear);
  const personality = DAY_MASTER_PERSONALITY[dayMaster] ?? '個性均衡，處事平穩。';
  const yearFortune2026 = LIU_NIAN_2026[dayMaster] ?? '流年平順，謹慎行事，穩中求進。';

  // 人生主題（依五行強弱）
  const sorted = Object.entries(wuxingBalance).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const lifeThemes: Record<string, string> = {
    木: '生命主題：成長、擴展、開創。你天生具有進取精神，人生以不斷突破為樂。',
    火: '生命主題：熱情、表達、領導。你具有強大的感染力，人生以影響他人為使命。',
    土: '生命主題：穩固、包容、傳承。你重視家庭與根基，人生以建立持久事業為目標。',
    金: '生命主題：精煉、正義、執行。你追求卓越完美，人生以成就感為動力。',
    水: '生命主題：智慧、流通、適應。你靈活善變，人生以追求知識與自由為核心。',
  };
  const lifeTheme = lifeThemes[strongest] ?? '生命主題多元，五行均衡發展。';

  return {
    year, month, day, hour,
    dayMaster, dayMasterWuxing,
    shiShen, wuxingBalance, daYun,
    yearFortune2026, personality, lifeTheme,
  };
}

// 取得當前大運
export function getCurrentDaYun(daYun: DaYun[], birthYear: number): DaYun | null {
  const age = new Date().getFullYear() - birthYear;
  return daYun.find(d => age >= d.startAge && age <= d.endAge) ?? null;
}

// 五行缺失分析
export function getMissingWuxing(balance: Record<string, number>): string[] {
  return Object.entries(balance).filter(([, v]) => v === 0).map(([k]) => k);
}
