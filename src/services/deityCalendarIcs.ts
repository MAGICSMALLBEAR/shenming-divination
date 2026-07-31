import type { DeityObservanceOccurrence } from '@/services/lunarDeityCalendar';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatIcsDate(date: Date): string {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('');
}

function formatUtcTimestamp(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldIcsLine(line: string): string[] {
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 73) {
    chunks.push(`${chunks.length ? ' ' : ''}${remaining.slice(0, 73)}`);
    remaining = remaining.slice(73);
  }
  chunks.push(`${chunks.length ? ' ' : ''}${remaining}`);
  return chunks;
}

export function buildDeityCalendarIcs(
  occurrences: readonly DeityObservanceOccurrence[],
  calendarName = '神明日曆',
  generatedAt = new Date(),
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shenming Divination//Deity Calendar//ZH-TW',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];

  for (const item of occurrences) {
    const nextDay = new Date(
      item.date.getFullYear(),
      item.date.getMonth(),
      item.date.getDate() + 1,
      12,
    );
    const description = [
      item.lunar.label,
      item.observance.traditionNote,
      '各宮廟傳承可能不同，請以實際參拜宮廟公告為準。',
    ].join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.observance.id}-${item.dateKey}@shenming-divination`,
      `DTSTAMP:${formatUtcTimestamp(generatedAt)}`,
      `DTSTART;VALUE=DATE:${formatIcsDate(item.date)}`,
      `DTEND;VALUE=DATE:${formatIcsDate(nextDay)}`,
      `SUMMARY:${escapeIcsText(item.observance.title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.flatMap(foldIcsLine).join('\r\n') + '\r\n';
}
