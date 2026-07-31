import { buildDeityCalendarIcs } from '@/services/deityCalendarIcs';
import { getDeityObservancesForDate } from '@/services/lunarDeityCalendar';

describe('deity calendar ICS', () => {
  it('exports valid all-day calendar events with a non-inclusive end date', () => {
    const occurrences = getDeityObservancesForDate(new Date(2026, 4, 9, 12));
    const ics = buildDeityCalendarIcs(
      occurrences,
      '2026 神明日曆',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260509');
    expect(ics).toContain('DTEND;VALUE=DATE:20260510');
    expect(ics).toContain('SUMMARY:天上聖母聖誕');
    expect(ics).toContain('UID:mazu-birthday-2026-05-09@shenming-divination');
    expect(ics).toContain('END:VCALENDAR\r\n');
  });

  it('escapes punctuation and line breaks in text fields', () => {
    const occurrence = getDeityObservancesForDate(new Date(2026, 4, 9, 12))[0];
    const customized = {
      ...occurrence,
      observance: {
        ...occurrence.observance,
        title: '測試,標題;內容',
        traditionNote: '第一行\n第二行',
      },
    };

    const ics = buildDeityCalendarIcs([customized]);
    expect(ics).toContain('SUMMARY:測試\\,標題\\;內容');
    expect(ics).toContain('第一行\\n第二行');
  });
});
