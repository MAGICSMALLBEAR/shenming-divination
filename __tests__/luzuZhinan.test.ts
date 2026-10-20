import { getPoemsByGod, gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { luzuZhinanPoems } from '@/data/poems/luzuZhinan';
import { auditGodOracle } from '@/services/oracleAudit';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

describe('指南宮呂祖靈籤', () => {
  it('uses the 61-lot Zhinan Temple set for 呂洞賓', () => {
    const god = gods.find((item) => item.id === 15)!;
    expect(god.poemSystem).toBe('指南宮呂祖靈籤');
    expect(getPoemsByGod(15)).toBe(luzuZhinanPoems);
    expect(getOracleCatalogByGodId(15).totalPoems).toBe(61);
    expect(auditGodOracle(god).errors).toEqual([]);
  });

  it('orders lots by the sexagenary cycle with 籤王 last', () => {
    expect(luzuZhinanPoems).toHaveLength(61);
    luzuZhinanPoems.slice(0, 60).forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(9001 + index);
      expect(poem.ganzhi).toBe(STEMS[index % 10] + BRANCHES[index % 12]);
    });
    expect(luzuZhinanPoems[60].ganzhi).toBe('籤王');
    for (const poem of luzuZhinanPoems) {
      expect(poem.level).toBe('籤本未標');
      expect(poem.content).toMatch(/^[^，。\n]{7}，[^，。\n]{7}。\n[^，。\n]{7}，[^，。\n]{7}。$/);
    }
  });

  it('follows the temple slips where web transcriptions differ', () => {
    expect(luzuZhinanPoems[0].content.startsWith('此籤落地判陰陽')).toBe(true);
    expect(luzuZhinanPoems[16].content).toContain('時來風送滕王閣');
    expect(luzuZhinanPoems[58].content).toContain('兄弟原來稱義士');
    expect(luzuZhinanPoems[59].content.startsWith('功名得意報君知')).toBe(true);
  });
});
