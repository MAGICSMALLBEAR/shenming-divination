import { getPoemsByGod, gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { qingshuiZushiPoems } from '@/data/poems/qingshuiZushi';
import { auditGodOracle } from '@/services/oracleAudit';

describe('清水祖師靈籤（臺北版）', () => {
  it('gives 清水祖師 the Taipei 48 lots plus two 簽王', () => {
    const god = gods.find((item) => item.id === 17)!;
    expect(god.poemSystem).toBe('清水祖師靈籤');
    expect(getPoemsByGod(17)).toBe(qingshuiZushiPoems);
    expect(getOracleCatalogByGodId(17).totalPoems).toBe(50);
    expect(getOracleCatalogByGodId(4).label).not.toContain('清水');
    expect(auditGodOracle(god).errors).toEqual([]);
    qingshuiZushiPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(9101 + index);
      expect(poem.content).toMatch(/^[^，。\n]{5}，[^，。\n]{5}。\n[^，。\n]{5}，[^，。\n]{5}。$/);
    });
    expect(qingshuiZushiPoems.slice(0, 48).every((poem) => poem.level === '籤本未標')).toBe(true);
    expect(qingshuiZushiPoems[48].ganzhi).toBe('簽王');
    expect(qingshuiZushiPoems[49].level).toBe('大吉');
  });

  it('keeps Taipei readings that differ from the Anxi edition', () => {
    expect(qingshuiZushiPoems[0].content).toContain('光輝照四鄰');
    expect(qingshuiZushiPoems[1].content).toContain('須臾風浪靜');
    expect(qingshuiZushiPoems[17].content).toContain('運乖');
  });
});
