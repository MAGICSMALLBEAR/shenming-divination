import { auditAllOracles, auditGodOracle, classifyOracleSource } from '@/services/oracleAudit';
import { gods } from '@/data/gods';

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
});
