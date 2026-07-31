import { gods, type God } from '@/data/gods';
import { GOD_BIRTHDAYS_LUNAR } from '@/data/lunarCalendar';
import {
  normalizeDeityReminderPreferences,
  type DeityReminderPreferences,
} from '@/services/deityReminderPreferences';

export interface LunarDateInfo {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  label: string;
}

export interface DeityObservance {
  id: string;
  godId: number;
  title: string;
  lunarMonth: number;
  lunarDay: number;
  traditionNote: string;
  region: string;
  sourceIds: string[];
  reviewStatus: 'government-reference' | 'tradition-needs-local-check';
  reviewedAt: string;
}

export interface DeityCalendarSource {
  id: string;
  title: string;
  organization: string;
  url: string;
}

export interface DeityObservanceOccurrence {
  date: Date;
  dateKey: string;
  solarLabel: string;
  lunar: LunarDateInfo;
  observance: DeityObservance;
  god: God;
}

export interface DeityWorshipDetails {
  worshipTips: string[];
  offerings: string[];
  prayerFor: string[];
}

export interface UpcomingDeityObservance {
  godId: number;
  name: string;
  title: string;
  lunarDateStr: string;
  solarDate: Date;
  solarDateStr: string;
  /** @deprecated 名稱保留給既有廟宇畫面；內容已是精確日期。 */
  approxSolarDate: string;
  daysUntil: number;
  offerings: string[];
  traditionNote: string;
}

export interface DeityObservanceReminder extends UpcomingDeityObservance {
  reminderDate: Date;
}

const MONTH_NUMBERS: Record<string, number> = {
  正月: 1,
  一月: 1,
  二月: 2,
  三月: 3,
  四月: 4,
  五月: 5,
  六月: 6,
  七月: 7,
  八月: 8,
  九月: 9,
  十月: 10,
  十一月: 11,
  冬月: 11,
  十二月: 12,
  臘月: 12,
};

