import type { DreamJournalEntry } from '@/services/dreamJournal';

export interface DreamCount {
  label: string;
  count: number;
}

export interface DreamWeek {
  key: string;
  label: string;
  count: number;
}

export interface DreamInsights {
  total: number;
  last30Days: number;
  recurringSymbols: DreamCount[];
  feelings: DreamCount[];
  tags: DreamCount[];
  weeks: DreamWeek[];
  recurringMessage?: string;
}

function countBy(values: string[]): DreamCount[] {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function localDayStart(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function mondayOf(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay() || 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day + 1).getTime();
}

function formatWeek(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(timestamp);
}

export function getDreamInsights(entries: DreamJournalEntry[], now = Date.now()): DreamInsights {
  const thirtyDaysAgo = localDayStart(now) - 29 * 24 * 60 * 60 * 1000;
  const last30Days = entries.filter((entry) => entry.createdAt >= thirtyDaysAgo);
  const symbolCounts = countBy(entries.flatMap((entry) => entry.result.symbols));
  const feelings = countBy(entries.map((entry) => entry.feeling?.trim() ?? ''));
  const tags = countBy(entries.flatMap((entry) => entry.tags));
  const currentWeek = mondayOf(now);
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const start = currentWeek - (7 - index) * 7 * 24 * 60 * 60 * 1000;
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return { key: String(start), label: formatWeek(start), count: entries.filter((entry) => entry.createdAt >= start && entry.createdAt < end).length };
  });
  const repeated = symbolCounts.filter((item) => item.count >= 2).slice(0, 3);
  const recurringMessage = repeated.length
    ? `近期反覆出現「${repeated.map((item) => item.label).join('、')}」。它們不代表預言，可作為回看近況與情緒的線索。`
    : undefined;
  return { total: entries.length, last30Days: last30Days.length, recurringSymbols: symbolCounts.slice(0, 8), feelings: feelings.slice(0, 6), tags: tags.slice(0, 6), weeks, recurringMessage };
}
