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

export type DeityObservanceType = 'birthday' | 'ascension' | 'enlightenment' | 'renunciation';

export const DEITY_OBSERVANCE_TYPE_LABELS: Record<DeityObservanceType, string> = {
  birthday: '聖誕',
  ascension: '飛昇／得道',
  enlightenment: '成道',
  renunciation: '出家',
};

export interface DeityObservance {
  id: string;
  godId: number;
  title: string;
  eventType: DeityObservanceType;
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
  /** 來源狀態補充，例如原連結已失效。 */
  note?: string;
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
    note: '原連結已失效（2026-10-16 查核），所列日期另有下方民間神明生日表交叉印證。',
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
  {
    id: 'folk-daheng',
    title: '全年度神明生日表（農曆正月至十二月）',
    organization: '民間整理：daheng.org',
    url: 'https://daheng.org/god_bd/',
  },
  {
    id: 'folk-fude',
    title: '台灣神明生日完整一覽表',
    organization: '民間整理：拜拜日曆 fude.studio',
    url: 'https://www.fude.studio/calendar',
  },
  {
    id: 'folk-songxing',
    title: '神明生日一覽表',
    organization: '民間整理：songxingflower.tw',
    url: 'https://songxingflower.tw/%E7%A5%9E%E6%98%8E%E7%94%9F%E6%97%A5%E4%B8%80%E8%A6%BD%E8%A1%A8/',
  },
];

const FOLK_ALL = ['folk-daheng', 'folk-fude', 'folk-songxing'];

/**
 * 台灣民間信仰中常見的紀念日。不同宮廟、祖廟與法脈可能採用不同日期，
 * 因此介面會一律顯示傳承差異提示，不把資料描述成唯一標準。
 * folkSourceIds 列出日期一致的民間神明生日表；未收錄只有單一資料支持的日期。
 */
type RawDeityObservance = Omit<DeityObservance, 'region' | 'sourceIds' | 'reviewStatus'> & {
  folkSourceIds: readonly string[];
};

