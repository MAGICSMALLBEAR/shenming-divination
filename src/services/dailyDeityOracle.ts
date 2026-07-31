import { getFestivalForDate, type Festival } from '@/data/festivals';
import { getPoemsByGod, gods, type God } from '@/data/gods';
import type { Poem } from '@/data/poems/leiyushi';
import {
  getDeityObservancesForDate,
  type DeityObservanceOccurrence,
} from '@/services/lunarDeityCalendar';

export const DAILY_DEITY_CALENDAR_VERSION = 'deity-daily-v2';

export type DailyDeityReason = 'observance' | 'festival' | 'rotation';

export interface DailyDeityOracle {
  dateKey: string;
  calendarVersion: string;
  god: God;
  poem: Poem;
  reason: DailyDeityReason;
  reasonLabel: string;
  dailyMessage: string;
  dailyAction: string;
  festival: Festival | null;
  observances: DeityObservanceOccurrence[];
}

const DAILY_ACTIONS: Record<God['category'], readonly string[]> = {
  war: ['守住一項承諾，把該完成的事情做完。', '面對一件拖延的事，先踏出最小的一步。'],
  compassion: ['主動關心一個人，也留一點溫柔給自己。', '遇到不同意見時，先聽完再回應。'],
  sea: ['替今天保留彈性，遇到變化先穩住方向。', '整理一段旅程或計畫，補上被忽略的細節。'],
  health: ['留意身體的訊號，安排一段真正的休息。', '今天早一點睡，讓身心都有恢復的空間。'],
  wealth: ['整理一筆支出，先守成再思考開展。', '珍惜現有資源，把一件物品用到最合適的位置。'],
  general: ['完成一件小事，讓心念從混亂回到清楚。', '安靜三分鐘，寫下今天最重要的一件事。'],
  heaven: ['把目光放遠，不被一時得失牽著走。', '檢查自己的原則，做一個問心無愧的選擇。'],
  guardian: ['整理環境與界線，保護真正重要的人事物。', '勇敢拒絕一件消耗你、卻沒有必要的事情。'],
  release: ['放下一件反覆責怪自己的往事。', '清理一件不再需要的物品，替心留出空間。'],
  growth: ['學習一個新觀點，讓今天比昨天多一點理解。', '把一個大目標拆成今天能完成的小步驟。'],
};

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function formatDailyDeityDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getDayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86400000) + 1;
}

function getRotationForYear(year: number): God[] {
  return [...gods].sort((left, right) => {
    const leftScore = hashString(`${DAILY_DEITY_CALENDAR_VERSION}|${year}|${left.id}`);
    const rightScore = hashString(`${DAILY_DEITY_CALENDAR_VERSION}|${year}|${right.id}`);
    return leftScore - rightScore || left.id - right.id;
  });
}

function chooseGod(
  date: Date,
  observances: DeityObservanceOccurrence[],
  festival: Festival | null,
): { god: God; reason: DailyDeityReason } {
  if (observances.length > 0) {
    return { god: observances[0].god, reason: 'observance' };
  }

  if (festival) {
    const festivalGod = festival.godIds
      .map((godId) => gods.find((god) => god.id === godId))
      .find((god): god is God => Boolean(god));
    if (festivalGod) return { god: festivalGod, reason: 'festival' };
  }

  const rotation = getRotationForYear(date.getFullYear());
  return {
    god: rotation[(getDayOfYear(date) - 1) % rotation.length],
    reason: 'rotation',
  };
}

function chooseDailyPoem(dateKey: string, god: God): Poem {
  const poems = getPoemsByGod(god.id);
  const dailySafePoems = poems.filter((poem) => poem.level !== '下下' && poem.level !== '中下');
  const pool = dailySafePoems.length > 0 ? dailySafePoems : poems;
  return pool[hashString(`${DAILY_DEITY_CALENDAR_VERSION}|${dateKey}|${god.id}`) % pool.length];
}

export function getDailyDeityOracle(date = new Date()): DailyDeityOracle {
  const dateKey = formatDailyDeityDateKey(date);
  const observances = getDeityObservancesForDate(date);
  const festival = getFestivalForDate(date);
  const { god, reason } = chooseGod(date, observances, festival);
  const poem = chooseDailyPoem(dateKey, god);
  const actions = DAILY_ACTIONS[god.category];
  const dailyAction = actions[hashString(`${dateKey}|${god.category}|action`) % actions.length];

  return {
    dateKey,
    calendarVersion: DAILY_DEITY_CALENDAR_VERSION,
    god,
    poem,
    reason,
    reasonLabel: reason === 'observance'
      ? `今日是${observances[0].observance.title}，由${god.name}陪伴日課。`
      : festival
        ? `今日逢${festival.name}，由${god.name}陪伴日課。`
        : `依年度神明輪值，今日由${god.name}陪伴你安定心念。`,
    dailyMessage: poem.jieYue.general || poem.vernacular,
    dailyAction,
    festival,
    observances,
  };
}