const DAY_LABELS = [
  '',
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

export const DEITY_CALENDAR_SOURCES: readonly DeityCalendarSource[] = [
  {
    id: 'yonghe-temple-survey',
    title: '全國寺院宮廟祭典日期調查表（永和聖明宮）',
    organization: '新北市永和區公所',
    url: 'https://www.yonghe.ntpc.gov.tw/uploaddowndoc?file=govdata%2F202101251816070.pdf',
  },
  {
    id: 'taiwan-history-city-god',
    title: '竹山城隍廟創建新證：神明誕辰與地方差異',
    organization: '國史館臺灣文獻館',
    url: 'https://www.th.gov.tw/Epaper_Content/238/7087/',
  },
  {
    id: 'taiwan-folk-earth-god',
    title: '臺灣民俗文物辭典：福德正神（土地公）',
    organization: '國史館臺灣文獻館',
    url: 'https://dict.th.gov.tw/detailPage.aspx?Ca=287&ID=1249',
  },
  {
    id: 'taoyuan-festival-customs',
    title: '桃園地區廟會節慶與媽祖祭典習俗',
    organization: '桃園市桃園區公所',
    url: 'https://www.tao.tycg.gov.tw/cp.aspx?n=6262',
  },
  {
    id: 'taiwan-folk-context',
    title: '民俗文化活動與臺灣地方信仰',
    organization: '農業部',
    url: 'https://www.moa.gov.tw/ws.php?id=8303',
  },
];

/**
 * 台灣民間信仰中常見的紀念日。不同宮廟、祖廟與法脈可能採用不同日期，
 * 因此介面會一律顯示傳承差異提示，不把資料描述成唯一標準。
 */
const RAW_DEITY_OBSERVANCES: readonly Omit<
  DeityObservance,
  'region' | 'sourceIds' | 'reviewStatus' | 'reviewedAt'
>[] = [
  { id: 'jade-emperor-birthday', godId: 16, title: '玉皇上帝聖誕', lunarMonth: 1, lunarDay: 9, traditionNote: '民間通行紀念日' },
  { id: 'earth-god-birthday', godId: 6, title: '福德正神聖誕', lunarMonth: 2, lunarDay: 2, traditionNote: '俗稱頭牙，各地祭典略有差異' },
  { id: 'jigong-birthday', godId: 11, title: '濟公活佛聖誕', lunarMonth: 2, lunarDay: 2, traditionNote: '民間通行紀念日' },
  { id: 'wenchang-birthday', godId: 8, title: '文昌帝君聖誕', lunarMonth: 2, lunarDay: 3, traditionNote: '民間通行紀念日' },
  { id: 'guanyin-birthday', godId: 2, title: '觀世音菩薩聖誕', lunarMonth: 2, lunarDay: 19, traditionNote: '佛寺與民間常見紀念日' },
  { id: 'xuanti-birthday', godId: 10, title: '玄天上帝聖誕', lunarMonth: 3, lunarDay: 3, traditionNote: '民間通行紀念日' },
  { id: 'baosheng-birthday', godId: 5, title: '保生大帝聖誕', lunarMonth: 3, lunarDay: 15, traditionNote: '民間通行紀念日' },
  { id: 'zhusheng-birthday', godId: 7, title: '註生娘娘聖誕', lunarMonth: 3, lunarDay: 20, traditionNote: '民間通行紀念日' },
  { id: 'mazu-birthday', godId: 3, title: '天上聖母聖誕', lunarMonth: 3, lunarDay: 23, traditionNote: '民間通行紀念日' },
  { id: 'lv-dongbin-birthday', godId: 15, title: '孚佑帝君聖誕', lunarMonth: 4, lunarDay: 14, traditionNote: '民間通行紀念日' },
  { id: 'shennong-birthday', godId: 21, title: '神農大帝聖誕', lunarMonth: 4, lunarDay: 26, traditionNote: '民間通行紀念日' },
  { id: 'guandi-birthday', godId: 1, title: '關聖帝君聖誕', lunarMonth: 6, lunarDay: 24, traditionNote: '民間通行紀念日；部分廟宇另有紀念日' },
  { id: 'queen-mother-birthday', godId: 36, title: '王母娘娘聖誕', lunarMonth: 7, lunarDay: 18, traditionNote: '各宮廟傳承日期可能不同' },
  { id: 'ksitigarbha-birthday', godId: 19, title: '地藏王菩薩聖誕', lunarMonth: 7, lunarDay: 30, traditionNote: '佛寺與民間常見紀念日' },
  { id: 'matchmaker-day', godId: 13, title: '月下老人祈緣日', lunarMonth: 8, lunarDay: 15, traditionNote: '中秋祈緣習俗，非所有廟宇皆稱聖誕' },
  { id: 'nezha-birthday', godId: 12, title: '中壇元帥聖誕', lunarMonth: 9, lunarDay: 9, traditionNote: '民間通行紀念日' },
  { id: 'medicine-buddha-birthday', godId: 33, title: '藥師佛聖誕', lunarMonth: 9, lunarDay: 30, traditionNote: '佛寺常見紀念日' },
];

const GOVERNMENT_REFERENCE_IDS = new Set([
  'jade-emperor-birthday',
  'earth-god-birthday',
  'jigong-birthday',
  'wenchang-birthday',
  'guanyin-birthday',
  'xuanti-birthday',
  'mazu-birthday',
  'guandi-birthday',
  'nezha-birthday',
]);

export const DEITY_OBSERVANCES: readonly DeityObservance[] = RAW_DEITY_OBSERVANCES.map((item) => {
  const sourceIds = ['taiwan-folk-context'];
  if (GOVERNMENT_REFERENCE_IDS.has(item.id)) sourceIds.unshift('yonghe-temple-survey');
  if (item.id === 'earth-god-birthday') sourceIds.unshift('taiwan-folk-earth-god');
  if (item.id === 'mazu-birthday') sourceIds.unshift('taoyuan-festival-customs');
  if (item.id === 'guandi-birthday') sourceIds.unshift('taiwan-history-city-god');

  return {
    ...item,
    region: '臺灣民間信仰常見用法',
    sourceIds,
    reviewStatus: GOVERNMENT_REFERENCE_IDS.has(item.id)
      ? 'government-reference'
      : 'tradition-needs-local-check',
    reviewedAt: '2026-07-26',
  };
});

const chineseCalendarFormatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

function formatDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getLocalDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function getDeityWorshipDetails(godId: number): DeityWorshipDetails {
  const legacyDetails = GOD_BIRTHDAYS_LUNAR.find((item) => item.godId === godId);
  if (legacyDetails) {
    return {
      worshipTips: legacyDetails.worshipTips,
      offerings: legacyDetails.offerings,
      prayerFor: legacyDetails.prayerFor,
    };
  }

  return {
    worshipTips: ['先確認所屬宮廟的祭典時間與參拜規範', '以清淨、尊重與量力而為為原則'],
    offerings: ['鮮花', '素果', '清茶'],
    prayerFor: ['平安順遂', '身心安定', '福慧增長'],
  };
}

export function getLunarDate(date: Date): LunarDateInfo {
  const safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const parts = chineseCalendarFormatter.formatToParts(safeDate);
  const rawMonth = parts.find((part) => part.type === 'month')?.value ?? '';
  const rawDay = parts.find((part) => part.type === 'day')?.value ?? '';
  const rawYear = parts.find((part) => String(part.type) === 'relatedYear')?.value
    ?? parts.find((part) => part.type === 'year')?.value
    ?? '';
  const isLeapMonth = rawMonth.startsWith('閏');
  const monthName = rawMonth.replace(/^閏/, '');
  const month = MONTH_NUMBERS[monthName] ?? Number.parseInt(monthName, 10);
  const day = Number.parseInt(rawDay, 10);
  const year = Number.parseInt(rawYear, 10);

  if (!Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error(`無法解析農曆日期：${chineseCalendarFormatter.format(safeDate)}`);
  }

  const leapLabel = isLeapMonth ? '閏' : '';
  return {
    year: Number.isFinite(year) ? year : safeDate.getFullYear(),
    month,
    day,
    isLeapMonth,
    label: `農曆${leapLabel}${month}月${DAY_LABELS[day] ?? day}`,
  };
}

export function getDeityObservancesForDate(date: Date): DeityObservanceOccurrence[] {
  const lunar = getLunarDate(date);
  if (lunar.isLeapMonth) return [];

  return DEITY_OBSERVANCES
    .filter((item) => item.lunarMonth === lunar.month && item.lunarDay === lunar.day)
    .map((observance) => {
      const god = gods.find((item) => item.id === observance.godId);
      if (!god) return null;
      return {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12),
        dateKey: formatDateKey(date),
        solarLabel: `${date.getMonth() + 1}月${date.getDate()}日`,
        lunar,
        observance,
        god,
      };
    })
    .filter((item): item is DeityObservanceOccurrence => item !== null);
}

