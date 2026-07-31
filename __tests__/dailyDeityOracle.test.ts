import { getPoemsByGod } from '@/data/gods';
import {
  DAILY_DEITY_CALENDAR_VERSION,
  formatDailyDeityDateKey,
  getDailyDeityOracle,
} from '@/services/dailyDeityOracle';

describe('daily deity oracle', () => {
  it('returns the same deity and poem for the same local date', () => {
    const morning = getDailyDeityOracle(new Date(2026, 6, 26, 8, 30));
    const evening = getDailyDeityOracle(new Date(2026, 6, 26, 22, 45));

    expect(morning.dateKey).toBe('2026-07-26');
    expect(evening.dateKey).toBe(morning.dateKey);
    expect(evening.god.id).toBe(morning.god.id);
    expect(evening.poem.id).toBe(morning.poem.id);
    expect(evening.calendarVersion).toBe(DAILY_DEITY_CALENDAR_VERSION);
  });

  it('uses the festival deity before the normal rotation', () => {
    const dragonBoatFestival = getDailyDeityOracle(new Date(2026, 5, 19, 12));

    expect(dragonBoatFestival.reason).toBe('festival');
    expect(dragonBoatFestival.festival?.id).toBe('duan-wu');
    expect(dragonBoatFestival.god.id).toBe(1);
  });

  it('uses an accurate lunar observance before fixed festivals and rotation', () => {
    const mazuBirthday2026 = getDailyDeityOracle(new Date(2026, 4, 9, 12));
    const mazuBirthday2027 = getDailyDeityOracle(new Date(2027, 3, 29, 12));

    expect(mazuBirthday2026.reason).toBe('observance');
    expect(mazuBirthday2027.reason).toBe('observance');
    expect(mazuBirthday2027.observances[0].observance.id).toBe('mazu-birthday');
    expect(mazuBirthday2027.god.id).toBe(3);
  });

  it('does not reuse the fixed 2026 festival table in later years', () => {
    const laterYear = getDailyDeityOracle(new Date(2027, 4, 11, 12));

    expect(laterYear.reason).toBe('rotation');
    expect(laterYear.festival).toBeNull();
  });

  it('always chooses a poem from the selected deity pool', () => {
    for (let day = 0; day < 366; day += 1) {
      const date = new Date(2026, 0, 1 + day, 12);
      const oracle = getDailyDeityOracle(date);
      const matchingPoem = getPoemsByGod(oracle.god.id)
        .some((poem) => poem.id === oracle.poem.id && poem.number === oracle.poem.number);

      expect(matchingPoem).toBe(true);
      expect(['下下', '中下']).not.toContain(oracle.poem.level);
      expect(oracle.dailyMessage.length).toBeGreaterThan(0);
      expect(oracle.dailyAction.length).toBeGreaterThan(0);
    }
  });

  it('rotates through a broad set of gods during a year', () => {
    const godIds = new Set<number>();
    for (let day = 0; day < 365; day += 1) {
      godIds.add(getDailyDeityOracle(new Date(2027, 0, 1 + day, 12)).god.id);
    }

    expect(godIds.size).toBeGreaterThanOrEqual(50);
  });

  it('formats date keys without UTC date drift', () => {
    expect(formatDailyDeityDateKey(new Date(2026, 0, 2, 0, 5))).toBe('2026-01-02');
  });
});
