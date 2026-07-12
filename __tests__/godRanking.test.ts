import { gods } from '@/data/gods';
import { rankGods } from '@/services/godRanking';
import type { DivinationRecord } from '@/services/storage';

function record(godName: string, timestamp = Date.now()): DivinationRecord {
  return { id: godName + timestamp, godName, timestamp, question: '', questionCategory: 'general', poem: {} as DivinationRecord['poem'] };
}

describe('rankGods', () => {
  it('places the patron god before the original order', () => {
    const target = gods[gods.length - 1];
    expect(rankGods(gods, { patronGodId: target.id })[0].god.id).toBe(target.id);
  });

  it('places the preferred god first when no patron is configured', () => {
    const target = gods[gods.length - 2];
    expect(rankGods(gods, { preferredGodId: target.id })[0].god.id).toBe(target.id);
  });

  it('uses history frequency and recency without changing equal-score order', () => {
    const target = gods[gods.length - 1];
    const ranked = rankGods(gods, { history: [record(target.name), record(target.name)] });
    expect(ranked[0].god.id).toBe(target.id);
    expect(ranked[0].badges).toContain('曾請示 2 次');
    expect(rankGods(gods, {}).map((item) => item.god.id)).toEqual(gods.map((god) => god.id));
  });
});
