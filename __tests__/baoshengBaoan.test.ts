import { getPoemsByGod, gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { baoshengBaoanPoems } from '@/data/poems/baoshengBaoan';
import { baoshengHealthPoems } from '@/data/poems/godSpecific';
import { auditGodOracle } from '@/services/oracleAudit';

describe('保安宮保生大帝籤', () => {
  it('gives 保生大帝 the Baoan Temple 60 lots plus 籤王, leaving 神農大帝 unchanged', () => {
    const baosheng = gods.find((item) => item.id === 5)!;
    expect(baosheng.poemSystem).toBe('保安宮保生大帝籤');
    expect(getPoemsByGod(5)).toBe(baoshengBaoanPoems);
    expect(getOracleCatalogByGodId(5).totalPoems).toBe(61);
    expect(auditGodOracle(baosheng).errors).toEqual([]);
    expect(getPoemsByGod(21)).toBe(baoshengHealthPoems);
    expect(getOracleCatalogByGodId(21).totalPoems).toBe(100);
  });

  it('matches the lots quoted in news about Baoan Temple', () => {
    expect(baoshengBaoanPoems).toHaveLength(61);
    baoshengBaoanPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(9201 + index);
      expect(poem.level).toBe('籤本未標');
      expect(poem.content).toMatch(/^[^，。\n]{7}，[^，。\n]{7}。\n[^，。\n]{7}，[^，。\n]{7}。$/);
    });
    expect(baoshengBaoanPoems[17].content.startsWith('匆匆匹馬掛金鞍')).toBe(true);
    expect(baoshengBaoanPoems[27].content.startsWith('乍聞喜鵲噪簷聲')).toBe(true);
    expect(baoshengBaoanPoems[43].content.startsWith('夜行燈火中途滅')).toBe(true);
    expect(baoshengBaoanPoems[60].ganzhi).toBe('籤王');
  });
});
