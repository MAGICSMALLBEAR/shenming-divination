// 統計服務 - 求籤數據分析
import { getHistory, getFavorites, type DivinationRecord } from './storage';

export interface Stats {
  totalDraws: number;
  favorites: number;
  topGod: { name: string; count: number };
  topCategory: { name: string; count: number };
  topPoems: { number: number; count: number }[];
  levelDistribution: { level: string; count: number }[];
  weeklyDraws: { day: string; count: number }[];
}

export async function getStats(): Promise<Stats> {
  const history = await getHistory();
  const favs = await getFavorites();

  // 最常求的神明
  const godCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  const poemCounts: Record<number, number> = {};
  const levelCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};

  for (const r of history) {
    godCounts[r.godName] = (godCounts[r.godName] || 0) + 1;
    catCounts[r.questionCategory] = (catCounts[r.questionCategory] || 0) + 1;
    poemCounts[r.poem.number] = (poemCounts[r.poem.number] || 0) + 1;
    levelCounts[r.poem.level] = (levelCounts[r.poem.level] || 0) + 1;
    const d = new Date(r.timestamp);
    const dayKey = `${d.getMonth() + 1}/${d.getDate()}`;
    dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
  }

  const topGod = Object.entries(godCounts).sort((a, b) => b[1] - a[1])[0] || ['尚無', 0];
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0] || ['general', 0];

  const catNames: Record<string, string> = {
    career: '事業工作', love: '感情姻緣', wealth: '財運投資',
    health: '健康身體', study: '學業考試', family: '家庭家運',
    travel: '出行遷移', general: '綜合運勢',
  };

  return {
    totalDraws: history.length,
    favorites: favs.length,
    topGod: { name: topGod[0], count: topGod[1] },
    topCategory: { name: catNames[topCategory[0]] || topCategory[0], count: topCategory[1] },
    topPoems: Object.entries(poemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([num, count]) => ({ number: parseInt(num), count })),
    levelDistribution: Object.entries(levelCounts)
      .map(([level, count]) => ({ level, count })),
    weeklyDraws: Object.entries(dayCounts)
      .slice(-7)
      .map(([day, count]) => ({ day, count })),
  };
}

// ─── 年度回顧 ──────────────────────────────────────────────────

export interface YearlySummary {
  year: number;
  totalDraws: number;
  topGod: { name: string; count: number } | null;
  topCategory: { name: string; count: number } | null;
  topPoem: { number: number; level: string; count: number } | null;
  luckyRate: number;       // 上上/大吉 占比 0–100
  peakMonth: string | null;// '5月' 等
  longestStreak: number;   // 最長連求天數
  mostActiveWeekday: string | null; // 最常求籤的星期
}

const CAT_NAMES: Record<string, string> = {
  career: '事業工作', love: '感情姻緣', wealth: '財運投資',
  health: '健康身體', study: '學業考試', family: '家庭家運',
  travel: '出行遷移', general: '綜合運勢',
};
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function longestStreak(records: DivinationRecord[]): number {
  if (records.length === 0) return 0;
  const dateSet = new Set(records.map(r => {
    const d = new Date(r.timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  const sorted = [...dateSet].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const [py, pm, pd] = sorted[i - 1].split('-').map(Number);
    const [cy, cm, cd] = sorted[i].split('-').map(Number);
    const prev = new Date(py, pm, pd);
    const curr = new Date(cy, cm, cd);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) { cur++; max = Math.max(max, cur); } else { cur = 1; }
  }
  return max;
}

export async function getYearlySummary(year = new Date().getFullYear()): Promise<YearlySummary | null> {
  const allHistory = await getHistory();
  const history = allHistory.filter(r => new Date(r.timestamp).getFullYear() === year);

  if (history.length === 0) return null;

  const godCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  const poemCounts: Record<number, { count: number; level: string }> = {};
  const monthCounts: Record<number, number> = {};
  const weekdayCounts: Record<number, number> = {};
  let luckyCount = 0;

  for (const r of history) {
    godCounts[r.godName] = (godCounts[r.godName] || 0) + 1;
    catCounts[r.questionCategory] = (catCounts[r.questionCategory] || 0) + 1;

    const pn = r.poem.number;
    if (!poemCounts[pn]) poemCounts[pn] = { count: 0, level: r.poem.level };
    poemCounts[pn].count++;

    const d = new Date(r.timestamp);
    monthCounts[d.getMonth() + 1] = (monthCounts[d.getMonth() + 1] || 0) + 1;
    weekdayCounts[d.getDay()] = (weekdayCounts[d.getDay()] || 0) + 1;

    if (r.poem.level.includes('上') || r.poem.level.includes('大吉')) luckyCount++;
  }

  const topGodEntry  = Object.entries(godCounts).sort((a, b) => b[1] - a[1])[0];
  const topCatEntry  = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  const topPoemEntry = Object.entries(poemCounts).sort((a, b) => b[1].count - a[1].count)[0];
  const peakMonthEntry = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
  const topWeekdayEntry = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    year,
    totalDraws: history.length,
    topGod: topGodEntry ? { name: topGodEntry[0], count: topGodEntry[1] } : null,
    topCategory: topCatEntry
      ? { name: CAT_NAMES[topCatEntry[0]] || topCatEntry[0], count: topCatEntry[1] }
      : null,
    topPoem: topPoemEntry
      ? { number: parseInt(topPoemEntry[0]), level: topPoemEntry[1].level, count: topPoemEntry[1].count }
      : null,
    luckyRate: Math.round((luckyCount / history.length) * 100),
    peakMonth: peakMonthEntry ? `${peakMonthEntry[0]}月` : null,
    longestStreak: longestStreak(history),
    mostActiveWeekday: topWeekdayEntry ? `星期${WEEKDAYS[parseInt(topWeekdayEntry[0])]}` : null,
  };
}
