import { gods, type God } from '@/data/gods';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import type { DivinationRecord } from '@/services/storage';

export interface GodRecommendation {
  god: God;
  score: number;
  reason: string;
}

const CATEGORY_MATCH: Record<string, Array<God['category']>> = {
  career: ['war', 'general'],
  love: ['compassion', 'general'],
  wealth: ['wealth', 'general'],
  health: ['health', 'compassion'],
  study: ['general', 'war'],
  family: ['compassion', 'general'],
  travel: ['sea', 'general'],
  general: ['general', 'compassion'],
};

export interface RecommendGodOptions {
  questionCategory: string;
  birthDate?: string;
  preferredGodId?: number | null;
  history?: DivinationRecord[];
}

export function recommendGods(options: RecommendGodOptions): GodRecommendation[] {
  const preferredCategories = CATEGORY_MATCH[options.questionCategory] ?? CATEGORY_MATCH.general;
  const birthYear = options.birthDate ? parseBirthYear(options.birthDate) : null;
  const patronGodId = birthYear ? calcBazi(birthYear).patronGodId : null;
  const historyCount = new Map<number, number>();

  for (const record of options.history ?? []) {
    const matchedGod = gods.find((god) => god.name === record.godName);
    if (!matchedGod) continue;
    historyCount.set(matchedGod.id, (historyCount.get(matchedGod.id) ?? 0) + 1);
  }

  return gods
    .map((god) => {
      let score = 0;
      const reasons: string[] = [];

      if (preferredCategories.includes(god.category)) {
        score += 4;
        reasons.push('符合這次問題方向');
      }

      if (options.preferredGodId === god.id) {
        score += 2;
        reasons.push('是你的常用神明');
      }

      if (patronGodId === god.id) {
        score += 3;
        reasons.push('和你的命盤守護緣分較深');
      }

      const usedCount = historyCount.get(god.id) ?? 0;
      if (usedCount > 0) {
        score += Math.min(usedCount, 3);
        reasons.push(`你過去曾請示 ${usedCount} 次`);
      }

      if (options.questionCategory === 'travel' && god.category === 'sea') {
        score += 2;
        reasons.push('特別適合出行與遠行題目');
      }

      if (options.questionCategory === 'love' && god.category === 'compassion') {
        score += 2;
        reasons.push('更偏向安定關係與情感提問');
      }

      return {
        god,
        score,
        reason: reasons.slice(0, 2).join('，') || '可作為這次的請示對象',
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}
