// 統計服務 - 求籤數據分析
import { getHistory, type DivinationRecord } from './storage';
import { getFavorites } from './storage';

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