export function getDeityObservancesForSolarMonth(year: number, month: number): DeityObservanceOccurrence[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const occurrences: DeityObservanceOccurrence[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    occurrences.push(...getDeityObservancesForDate(new Date(year, month - 1, day, 12)));
  }

  return occurrences;
}

export function getDeityObservancesForSolarYear(year: number): DeityObservanceOccurrence[] {
  const occurrences: DeityObservanceOccurrence[] = [];
  for (let month = 1; month <= 12; month += 1) {
    occurrences.push(...getDeityObservancesForSolarMonth(year, month));
  }
  return occurrences;
}

export function getDeityObservanceById(id: string): DeityObservance | null {
  return DEITY_OBSERVANCES.find((item) => item.id === id) ?? null;
}

export function getDeityCalendarSources(observance: DeityObservance): DeityCalendarSource[] {
  return observance.sourceIds
    .map((id) => DEITY_CALENDAR_SOURCES.find((source) => source.id === id))
    .filter((source): source is DeityCalendarSource => Boolean(source));
}

export function getNextDeityObservanceOccurrence(
  observanceId: string,
  fromDate = new Date(),
): DeityObservanceOccurrence | null {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 12);
  for (let offset = 0; offset <= 800; offset += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset, 12);
    const match = getDeityObservancesForDate(date)
      .find((item) => item.observance.id === observanceId);
    if (match) return match;
  }
  return null;
}

