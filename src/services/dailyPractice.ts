// 每日修持：參拜簽到、連續天數與抄經紀錄（只存在本機）
import { getItem, setItem } from './storage';

const PRACTICE_KEY = '@daily_practice';

export interface SutraDraft {
  date: string;
  text: string;
}

export interface DailyPracticeState {
  /** 已簽到的本地日期 YYYY-MM-DD，遞增排序、不重複 */
  checkIns: string[];
  /** 每次抄完心經的本地日期 */
  sutraCopies: string[];
  sutraDraft?: SutraDraft;
}

const EMPTY_STATE: DailyPracticeState = { checkIns: [], sutraCopies: [] };

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d + days));
}

/** 連續天數：今天已簽到就從今天往回數；今天還沒簽到則從昨天往回數，不會因為還沒簽到就歸零。 */
export function calcStreak(checkIns: string[], today: string): number {
  const days = new Set(checkIns);
  let cursor = days.has(today) ? today : shiftDateKey(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

function withCheckIn(state: DailyPracticeState, today: string): DailyPracticeState {
  if (state.checkIns.includes(today)) return state;
  return { ...state, checkIns: [...state.checkIns, today].sort() };
}

export async function getDailyPractice(): Promise<DailyPracticeState> {
  try {
    const raw = await getItem(PRACTICE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<DailyPracticeState>;
    return {
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
      sutraCopies: Array.isArray(parsed.sutraCopies) ? parsed.sutraCopies : [],
      sutraDraft: parsed.sutraDraft,
    };
  } catch {
    return EMPTY_STATE;
  }
}

async function save(state: DailyPracticeState): Promise<DailyPracticeState> {
  await setItem(PRACTICE_KEY, JSON.stringify(state));
  return state;
}

export async function checkInToday(now: Date = new Date()): Promise<DailyPracticeState> {
  return save(withCheckIn(await getDailyPractice(), localDateKey(now)));
}

/** 抄完一部心經：記一次抄經，當天也算簽到，並清掉草稿。 */
export async function recordSutraCopy(now: Date = new Date()): Promise<DailyPracticeState> {
  const today = localDateKey(now);
  const state = withCheckIn(await getDailyPractice(), today);
  return save({ ...state, sutraCopies: [...state.sutraCopies, today], sutraDraft: undefined });
}

export async function saveSutraDraft(text: string, now: Date = new Date()): Promise<void> {
  const state = await getDailyPractice();
  await save({ ...state, sutraDraft: text ? { date: localDateKey(now), text } : undefined });
}
