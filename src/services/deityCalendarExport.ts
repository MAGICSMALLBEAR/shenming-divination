import { Platform } from 'react-native';

import { buildDeityCalendarIcs } from '@/services/deityCalendarIcs';
import {
  getDeityObservancesForSolarYear,
  type DeityObservanceOccurrence,
} from '@/services/lunarDeityCalendar';

export type CalendarExportResult =
  | { status: 'downloaded' | 'shared'; count: number }
  | { status: 'unavailable'; count: number };

export type AddCalendarResult =
  | { status: 'opened' | 'saved' | 'cancelled' }
  | { status: 'unsupported' | 'permission-denied' | 'unavailable' };

function downloadIcsOnWeb(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportDeityOccurrences(
  occurrences: readonly DeityObservanceOccurrence[],
  filename: string,
  calendarName: string,
): Promise<CalendarExportResult> {
  const content = buildDeityCalendarIcs(occurrences, calendarName);
  if (Platform.OS === 'web') {
    downloadIcsOnWeb(content, filename);
    return { status: 'downloaded', count: occurrences.length };
  }

  const [{ File, Paths }, Sharing] = await Promise.all([
    import('expo-file-system'),
    import('expo-sharing'),
  ]);
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return { status: 'unavailable', count: occurrences.length };

  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/calendar',
    dialogTitle: `匯出${calendarName}`,
    UTI: 'public.calendar-event',
  });
  return { status: 'shared', count: occurrences.length };
}

export async function exportDeityCalendarYear(year: number): Promise<CalendarExportResult> {
  return exportDeityOccurrences(
    getDeityObservancesForSolarYear(year),
    `shenming-calendar-${year}.ics`,
    `${year} 神明日曆`,
  );
}

export async function addDeityOccurrenceToDeviceCalendar(
  occurrence: DeityObservanceOccurrence,
): Promise<AddCalendarResult> {
  if (Platform.OS === 'web') return { status: 'unsupported' };

  try {
    const Calendar = await import('expo-calendar');
    const permission = await Calendar.requestCalendarPermissions(Platform.OS === 'ios');
    if (permission.status !== 'granted') return { status: 'permission-denied' };

    let targetCalendar;
    if (Platform.OS === 'ios') {
      targetCalendar = Calendar.getDefaultCalendarSync();
    } else {
      const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
      const writable = calendars.filter((item) => item.allowsModifications);
      targetCalendar = writable.find((item) => item.isPrimary) ?? writable[0];
    }
    if (!targetCalendar) return { status: 'unavailable' };

    const startDate = new Date(
      occurrence.date.getFullYear(),
      occurrence.date.getMonth(),
      occurrence.date.getDate(),
    );
    const endDate = new Date(
      occurrence.date.getFullYear(),
      occurrence.date.getMonth(),
      occurrence.date.getDate() + 1,
    );
    const result = await targetCalendar.addEventWithForm({
      title: occurrence.observance.title,
      startDate,
      endDate,
      allDay: true,
      notes: [
        occurrence.lunar.label,
        occurrence.observance.traditionNote,
        '各宮廟傳承可能不同，請以實際參拜宮廟公告為準。',
      ].join('\n'),
    });

    if (result.action === Calendar.CalendarDialogResultActions.canceled) {
      return { status: 'cancelled' };
    }
    if (result.action === Calendar.CalendarDialogResultActions.saved) {
      return { status: 'saved' };
    }
    return { status: 'opened' };
  } catch {
    return { status: 'unavailable' };
  }
}
