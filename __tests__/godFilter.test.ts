import { gods } from '@/data/gods';
import { filterGods, matchesGodSearch, matchesQuestionCategory } from '@/services/godFilter';

describe('god filtering', () => {
  it('returns every god when filters are empty', () => {
    expect(filterGods(gods, '   ', 'all')).toHaveLength(gods.length);
  });

  it('searches names and profile aliases', () => {
    const zhao = gods.find((god) => god.name.includes('趙公明'));
    expect(zhao).toBeDefined();
    expect(matchesGodSearch(zhao!, '武財神')).toBe(true);
    expect(filterGods(gods, '趙公明', 'all')).toContainEqual(zhao);
  });

  it('searches patronages and suitable topics', () => {
    expect(filterGods(gods, '財運', 'all').length).toBeGreaterThan(0);
  });

  it('applies question-category matching', () => {
    const wealthGods = filterGods(gods, '', 'wealth');
    expect(wealthGods.length).toBeGreaterThan(0);
    expect(wealthGods.every((god) => matchesQuestionCategory(god, 'wealth'))).toBe(true);
  });

  it('combines keyword and category filters', () => {
    const result = filterGods(gods, '武財神', 'wealth');
    expect(result.some((god) => god.name.includes('趙公明'))).toBe(true);
    expect(result.every((god) => matchesQuestionCategory(god, 'wealth'))).toBe(true);
  });

  it('treats an unknown category as non-restrictive', () => {
    expect(filterGods(gods, '', 'future-category')).toHaveLength(gods.length);
  });
});
