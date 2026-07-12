import type { God } from '@/data/gods';
import type { DivinationRecord } from '@/services/storage';
import { matchesQuestionCategory } from '@/services/godFilter';

export interface GodOrderOptions {
  categoryId?: string;
  preferredGodId?: number | null;
  patronGodId?: number | null;
  history?: DivinationRecord[];
}

export interface RankedGod {
  god: God;
  score: number;
  badges: string[];
}

export function rankGods(godList: God[], options: GodOrderOptions): RankedGod[] {
  const now = Date.now();
  const history = options.history ?? [];
  return godList.map((god, originalIndex) => {
    let score = 0;
    const badges: string[] = [];
    if (options.patronGodId === god.id) { score += 100; badges.push('守護神'); }
    if (options.preferredGodId === god.id) { score += 80; badges.push('常用'); }
    if (options.categoryId && options.categoryId !== 'all' && matchesQuestionCategory(god, options.categoryId)) {
      score += 30; badges.push('符合問題');
    }
    const records = history.filter((record) => record.godName === god.name);
    if (records.length) {
      score += Math.min(records.length, 5) * 6;
      const newest = Math.max(...records.map((record) => record.timestamp));
      const ageDays = Math.max(0, (now - newest) / 86400000);
      score += Math.max(0, 12 - Math.floor(ageDays / 7));
      badges.push(`曾請示 ${records.length} 次`);
    }
    return { god, score, badges, originalIndex };
  }).sort((left, right) => right.score - left.score || left.originalIndex - right.originalIndex)
    .map(({ god, score, badges }) => ({ god, score, badges }));
}
