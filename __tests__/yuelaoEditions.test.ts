import { getAllPoemsByGod, getPoemsByGod, gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { yuelaoHongKongPoems, yuelaoTaiwanPoems } from '@/data/poems/yuelao';
import {
  getYuelaoEdition,
  getYuelaoEditionOfPoem,
  setYuelaoEdition,
  YUELAO_GOD_ID,
} from '@/data/yuelaoEdition';
import { auditGodOracle } from '@/services/oracleAudit';

const contentKey = (content: string) => content.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 6);

describe('月老靈籤 台灣版／香港版', () => {
  afterEach(() => setYuelaoEdition('taiwan'));

  it('numbers both editions consecutively with distinct id ranges', () => {
    expect(yuelaoTaiwanPoems).toHaveLength(100);
    expect(yuelaoHongKongPoems).toHaveLength(101);
    yuelaoTaiwanPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(8601 + index);
      expect(poem.level).toBe('籤本未標');
    });
    yuelaoHongKongPoems.forEach((poem, index) => {
      expect(poem.number).toBe(index + 1);
      expect(poem.id).toBe(8701 + index);
    });
    expect(yuelaoHongKongPoems[100].ganzhi).toBe('簽王');
  });

  it('keeps the same quotes in a different order', () => {
    expect(yuelaoTaiwanPoems[0].content.startsWith('關關雎鳩')).toBe(true);
    expect(yuelaoHongKongPoems[0].content.startsWith('關關雎鳩')).toBe(true);
    // 港版第 13 簽「山窮水盡」在台灣版為第 29 籤
    expect(yuelaoHongKongPoems[12].content.startsWith('山窮水盡')).toBe(true);
    expect(yuelaoTaiwanPoems[28].content.startsWith('山窮水盡')).toBe(true);
    const hongKongKeys = new Set(yuelaoHongKongPoems.map((poem) => contentKey(poem.content)));
    for (const poem of yuelaoTaiwanPoems) {
      expect(hongKongKeys.has(contentKey(poem.content))).toBe(true);
    }
    expect(new Set(yuelaoTaiwanPoems.map((poem) => contentKey(poem.content))).size).toBe(100);
  });

  it('follows the selected edition when drawing and in the catalog', () => {
    const god = gods.find((item) => item.id === YUELAO_GOD_ID);
    expect(god?.poemSystem).toBe('月老靈籤');
    expect(getYuelaoEdition()).toBe('taiwan');
    expect(getPoemsByGod(YUELAO_GOD_ID)).toBe(yuelaoTaiwanPoems);
    expect(getOracleCatalogByGodId(YUELAO_GOD_ID).totalPoems).toBe(100);

    setYuelaoEdition('hongkong');
    expect(getPoemsByGod(YUELAO_GOD_ID)).toBe(yuelaoHongKongPoems);
    expect(getOracleCatalogByGodId(YUELAO_GOD_ID).totalPoems).toBe(101);
    expect(getPoemsByGod(YUELAO_GOD_ID, 'taiwan')).toBe(yuelaoTaiwanPoems);
  });

  it('lists both editions for browsing and tells them apart by id', () => {
    expect(getAllPoemsByGod(YUELAO_GOD_ID)).toHaveLength(201);
    expect(getYuelaoEditionOfPoem(yuelaoTaiwanPoems[99])).toBe('taiwan');
    expect(getYuelaoEditionOfPoem(yuelaoHongKongPoems[100])).toBe('hongkong');
    expect(getYuelaoEditionOfPoem({ id: 1 })).toBeUndefined();
  });

  it('passes the oracle audit regardless of the selected edition', () => {
    const god = gods.find((item) => item.id === YUELAO_GOD_ID)!;
    setYuelaoEdition('hongkong');
    expect(auditGodOracle(god).errors).toEqual([]);
  });
});
