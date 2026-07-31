import {
  buildDeityCalendarMonthGrid,
  filterDeityOccurrences,
} from '@/services/deityCalendarGrid';
import { getDeityObservancesForSolarMonth } from '@/services/lunarDeityCalendar';

describe('deity calendar grid', () => {
  it('builds a complete six-week Sunday-first grid', () => {
    const grid = buildDeityCalendarMonthGrid(2026, 5, new Date(2026, 4, 9, 12));

    expect(grid).toHaveLength(42);
    expect(grid[0].dateKey).toBe('2026-04-26');
    expect(grid[41].dateKey).toBe('2026-06-06');
    expect(grid.find((day) => day.dateKey === '2026-05-09')).toMatchObject({
      inCurrentMonth: true,
      isToday: true,
    });
    expect(
      grid.find((day) => day.dateKey === '2026-05-09')?.occurrences
        .map((item) => item.observance.id),
    ).toContain('mazu-birthday');
  });

  it('filters by deity and free-text query', () => {
    const may = getDeityObservancesForSolarMonth(2026, 5);

    expect(filterDeityOccurrences(may, { query: '媽祖' }).map((item) => item.god.id)).toEqual([3]);
    expect(filterDeityOccurrences(may, { godId: 3 }).map((item) => item.observance.id)).toEqual([
      'mazu-birthday',
    ]);
    expect(filterDeityOccurrences(may, { query: '不存在' })).toEqual([]);
  });
});
