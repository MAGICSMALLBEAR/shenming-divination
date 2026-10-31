import { auditAllOracles, auditGodOracle, auditPoemsData, classifyOracleSource } from '@/services/oracleAudit';
import { gods, type God } from '@/data/gods';
import type { Poem } from '@/data/poems/leiyushi';
import type { OracleCatalogEntry } from '@/data/oracleCatalog';

describe('oracle content audit', () => {
  it('finds no critical structural or required-field gaps', () => {
    const summary = auditAllOracles();
    expect(summary.rows).toHaveLength(gods.length);
    expect(summary.criticalCount).toBe(0);
    expect(summary.rows.every((row) => row.completenessPercent === 100)).toBe(true);
  });

  it('keeps every poem number, catalog count and version aligned', () => {
    for (const god of gods) {
      const row = auditGodOracle(god);
      expect(row.errors).toEqual([]);
      expect(row.poemCount).toBe(god.totalPoems);
      expect(row.catalog.totalPoems).toBe(god.totalPoems);
    }
  });

  it('classifies traditional, adapted and original sources explicitly', () => {
    expect(classifyOracleSource('傳統籤系 + App 白話修訂')).toBe('traditional');
    expect(classifyOracleSource('保生信仰語境 + App 白話修訂')).toBe('adapted');
    expect(classifyOracleSource('App 原創白話籤系')).toBe('original');
  });

  it('handles non-continuous and special-format poems with warnings instead of critical errors', () => {
    const mockGod: God = {
      ...gods[0],
      totalPoems: 2,
    };
    const mockCatalog: OracleCatalogEntry = {
      label: '特殊籤本測試',
      totalPoems: 2,
      sourceType: '傳統籤系',
      versionTag: 'v1.0.0-test',
      editionNote: '測試特殊格式',
      sourceNote: '測試來源',
      completenessNote: '完整',
      suitabilityNote: '通用',
      strengths: ['測試'],
    };
    const specialPoems: Poem[] = [
      {
        id: 0,
        number: 0,
        displayNumber: '籤王',
        kind: 'qian-wang',
        isKingPoem: true,
        unrankedLevel: true,
        ganzhi: '',
        level: '未標',
        title: '萬事順遂',
        content: '大吉大利天垂佑，福壽康寧萬古秋。',
        vernacular: '天賜百福，吉祥如意。',
        story: '籤王大吉典故。',
        jieYue: {
          marriage: '吉',
          wealth: '吉',
          career: '吉',
          health: '吉',
          travel: '吉',
          study: '吉',
          general: '大吉',
        },
      },
      {
        id: 28,
        number: 28,
        displayNumber: '第 28 首 特殊',
        kind: 'special',
        unrankedLevel: true,
        nonStandardMeter: true,
        specialNote: '四句長短不一非七言絕句，未標吉凶',
        ganzhi: '',
        level: '',
        title: '隨緣自在',
        content: '佛在靈山莫遠求，靈山只在汝心頭，人人有個靈山塔，好向靈山塔下修。',
        vernacular: '隨緣自在。',
        story: '紫竹寺第 28 首特殊格式。',
        jieYue: {
          marriage: '平',
          wealth: '平',
          career: '平',
          health: '平',
          travel: '平',
          study: '平',
          general: '平',
        },
      },
    ];

    const row = auditPoemsData(mockGod, specialPoems, mockCatalog);
    expect(row.errors).toEqual([]);
    expect(row.status).not.toBe('critical');
    expect(row.warnings.some((w) => w.includes('格式特殊'))).toBe(true);
    expect(row.completenessPercent).toBe(100);
  });
});
