import { gods, getPoemsByGod } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { xuantianLingqianPoems } from '@/data/poems/xuantianLingqian';
import { zhushengLingqianPoems } from '@/data/poems/zhushengLingqian';
import { linshuiWeifangPoems } from '@/data/poems/linshuiWeifang';

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

describe('註生娘娘 注生堂靈籤', () => {
  it('uses the 64-lot 靈濟真君注生堂靈籤 with an honest unmarked level on lot 64', () => {
    const god = gods.find((item) => item.id === 7);
    expect(god?.poemSystem).toBe('注生堂靈籤');
    expect(getPoemsByGod(7)).toHaveLength(64);
    expect(getOracleCatalogByGodId(7).totalPoems).toBe(64);
    expect(zhushengLingqianPoems[0].content.startsWith('夜來吉夢叶熊羆')).toBe(true);
    expect(zhushengLingqianPoems[63].level).toBe('原典未標');
    expect(new Set(zhushengLingqianPoems.map((poem) => poem.id)).size).toBe(64);
    for (const poem of zhushengLingqianPoems) {
      expect(poem.content).toMatch(/^[^，。\n]{7}，[^，。\n]{7}。\n[^，。\n]{7}，[^，。\n]{7}。$/);
    }
  });
});

describe('臨水夫人 衛房聖母靈應寶籤', () => {
  it('uses the 99-lot 九天衛房聖母元君靈應寶籤 without invented fortune levels', () => {
    const god = gods.find((item) => item.id === 30);
    expect(god?.poemSystem).toBe('衛房聖母靈應寶籤');
    expect(getPoemsByGod(30)).toHaveLength(99);
    expect(getOracleCatalogByGodId(30).totalPoems).toBe(99);
    expect(linshuiWeifangPoems[0].content.startsWith('天尊有敕救人民')).toBe(true);
    expect(new Set(linshuiWeifangPoems.map((poem) => poem.id)).size).toBe(99);
    linshuiWeifangPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.level).toBe('原典未標');
      expect(poem.story.startsWith('原典解曰：')).toBe(true);
      expect(poem.jieYue.health).toContain('醫');
      expect(poem.content).toMatch(/^[^，。\n]+，[^，。\n]+。\n[^，。\n]+，[^，。\n]+。$/);
      const lengths = poem.content.split(/[，。\n]+/).filter(Boolean).map((line) => line.length);
      expect(new Set(lengths).size).toBe(1);
    });
  });
});