export function getUpcomingDeityObservances(
  daysAhead = 60,
  fromDate = new Date(),
): UpcomingDeityObservance[] {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 12);
  const startDay = getLocalDayNumber(start);
  const results: UpcomingDeityObservance[] = [];

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset, 12);
    const daysUntil = getLocalDayNumber(date) - startDay;
    for (const item of getDeityObservancesForDate(date)) {
      const details = getDeityWorshipDetails(item.god.id);
      const solarDateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      results.push({
        godId: item.god.id,
        name: item.god.name,
        title: item.observance.title,
        lunarDateStr: item.lunar.label,
        solarDate: item.date,
        solarDateStr,
        approxSolarDate: solarDateStr,
        daysUntil,
        offerings: details.offerings,
        traditionNote: item.observance.traditionNote,
      });
    }
  }

  return results;
}

export function getDeityObservanceReminders(
  fromDate = new Date(),
  daysAhead = 370,
  preferences?: Partial<DeityReminderPreferences>,
): DeityObservanceReminder[] {
  const normalized = normalizeDeityReminderPreferences(preferences);
  const selectedGodIds = new Set(normalized.godIds);
  return getUpcomingDeityObservances(daysAhead + 1, fromDate)
    .filter((item) => normalized.mode === 'all' || selectedGodIds.has(item.godId))
    .map((item) => {
      const reminderDate = new Date(item.solarDate);
      reminderDate.setDate(reminderDate.getDate() - normalized.daysBefore);
      reminderDate.setHours(normalized.hour, 0, 0, 0);
      return { ...item, reminderDate };
    })
    .filter((item) => item.reminderDate > fromDate)
    .filter((item) => getLocalDayNumber(item.solarDate) - getLocalDayNumber(fromDate) <= daysAhead);
}

export function getTodayRecommendedDeity(date = new Date()): {
  godId: number;
  name: string;
  reason: string;
  isSpecialDay: boolean;
  worshipTips: string[];
  offerings: string[];
  prayerFor: string[];
} {
  const observance = getDeityObservancesForDate(date)[0];
  if (observance) {
    return {
      godId: observance.god.id,
      name: observance.god.name,
      reason: `今日是${observance.observance.title}，可依所屬宮廟傳承安排參拜。`,
      isSpecialDay: true,
      ...getDeityWorshipDetails(observance.god.id),
    };
  }

  const lunar = getLunarDate(date);
  if ([1, 2, 15, 16].includes(lunar.day)) {
    const earthGod = gods.find((god) => god.id === 6)!;
    return {
      godId: earthGod.id,
      name: earthGod.name,
      reason: `${lunar.label}是民間常見祭拜日，可向${earthGod.name}祈求家宅與出入平安。`,
      isSpecialDay: false,
      ...getDeityWorshipDetails(earthGod.id),
    };
  }

  const weekdayGodIds = [2, 1, 8, 5, 3, 6, 13];
  const god = gods.find((item) => item.id === weekdayGodIds[date.getDay()]) ?? gods[0];
  const details = getDeityWorshipDetails(god.id);
  return {
    godId: god.id,
    name: god.name,
    reason: `今日由${god.name}陪伴日常禮敬，先安定心念再說明所求。`,
    isSpecialDay: false,
    ...details,
  };
}
