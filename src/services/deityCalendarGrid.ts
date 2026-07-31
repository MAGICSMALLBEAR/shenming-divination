import {
  getDeityObservancesForDate,
  type DeityObservanceOccurrence,
} from '@/services/lunarDeityCalendar';

export interface DeityCalendarGridDay {
  date: Date;
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  occurrences: DeityObservanceOccurrence[];
}

export interface DeityCalendarFilter {
  query?: string;
  godId?: number | null;
}

function formatDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function buildDeityCalendarMonthGrid(
  year: number,
  month: number,
  today = new Date(),
): DeityCalendarGridDay[] {
  const firstDay = new Date(year, month - 1, 1, 12);
  const gridStart = new Date(year, month - 1, 1 - firstDay.getDay(), 12);
  const todayKey = formatDateKey(today);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
      12,
    );
    const dateKey = formatDateKey(date);
    return {
      date,
      dateKey,
      day: date.getDate(),
      inCurrentMonth: date.getFullYear() === year && date.getMonth() === month - 1,
      isToday: dateKey === todayKey,
      occurrences: getDeityObservancesForDate(date),
    };
  });
}

export function filterDeityOccurrences(
  occurrences: readonly DeityObservanceOccurrence[],
  filter: DeityCalendarFilter,
): DeityObservanceOccurrence[] {
  const query = filter.query?.trim().toLocaleLowerCase('zh-TW') ?? '';
  return occurrences.filter((item) => {
    if (filter.godId && item.god.id !== filter.godId) return false;
    if (!query) return true;
    const searchable = [
      item.god.name,
      item.god.title,
      item.observance.title,
      item.observance.traditionNote,
      item.lunar.label,
      item.solarLabel,
    ].join(' ').toLocaleLowerCase('zh-TW');
    return searchable.includes(query);
  });
}
