import type { God } from '@/data/gods';
import { getGodProfile } from '@/data/godProfiles';

export const GOD_CATEGORY_MATCH: Record<string, God['category'][]> = {
  career: ['war', 'growth', 'general'], love: ['compassion', 'general'],
  wealth: ['wealth', 'growth', 'general'], health: ['health', 'compassion', 'release'],
  study: ['general', 'war', 'growth'], family: ['compassion', 'guardian', 'heaven'],
  travel: ['sea', 'growth', 'guardian'], blessing: ['heaven', 'release', 'compassion'],
  protection: ['guardian', 'war', 'release'], settlement: ['growth', 'guardian', 'sea'],
  general: ['general', 'heaven', 'compassion'],
};

export function matchesGodSearch(god: God, query: string): boolean {
  const keyword = query.trim().toLocaleLowerCase();
  if (!keyword) return true;
  const profile = getGodProfile(god.id);
  return [god.name, god.title, god.tagline, god.description, god.poemSystem,
    ...(profile?.aliases ?? []), ...(profile?.patronages ?? []), ...(profile?.suitableTopics ?? [])]
    .join(' ').toLocaleLowerCase().includes(keyword);
}

export function matchesQuestionCategory(god: God, categoryId: string): boolean {
  if (categoryId === 'all') return true;
  const allowed = GOD_CATEGORY_MATCH[categoryId];
  return !allowed || allowed.includes(god.category);
}

export function filterGods(godList: God[], query: string, categoryId: string): God[] {
  return godList.filter((god) => matchesGodSearch(god, query) && matchesQuestionCategory(god, categoryId));
}
