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

describe('deity calendar ICS folding and subscription', () => {
  it('folds long lines at 75 UTF-8 octets without splitting characters', () => {
    const occurrence = getDeityObservancesForDate(new Date(2026, 4, 9, 12))[0];
    const longNote = '媽祖信仰在臺灣各地都有不同的遶境與祭典傳承，'.repeat(6);
    const ics = buildDeityCalendarIcs([
      { ...occurrence, observance: { ...occurrence.observance, traditionNote: longNote } },
    ]);
    const lines = ics.split('\r\n').filter(Boolean);
    for (const line of lines) {
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
    }
    expect(ics.replace(/\r\n /g, '')).toContain(longNote);
  });

  it('adds refresh hints only for subscription feeds', () => {
    const occurrences = getDeityObservancesForDate(new Date(2026, 4, 9, 12));
    expect(buildDeityCalendarIcs(occurrences)).not.toContain('REFRESH-INTERVAL');
    const feed = buildDeityCalendarIcs(occurrences, '神明日曆', new Date(), { refreshHours: 24 });
    expect(feed).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT24H');
    expect(feed).toContain('X-PUBLISHED-TTL:PT24H');
  });
});
