import { getDreamInsights } from '@/services/dreamInsights';
import type { DreamJournalEntry } from '@/services/dreamJournal';

const now = new Date(2026, 9, 28, 9).getTime();
const createEntry = (id: string, daysAgo: number, symbols: string[], feeling?: string): DreamJournalEntry => ({
  id,
  dream: '測試夢境',
  feeling,
  tags: ['反覆夢'],
  result: { symbols, interpretation: '測試', fortune: '中', advice: '測試' },
  createdAt: now - daysAgo * 24 * 60 * 60 * 1000,
});

describe('dream insights', () => {
  it('counts recurring symbols and recent entries', () => {
    const insights = getDreamInsights([
      createEntry('1', 1, ['蛇', '水'], '害怕'),
      createEntry('2', 4, ['蛇'], '平靜'),
      createEntry('3', 35, ['飛翔']),
    ], now);
    expect(insights.total).toBe(3);
    expect(insights.last30Days).toBe(2);
    expect(insights.recurringSymbols[0]).toEqual({ label: '蛇', count: 2 });
    expect(insights.recurringMessage).toContain('蛇');
  });

  it('returns eight weekly buckets even without dream entries', () => {
    const insights = getDreamInsights([], now);
    expect(insights.weeks).toHaveLength(8);
    expect(insights.weeks.every((week) => week.count === 0)).toBe(true);
  });
});
