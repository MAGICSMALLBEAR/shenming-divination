import {
  getFestivalForDate,
  getUpcomingFestivals,
} from '@/data/festivals';
import { getTodayFullLunarInfo } from '@/data/lunarFullCalendar';
import {
  getDeityCalendarSources,
  getDeityObservanceById,
  getDeityObservanceReminders,
  getNextDeityObservanceOccurrence,
  getTodayRecommendedDeity,
  getUpcomingDeityObservances,
} from '@/services/lunarDeityCalendar';

describe('unified calendar consumers', () => {
  it('uses the same accurate lunar date on the full daily calendar', () => {
    const info = getTodayFullLunarInfo(new Date(2026, 4, 9, 12));

    expect(info?.lunarDate).toBe('農曆3月23日');
    expect(info?.godBirthday).toBe('天上聖母聖誕');
  });

  it('resolves lunar festivals dynamically across solar years', () => {
    const dragonBoat2026 = getFestivalForDate(new Date(2026, 5, 19, 12));
    const dragonBoat2027 = getFestivalForDate(new Date(2027, 5, 9, 12));

    expect(dragonBoat2026).toMatchObject({ id: 'duan-wu', solarDate: '6/19' });
    expect(dragonBoat2027).toMatchObject({ id: 'duan-wu', solarDate: '6/9' });
  });

  it('finds festivals and deity observances across a year boundary', () => {
    const fromDate = new Date(2026, 11, 30, 12);
    const festivals = getUpcomingFestivals(60, fromDate);
    const observances = getUpcomingDeityObservances(60, fromDate);

    expect(festivals.map((item) => item.id)).toContain('chun-jie-2');
    expect(observances.length).toBeGreaterThan(0);
    expect(observances.some((item) => item.title === '玉皇上帝聖誕')).toBe(true);
  });

  it('builds exact reminder dates for the evening before an observance', () => {
    const reminders = getDeityObservanceReminders(new Date(2027, 3, 1, 10), 60);
    const mazu = reminders.find((item) => item.title === '天上聖母聖誕');

    expect(mazu?.solarDateStr).toBe('4/29');
    expect(mazu?.reminderDate.getFullYear()).toBe(2027);
    expect(mazu?.reminderDate.getMonth()).toBe(3);
    expect(mazu?.reminderDate.getDate()).toBe(28);
    expect(mazu?.reminderDate.getHours()).toBe(20);
  });

  it('uses the observance deity for the temple recommendation', () => {
    const recommendation = getTodayRecommendedDeity(new Date(2027, 3, 29, 12));

    expect(recommendation).toMatchObject({ godId: 3, isSpecialDay: true });
    expect(recommendation.reason).toContain('天上聖母聖誕');
  });

  it('keeps provenance and next occurrence available for detail pages', () => {
    const observance = getDeityObservanceById('mazu-birthday');

    expect(observance?.reviewStatus).toBe('government-reference');
    expect(observance ? getDeityCalendarSources(observance).length : 0).toBeGreaterThan(1);
    expect(getNextDeityObservanceOccurrence('mazu-birthday', new Date(2027, 0, 1, 12))?.dateKey)
      .toBe('2027-04-29');
  });
});
