import { getFavorites, getHistory, type DivinationRecord } from './storage';

export interface Stats {
  totalDraws: number;
  favorites: number;
  topGod: { name: string; count: number };
  topCategory: { name: string; count: number };
  topPoems: { number: number; count: number }[];
  levelDistribution: { level: string; count: number }[];
  weeklyDraws: { day: string; count: number }[];
  verification: {
    tracked: number;
    matched: number;
    unmatched: number;
    pending: number;
  };
}

export interface YearlySummary {
  year: number;
  totalDraws: number;
  topGod: { name: string; count: number } | null;
  topCategory: { name: string; count: number } | null;
  topPoem: { number: number; level: string; count: number } | null;
  luckyRate: number;
  peakMonth: string | null;
  longestStreak: number;
  mostActiveWeekday: string | null;
}

const CATEGORY_NAMES: Record<string, string> = {
  career: '事業工作',
  love: '感情姻緣',
  wealth: '財運投資',
  health: '健康身體',
  study: '學業考試',
  family: '家庭家運',
  travel: '出行遷移',
  general: '綜合運勢',
};

const WEEKDAY_NAMES = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getLongestStreak(records: DivinationRecord[]): number {
  if (records.length === 0) return 0;

  const uniqueDays = [...new Set(records.map((record) => getDateKey(record.timestamp)))].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const [prevYear, prevMonth, prevDate] = uniqueDays[index - 1].split('-').map(Number);
    const [year, month, date] = uniqueDays[index].split('-').map(Number);
    const previous = new Date(prevYear, prevMonth, prevDate);
    const currentDate = new Date(year, month, date);
    const diff = Math.round((currentDate.getTime() - previous.getTime()) / 86400000);

    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export async function getStats(): Promise<Stats> {
  const history = await getHistory();
  const favorites = await getFavorites();

  const godCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const poemCounts: Record<number, number> = {};
  const levelCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};
  const verification = { tracked: 0, matched: 0, unmatched: 0, pending: 0 };

  for (const record of history) {
    godCounts[record.godName] = (godCounts[record.godName] ?? 0) + 1;
    categoryCounts[record.questionCategory] = (categoryCounts[record.questionCategory] ?? 0) + 1;
    poemCounts[record.poem.number] = (poemCounts[record.poem.number] ?? 0) + 1;
    levelCounts[record.poem.level] = (levelCounts[record.poem.level] ?? 0) + 1;

    const date = new Date(record.timestamp);
    const dayKey = `${date.getMonth() + 1}/${date.getDate()}`;
    dayCounts[dayKey] = (dayCounts[dayKey] ?? 0) + 1;

    if (record.verificationStatus) {
      verification.tracked += 1;
      verification[record.verificationStatus] += 1;
    } else {
      verification.pending += 1;
    }
  }

  const topGodEntry = Object.entries(godCounts).sort((left, right) => right[1] - left[1])[0];
  const topCategoryEntry = Object.entries(categoryCounts).sort(
    (left, right) => right[1] - left[1]
  )[0];

  return {
    totalDraws: history.length,
    favorites: favorites.length,
    topGod: topGodEntry
      ? { name: topGodEntry[0], count: topGodEntry[1] }
      : { name: '尚無資料', count: 0 },
    topCategory: topCategoryEntry
      ? {
          name: CATEGORY_NAMES[topCategoryEntry[0]] ?? topCategoryEntry[0],
          count: topCategoryEntry[1],
        }
      : { name: '尚無資料', count: 0 },
    topPoems: Object.entries(poemCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([number, count]) => ({ number: Number(number), count })),
    levelDistribution: Object.entries(levelCounts).map(([level, count]) => ({ level, count })),
    weeklyDraws: Object.entries(dayCounts)
      .slice(-7)
      .map(([day, count]) => ({ day, count })),
    verification,
  };
}

export async function getYearlySummary(
  year = new Date().getFullYear()
): Promise<YearlySummary | null> {
  const history = (await getHistory()).filter(
    (record) => new Date(record.timestamp).getFullYear() === year
  );

  if (history.length === 0) return null;

  const godCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const poemCounts: Record<number, { count: number; level: string }> = {};
  const monthCounts: Record<number, number> = {};
  const weekdayCounts: Record<number, number> = {};
  let luckyCount = 0;

  for (const record of history) {
    godCounts[record.godName] = (godCounts[record.godName] ?? 0) + 1;
    categoryCounts[record.questionCategory] = (categoryCounts[record.questionCategory] ?? 0) + 1;

    if (!poemCounts[record.poem.number]) {
      poemCounts[record.poem.number] = { count: 0, level: record.poem.level };
    }
    poemCounts[record.poem.number].count += 1;

    const date = new Date(record.timestamp);
    monthCounts[date.getMonth() + 1] = (monthCounts[date.getMonth() + 1] ?? 0) + 1;
    weekdayCounts[date.getDay()] = (weekdayCounts[date.getDay()] ?? 0) + 1;

    if (record.poem.level.includes('上') || record.poem.level.includes('吉')) {
      luckyCount += 1;
    }
  }

  const topGodEntry = Object.entries(godCounts).sort((left, right) => right[1] - left[1])[0];
  const topCategoryEntry = Object.entries(categoryCounts).sort(
    (left, right) => right[1] - left[1]
  )[0];
  const topPoemEntry = Object.entries(poemCounts).sort(
    (left, right) => right[1].count - left[1].count
  )[0];
  const peakMonthEntry = Object.entries(monthCounts).sort((left, right) => right[1] - left[1])[0];
  const topWeekdayEntry = Object.entries(weekdayCounts).sort(
    (left, right) => right[1] - left[1]
  )[0];

  return {
    year,
    totalDraws: history.length,
    topGod: topGodEntry ? { name: topGodEntry[0], count: topGodEntry[1] } : null,
    topCategory: topCategoryEntry
      ? {
          name: CATEGORY_NAMES[topCategoryEntry[0]] ?? topCategoryEntry[0],
          count: topCategoryEntry[1],
        }
      : null,
    topPoem: topPoemEntry
      ? {
          number: Number(topPoemEntry[0]),
          level: topPoemEntry[1].level,
          count: topPoemEntry[1].count,
        }
      : null,
    luckyRate: Math.round((luckyCount / history.length) * 100),
    peakMonth: peakMonthEntry ? `${peakMonthEntry[0]} 月` : null,
    longestStreak: getLongestStreak(history),
    mostActiveWeekday: topWeekdayEntry
      ? WEEKDAY_NAMES[Number(topWeekdayEntry[0])]
      : null,
  };
}
