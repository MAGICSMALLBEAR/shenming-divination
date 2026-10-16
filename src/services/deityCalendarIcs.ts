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

function utf8Length(char: string): number {
  const codePoint = char.codePointAt(0) ?? 0;
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  if (codePoint < 0x10000) return 3;
  return 4;
}

// RFC 5545 §3.1：每行最多 75 個位元組（不含 CRLF），續行以一個空白開頭；
// 依 UTF-8 位元組計算並以完整字元切分，避免中文被切成半個字。
const MAX_LINE_OCTETS = 75;

function foldIcsLine(line: string): string[] {
  const chunks: string[] = [];
  let current = '';
  let currentOctets = 0;
  for (const char of line) {
    const limit = chunks.length ? MAX_LINE_OCTETS - 1 : MAX_LINE_OCTETS;
    const octets = utf8Length(char);
    if (currentOctets + octets > limit) {
      chunks.push(chunks.length ? ` ${current}` : current);
      current = '';
      currentOctets = 0;
    }
    current += char;
    currentOctets += octets;
  }
  chunks.push(chunks.length ? ` ${current}` : current);
  return chunks;
}

export interface DeityCalendarIcsOptions {
  /** 訂閱用：建議行事曆軟體每隔幾小時重新抓取。 */
  refreshHours?: number;
}

export function buildDeityCalendarIcs(
  occurrences: readonly DeityObservanceOccurrence[],
  calendarName = '神明日曆',
  generatedAt = new Date(),
  options: DeityCalendarIcsOptions = {},
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shenming Divination//Deity Calendar//ZH-TW',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Asia/Taipei',
  ];
  if (options.refreshHours) {
    lines.push(
      `REFRESH-INTERVAL;VALUE=DURATION:PT${options.refreshHours}H`,
      `X-PUBLISHED-TTL:PT${options.refreshHours}H`,
    );
  }

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
