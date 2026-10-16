import { gods } from '@/data/gods';
import {
  DEITY_CALENDAR_SOURCES,
  DEITY_OBSERVANCE_TYPE_LABELS,
  DEITY_OBSERVANCES,
  getNextDeityObservanceOccurrence,
} from '@/services/lunarDeityCalendar';

const FOLK_SOURCE_IDS = new Set(['folk-daheng', 'folk-fude', 'folk-songxing']);

describe('deity observance data audit', () => {
  it('uses unique ids that point to existing gods and sources', () => {
    const ids = DEITY_OBSERVANCES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    const sourceIds = new Set(DEITY_CALENDAR_SOURCES.map((source) => source.id));
    for (const item of DEITY_OBSERVANCES) {
      expect(gods.some((god) => god.id === item.godId)).toBe(true);
      expect(item.sourceIds.length).toBeGreaterThan(0);
      for (const id of item.sourceIds) expect(sourceIds.has(id)).toBe(true);
    }
  });

  it('keeps lunar dates valid and every event type labelled', () => {
    for (const item of DEITY_OBSERVANCES) {
      expect(item.lunarMonth).toBeGreaterThanOrEqual(1);
      expect(item.lunarMonth).toBeLessThanOrEqual(12);
      expect(item.lunarDay).toBeGreaterThanOrEqual(1);
      expect(item.lunarDay).toBeLessThanOrEqual(30);
      expect(DEITY_OBSERVANCE_TYPE_LABELS[item.eventType]).toBeTruthy();
      expect(item.traditionNote.trim()).not.toBe('');
    }
  });

  it('requires at least two agreeing folk tables for entries added after the government survey link died', () => {
    const expanded = DEITY_OBSERVANCES.filter((item) => item.reviewedAt >= '2026-10-16');
    expect(expanded.length).toBeGreaterThan(0);
    for (const item of expanded) {
      const folkCount = item.sourceIds.filter((id) => FOLK_SOURCE_IDS.has(id)).length;
      expect(folkCount).toBeGreaterThanOrEqual(2);
      expect(item.reviewStatus).toBe('tradition-needs-local-check');
    }
  });

  it('documents sources whose original link is gone', () => {
    for (const source of DEITY_CALENDAR_SOURCES) {
      expect(source.url).toMatch(/^https:\/\//);
    }
    const yonghe = DEITY_CALENDAR_SOURCES.find((source) => source.id === 'yonghe-temple-survey');
    expect(yonghe?.note).toContain('失效');
  });

  it('resolves a next occurrence for every observance', () => {
    const from = new Date(2026, 0, 1);
    for (const item of DEITY_OBSERVANCES) {
      expect(getNextDeityObservanceOccurrence(item.id, from)).not.toBeNull();
    }
  });
});
