import { buildRecentHistorySummary, formatOracleAIContext } from '@/services/oracleAIContext';
import { yuelaoTaiwanPoems, yuelaoHongKongPoems } from '@/data/poems/yuelao';
import { gods } from '@/data/gods';
import type { DivinationRecord } from '@/services/storage';

const godName = gods.find((god) => god.id === 13)!.name;
const record: DivinationRecord = {
  id: 'tw', godName, poem: yuelaoTaiwanPoems[0], editionId: 'yuelao-taiwan-100',
  editionLabel: '當時的台灣版名稱', editionVersionTag: 'snapshot-v1',
  question: '感情', questionCategory: 'love', timestamp: 1,
};

it('keeps same-number history from different editions individually labelled', () => {
  const summary = buildRecentHistorySummary([
    record,
    { ...record, id: 'hk', poem: yuelaoHongKongPoems[0], editionId: 'yuelao-hongkong-101', editionLabel: '香港版', editionVersionTag: 'hk-v1' },
    { ...record, id: 'old', editionId: undefined, editionLabel: undefined, editionVersionTag: undefined },
    { ...record, id: 'other', questionCategory: 'career', editionLabel: '不相干紀錄' },
  ], 'love');
  expect(summary).toContain('當時的台灣版名稱/版次：snapshot-v1');
  expect(summary).toContain('香港版/版次：hk-v1');
  expect(summary).toContain('舊紀錄・版本未註明/版次：版本未註明');
  expect(summary).not.toContain('不相干紀錄');
});

it('marks uniquely inferred historical editions and limits the summary to three records', () => {
  const old = { ...record, poem: yuelaoHongKongPoems[100], editionId: undefined, editionLabel: undefined, editionVersionTag: undefined };
  const summary = buildRecentHistorySummary([old, record, record, { ...record, editionLabel: '第四筆' }], 'love');
  expect(summary).toContain('香港版 101 首（依籤文推定）/版次：版本未註明');
  expect(summary).not.toContain('第四筆');
});

it('preserves unknown versions in follow-up context instead of consulting the current selection', () => {
  expect(formatOracleAIContext({})).toBe('籤本：版本未註明\n版次：版本未註明');
  expect(formatOracleAIContext(record)).toContain('籤本：當時的台灣版名稱');
  expect(formatOracleAIContext(record)).toContain('版次：snapshot-v1');
});