const RAW_DEITY_OBSERVANCES: readonly RawDeityObservance[] = [
  { id: 'jade-emperor-birthday', godId: 16, title: '玉皇上帝聖誕', eventType: 'birthday', lunarMonth: 1, lunarDay: 9, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'earth-god-birthday', godId: 6, title: '福德正神聖誕', eventType: 'birthday', lunarMonth: 2, lunarDay: 2, traditionNote: '俗稱頭牙，各地祭典略有差異', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'jigong-birthday', godId: 11, title: '濟公活佛聖誕', eventType: 'birthday', lunarMonth: 2, lunarDay: 2, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'wenchang-birthday', godId: 8, title: '文昌帝君聖誕', eventType: 'birthday', lunarMonth: 2, lunarDay: 3, traditionNote: '民間通行紀念日', folkSourceIds: ['folk-fude'], reviewedAt: '2026-07-26' },
  { id: 'guanyin-birthday', godId: 2, title: '觀世音菩薩聖誕', eventType: 'birthday', lunarMonth: 2, lunarDay: 19, traditionNote: '佛寺與民間常見紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'xuanti-birthday', godId: 10, title: '玄天上帝聖誕', eventType: 'birthday', lunarMonth: 3, lunarDay: 3, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'baosheng-birthday', godId: 5, title: '保生大帝聖誕', eventType: 'birthday', lunarMonth: 3, lunarDay: 15, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'zhusheng-birthday', godId: 7, title: '註生娘娘聖誕', eventType: 'birthday', lunarMonth: 3, lunarDay: 20, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'mazu-birthday', godId: 3, title: '天上聖母聖誕', eventType: 'birthday', lunarMonth: 3, lunarDay: 23, traditionNote: '民間通行紀念日', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-07-26' },
  { id: 'lv-dongbin-birthday', godId: 15, title: '孚佑帝君聖誕', eventType: 'birthday', lunarMonth: 4, lunarDay: 14, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'shennong-birthday', godId: 21, title: '神農大帝聖誕', eventType: 'birthday', lunarMonth: 4, lunarDay: 26, traditionNote: '民間通行紀念日；部分資料作四月廿八', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-07-26' },
  { id: 'guandi-birthday', godId: 1, title: '關聖帝君聖誕', eventType: 'birthday', lunarMonth: 6, lunarDay: 24, traditionNote: '民間通行紀念日；部分廟宇另有紀念日', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-07-26' },
  { id: 'queen-mother-birthday', godId: 36, title: '王母娘娘聖誕', eventType: 'birthday', lunarMonth: 7, lunarDay: 18, traditionNote: '各宮廟傳承日期可能不同', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'ksitigarbha-birthday', godId: 19, title: '地藏王菩薩聖誕', eventType: 'birthday', lunarMonth: 7, lunarDay: 30, traditionNote: '佛寺與民間常見紀念日', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-07-26' },
  { id: 'matchmaker-day', godId: 13, title: '月下老人祈緣日', eventType: 'birthday', lunarMonth: 8, lunarDay: 15, traditionNote: '中秋祈緣習俗，非所有廟宇皆稱聖誕', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'nezha-birthday', godId: 12, title: '中壇元帥聖誕', eventType: 'birthday', lunarMonth: 9, lunarDay: 9, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-07-26' },
  { id: 'medicine-buddha-birthday', godId: 33, title: '藥師佛聖誕', eventType: 'birthday', lunarMonth: 9, lunarDay: 30, traditionNote: '佛寺常見紀念日；部分資料作九月廿九', folkSourceIds: ['folk-daheng', 'folk-songxing'], reviewedAt: '2026-07-26' },
  // 2026-10-16 擴充：至少兩份民間神明生日表日期一致才收錄，一律列為需向所屬宮廟確認
  { id: 'guandi-ascension', godId: 1, title: '關聖帝君飛昇紀念日', eventType: 'ascension', lunarMonth: 1, lunarDay: 13, traditionNote: '民間相傳關聖帝君於此日得道飛昇，部分宮廟以此日祝壽', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-10-16' },
  { id: 'guanyin-enlightenment', godId: 2, title: '觀世音菩薩成道紀念日', eventType: 'enlightenment', lunarMonth: 6, lunarDay: 19, traditionNote: '佛寺與民間常見紀念日，部分資料稱得道紀念', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'guanyin-renunciation', godId: 2, title: '觀世音菩薩出家紀念日', eventType: 'renunciation', lunarMonth: 9, lunarDay: 19, traditionNote: '佛寺與民間常見紀念日', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-10-16' },
  { id: 'city-god-birthday', godId: 14, title: '城隍爺聖誕', eventType: 'birthday', lunarMonth: 5, lunarDay: 13, traditionNote: '以臺北霞海城隍廟等常見日期為準；各地城隍廟日期不同，例如臺北府城隍十月初一、臺灣府城隍五月十一', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'qingshui-birthday', godId: 17, title: '清水祖師佛辰', eventType: 'birthday', lunarMonth: 1, lunarDay: 6, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'yaochi-birthday', godId: 18, title: '瑤池金母聖誕', eventType: 'birthday', lunarMonth: 7, lunarDay: 18, traditionNote: '民間多與王母娘娘同日祝壽，各宮廟傳承可能不同', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'wenfu-birthday', godId: 20, title: '溫府千歲聖誕', eventType: 'birthday', lunarMonth: 11, lunarDay: 1, traditionNote: '王爺信仰日期依各宮廟主祀而異，請以所屬宮廟為準', folkSourceIds: ['folk-daheng', 'folk-songxing'], reviewedAt: '2026-10-16' },
  { id: 'tianguan-birthday', godId: 22, title: '上元天官大帝聖誕', eventType: 'birthday', lunarMonth: 1, lunarDay: 15, traditionNote: '上元節，三官大帝中的天官', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'diguan-birthday', godId: 22, title: '中元地官大帝聖誕', eventType: 'birthday', lunarMonth: 7, lunarDay: 15, traditionNote: '中元節，三官大帝中的地官', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'shuiguan-birthday', godId: 22, title: '下元水官大帝聖誕', eventType: 'birthday', lunarMonth: 10, lunarDay: 15, traditionNote: '下元節，三官大帝中的水官', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'sanshan-birthday', godId: 23, title: '三山國王千秋', eventType: 'birthday', lunarMonth: 2, lunarDay: 25, traditionNote: '部分資料作二月十五，各宮廟傳承不同', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-10-16' },
  { id: 'guangze-birthday', godId: 24, title: '廣澤尊王千秋', eventType: 'birthday', lunarMonth: 8, lunarDay: 22, traditionNote: '民間通行紀念日', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-10-16' },
  { id: 'kaizhang-birthday', godId: 25, title: '開漳聖王千秋', eventType: 'birthday', lunarMonth: 2, lunarDay: 16, traditionNote: '部分宮廟於二月十五祝壽', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'huye-birthday', godId: 27, title: '虎爺聖誕', eventType: 'birthday', lunarMonth: 6, lunarDay: 6, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'xuannu-birthday', godId: 28, title: '九天玄女聖誕', eventType: 'birthday', lunarMonth: 2, lunarDay: 15, traditionNote: '部分宮廟於八月十八祝壽', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'taisui-birthday', godId: 29, title: '值年太歲星君千秋', eventType: 'birthday', lunarMonth: 7, lunarDay: 19, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'linshui-birthday', godId: 30, title: '臨水夫人千秋', eventType: 'birthday', lunarMonth: 1, lunarDay: 15, traditionNote: '陳靖姑（順天聖母）千秋；三奶夫人中李姑、林姑另有紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'qitian-birthday', godId: 34, title: '齊天大聖佛辰', eventType: 'birthday', lunarMonth: 10, lunarDay: 12, traditionNote: '民間通行紀念日；各宮廟傳承可能不同', folkSourceIds: ['folk-daheng', 'folk-songxing'], reviewedAt: '2026-10-16' },
  { id: 'qiaosheng-birthday', godId: 37, title: '巧聖先師千秋', eventType: 'birthday', lunarMonth: 5, lunarDay: 7, traditionNote: '魯班公紀念日，部分資料另記十二月二十', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'dongyue-birthday', godId: 38, title: '東嶽大帝聖誕', eventType: 'birthday', lunarMonth: 3, lunarDay: 28, traditionNote: '民間通行紀念日', folkSourceIds: ['folk-daheng', 'folk-fude'], reviewedAt: '2026-10-16' },
  { id: 'yanluo-birthday', godId: 39, title: '五殿閻羅天子聖誕', eventType: 'birthday', lunarMonth: 1, lunarDay: 8, traditionNote: '十殿閻王中第五殿閻羅王之紀念日', folkSourceIds: ['folk-daheng', 'folk-songxing'], reviewedAt: '2026-10-16' },
  { id: 'chifu-birthday', godId: 42, title: '池府千歲聖誕', eventType: 'birthday', lunarMonth: 6, lunarDay: 18, traditionNote: '王爺信仰日期依各宮廟主祀而異，請以所屬宮廟為準', folkSourceIds: ['folk-fude', 'folk-songxing'], reviewedAt: '2026-10-16' },
  { id: 'guanping-birthday', godId: 44, title: '關平太子聖誕', eventType: 'birthday', lunarMonth: 5, lunarDay: 13, traditionNote: '部分資料作五月廿八', folkSourceIds: ['folk-daheng', 'folk-songxing'], reviewedAt: '2026-10-16' },
  { id: 'taiyang-birthday', godId: 48, title: '太陽星君聖誕', eventType: 'birthday', lunarMonth: 3, lunarDay: 19, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'taiyin-birthday', godId: 49, title: '太陰星君聖誕', eventType: 'birthday', lunarMonth: 8, lunarDay: 15, traditionNote: '中秋節拜月習俗', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'zhangtianshi-birthday', godId: 54, title: '張天師聖誕', eventType: 'birthday', lunarMonth: 5, lunarDay: 18, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'huatuo-birthday', godId: 55, title: '華陀先師千秋', eventType: 'birthday', lunarMonth: 4, lunarDay: 18, traditionNote: '民間通行紀念日', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'leigong-birthday', godId: 57, title: '雷聲普化天尊聖誕', eventType: 'birthday', lunarMonth: 8, lunarDay: 5, traditionNote: '部分宮廟於六月廿四祝壽（雷祖聖誕）', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
  { id: 'shakyamuni-birthday', godId: 58, title: '釋迦牟尼佛聖誕', eventType: 'birthday', lunarMonth: 4, lunarDay: 8, traditionNote: '浴佛節', folkSourceIds: FOLK_ALL, reviewedAt: '2026-10-16' },
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

export const DEITY_OBSERVANCES: readonly DeityObservance[] = RAW_DEITY_OBSERVANCES.map(({ folkSourceIds, ...item }) => {
  const sourceIds = ['taiwan-folk-context', ...folkSourceIds];
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
