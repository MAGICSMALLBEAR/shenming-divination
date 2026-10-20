import { getPoemsByGod, gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { drawZhugePoem, getZhugeNumberContext, zhugeShenShuPoems } from '@/data/poems/zhugeShenShu';
import { auditGodOracle } from '@/services/oracleAudit';

describe('諸葛神數三百八十四籤', () => {
  it('replaces the app-written 64 hexagrams with the traditional 384 lots', () => {
    const god = gods.find((item) => item.id === 9)!;
    expect(god.totalPoems).toBe(384);
    expect(getPoemsByGod(9)).toBe(zhugeShenShuPoems);
    expect(getOracleCatalogByGodId(9).totalPoems).toBe(384);
    expect(auditGodOracle(god).errors).toEqual([]);
    zhugeShenShuPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(10001 + index);
      expect(poem.level).toBe('籤本未標');
      expect(poem.content).toMatch(/[。！？]$/);
    });
    expect(zhugeShenShuPoems[0].content.startsWith('天門一掛榜')).toBe(true);
    expect(zhugeShenShuPoems[383].content).toContain('過而能改');
    expect(zhugeShenShuPoems[99].ganzhi).toBe('第一百籤');
    expect(zhugeShenShuPoems[100].ganzhi).toBe('第一百零一籤');
  });

  it('cycles reported numbers through 1-384', () => {
    expect(drawZhugePoem(1).number).toBe(1);
    expect(drawZhugePoem(384).number).toBe(384);
    expect(drawZhugePoem(385).number).toBe(1);
    expect(drawZhugePoem(0).number).toBe(1);
    expect(getZhugeNumberContext(-770).normalizedNumber).toBe(2);
  });
});
