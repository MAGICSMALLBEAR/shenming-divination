import { gods, getPoemsByGod } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { xuantianLingqianPoems } from '@/data/poems/xuantianLingqian';

const QUATRAIN = /^[^，。\n]{7}，[^，。\n]{7}。\n[^，。\n]{7}，[^，。\n]{7}。$/;

describe('Daozang-sourced oracle systems', () => {
  it('xuantian uses the 49-lot 玄天上帝感應靈籤 from the Zhengtong Daozang', () => {
    const god = gods.find((item) => item.id === 10);
    expect(god?.poemSystem).toBe('玄天上帝感應靈籤');
    expect(god?.totalPoems).toBe(49);
    expect(getPoemsByGod(10)).toBe(xuantianLingqianPoems);
    expect(getOracleCatalogByGodId(10).totalPoems).toBe(49);
    expect(getOracleCatalogByGodId(10).sourceNote).toContain('DZ1482');
  });

  it('keeps every xuantian lot structurally sound', () => {
    expect(xuantianLingqianPoems.map((poem) => poem.number)).toEqual(Array.from({ length: 49 }, (_, i) => i + 1));
    expect(new Set(xuantianLingqianPoems.map((poem) => poem.id)).size).toBe(49);
    const levels = new Set(['大吉', '上上', '上吉', '中上', '中平', '中下', '下中', '下下']);
    for (const poem of xuantianLingqianPoems) {
      expect(poem.content).toMatch(QUATRAIN);
      expect(levels.has(poem.level)).toBe(true);
      expect(poem.story.startsWith('原典解曰：')).toBe(true);
      expect(poem.story).not.toContain('萬曆');
    }
    expect(xuantianLingqianPoems[0].content.startsWith('飛龍變化喜逢時')).toBe(true);
  });
});
