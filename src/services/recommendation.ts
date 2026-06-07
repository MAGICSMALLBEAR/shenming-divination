import { gods, type God } from '@/data/gods';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import type { DivinationRecord } from '@/services/storage';

export interface GodRecommendation {
  god: God;
  score: number;
  reason: string;
}

const CATEGORY_MATCH: Record<string, God['category'][]> = {
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
        reasons.push('符合這次提問方向');
      }

      if (options.preferredGodId === god.id) {
        score += 2;
        reasons.push('是你偏好的神明');
      }

      if (patronGodId === god.id) {
        score += 3;
        reasons.push('與你的生年守護較合');
      }

      const usedCount = historyCount.get(god.id) ?? 0;
      if (usedCount > 0) {
        score += Math.min(usedCount, 3);
        reasons.push(`過去請示過 ${usedCount} 次`);
      }

      if (options.questionCategory === 'travel' && god.category === 'sea') {
        score += 2;
        reasons.push('適合出行與平安方向');
      }

      if (options.questionCategory === 'love' && god.category === 'compassion') {
        score += 2;
        reasons.push('適合感情與人際修復');
      }

      return {
        god,
        score,
        reason: reasons.slice(0, 2).join('，') || '適合先靜心請示，整理當下方向',
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}
