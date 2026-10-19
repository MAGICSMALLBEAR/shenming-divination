import { getPoemsByGod, gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { isUnluckyLevel } from '@/data/poemLevel';
import { kongziShengqianPoems } from '@/data/poems/kongziShengqian';
import { auditGodOracle } from '@/services/oracleAudit';

describe('孔子聖籤（日月潭文武廟）', () => {
  it('gives 孔子 its own 72-lot system instead of sharing 文昌', () => {
    const kongzi = gods.find((god) => god.id === 32)!;
    const wenchang = gods.find((god) => god.id === 8)!;
    expect(kongzi.poemSystem).toBe('孔子聖籤');
    expect(wenchang.poemSystem).toBe('文昌功名百籤');
    expect(getPoemsByGod(32)).toBe(kongziShengqianPoems);
    expect(getOracleCatalogByGodId(32).totalPoems).toBe(72);
    expect(getOracleCatalogByGodId(8).totalPoems).toBe(100);
    expect(auditGodOracle(kongzi).errors).toEqual([]);
  });

  it('keeps the temple numbering, levels and annotations', () => {
    expect(kongziShengqianPoems).toHaveLength(72);
    kongziShengqianPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(8901 + index);
      expect(['大吉', '吉', '不吉']).toContain(poem.level);
      expect(poem.story.startsWith('廟方籤註：「')).toBe(true);
      expect(poem.story).toContain(poem.level);
      expect(poem.content).toMatch(/^[^，。\n]{7}，[^，。\n]{7}。\n[^，。\n]{7}，[^，。\n]{7}。$/);
    });
    expect(kongziShengqianPoems[0].content.startsWith('力穡應逢大有年')).toBe(true);
    expect(kongziShengqianPoems[10].content).toContain('不舍晝夜');
    expect(kongziShengqianPoems[71].content.startsWith('萬物靜觀皆自然')).toBe(true);
  });

  it('treats 不吉 as an unlucky level even though it contains 吉', () => {
    expect(isUnluckyLevel('不吉')).toBe(true);
    expect(isUnluckyLevel('下下')).toBe(true);
    expect(isUnluckyLevel('大吉')).toBe(false);
    expect(isUnluckyLevel('吉')).toBe(false);
    expect(kongziShengqianPoems.filter((poem) => isUnluckyLevel(poem.level))).toHaveLength(8);
  });
});
