import {
  getDeityObservancesForDate,
  getDeityObservancesForSolarMonth,
  getLunarDate,
} from '@/services/lunarDeityCalendar';

describe('lunar deity calendar', () => {
  it('converts solar dates to the correct lunar date across years', () => {
    expect(getLunarDate(new Date(2026, 4, 9, 12))).toMatchObject({ month: 3, day: 23, isLeapMonth: false });
    expect(getLunarDate(new Date(2027, 3, 29, 12))).toMatchObject({ month: 3, day: 23, isLeapMonth: false });
  });

  it('matches Mazu birthday in different solar years', () => {
    const in2026 = getDeityObservancesForDate(new Date(2026, 4, 9, 12));
    const in2027 = getDeityObservancesForDate(new Date(2027, 3, 29, 12));

    expect(in2026.map((item) => item.observance.id)).toContain('mazu-birthday');
    expect(in2027.map((item) => item.observance.id)).toContain('mazu-birthday');
    expect(in2027[0].god.id).toBe(3);
  });

  it('keeps multiple deity observances that share one lunar date', () => {
    const observances = getDeityObservancesForDate(new Date(2026, 2, 20, 12));

    expect(observances.map((item) => item.observance.id)).toEqual([
      'earth-god-birthday',
      'jigong-birthday',
    ]);
  });

  it('does not treat a leap lunar month as the regular observance month', () => {
    let leapDate: Date | null = null;
    for (let day = 0; day < 366; day += 1) {
      const candidate = new Date(2025, 0, 1 + day, 12);
      if (getLunarDate(candidate).isLeapMonth) {
        leapDate = candidate;
        break;
      }
    }

    expect(leapDate).not.toBeNull();
    expect(getDeityObservancesForDate(leapDate as Date)).toEqual([]);
  });

  it('returns a chronological solar-month agenda', () => {
    const may2026 = getDeityObservancesForSolarMonth(2026, 5);

    expect(may2026.map((item) => item.observance.id)).toContain('mazu-birthday');
    expect(may2026.find((item) => item.observance.id === 'mazu-birthday')?.dateKey).toBe('2026-05-09');
    expect(may2026.map((item) => item.date.getTime())).toEqual(
      [...may2026].map((item) => item.date.getTime()).sort((left, right) => left - right),
    );
  });
});
