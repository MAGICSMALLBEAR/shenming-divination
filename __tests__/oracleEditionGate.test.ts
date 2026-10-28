jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import {
  getOracleEditionGateErrors,
  getSelectableOracleEditions,
  isOracleEditionSelectable,
  oracleEditions,
  type OracleEdition,
} from '@/data/oracleEditionRegistry';
import { getPoemsByGod } from '@/data/gods';
import { yuelaoTaiwanPoems } from '@/data/poems/yuelao';
import { getSelectedOracleEditionId, saveOracleEditionSelection } from '@/services/oracleEditionPreferences';
import {
  getTianhouCupLabel,
  resolveTianhouThreeCupNumber,
  TIANHOU_THREE_CUP_PATTERNS,
} from '@/services/threeCupOracle';

describe('候選籤本發布閘門', () => {
  it('keeps all seven new candidates out of selectors and draw pools', async () => {
    const candidates = oracleEditions.filter(
      (edition) => edition.status === 'draft' || edition.status === 'verified'
    );
    expect(candidates).toHaveLength(7);
    expect(candidates.filter((edition) => edition.status === 'verified')).toHaveLength(3);
    for (const godId of [2, 3, 13, 24, 38, 43]) {
      expect(getSelectableOracleEditions(godId).every((edition) => edition.status === 'legacy')).toBe(true);
    }
    expect(await saveOracleEditionSelection(13, 'tainan-tianhou-yuelao-27')).toBe(false);
    expect(getSelectedOracleEditionId(13)).toBe('yuelao-taiwan-100');
    expect(getPoemsByGod(13)).toHaveLength(100);
  });

  it('records transcription progress without opening the publish gate', () => {
    const expected: Record<string, [number, number]> = {
      'zizhu-guanyin-28': [28, 28],
      'wenwu-yuelao-40': [40, 40],
      'cifeng-mazu-100': [100, 99],
      'tainan-tianhou-yuelao-27': [27, 27],
    };
    for (const [editionId, [transcribed, clean]] of Object.entries(expected)) {
      const edition = oracleEditions.find((item) => item.id === editionId);
      expect(edition?.transcription).toMatchObject({
        expectedCount: transcribed,
        transcribedCount: transcribed,
        cleanCount: clean,
        verifiedAt: '2026-10-28',
      });
      expect(edition?.sourceVerified).toBe(true);
      // Rights are still unconfirmed, so the text must not become drawable.
      expect(edition?.rightsCleared).toBe(false);
      expect(isOracleEditionSelectable(edition!)).toBe(false);
    }
    const cifeng = oracleEditions.find((item) => item.id === 'cifeng-mazu-100');
    expect(cifeng?.textVerified).toBe(false);
    expect(cifeng?.transcription?.issues?.join()).toContain('第 49 首');
  });

  it('requires verified text, rights and a complete draw pool for new publications', () => {
    const candidate: OracleEdition = {
      id: 'test-published', godId: 13, label: 'test', temple: 'test',
      expectedCount: 27, status: 'published', drawMethod: 'three-cup-direct',
      sourceUrl: 'https://example.org/official-index', sourceVerified: false,
      textVerified: false, rightsCleared: false, poems: yuelaoTaiwanPoems.slice(0, 26),
    };
    expect(isOracleEditionSelectable(candidate)).toBe(false);
    expect(getOracleEditionGateErrors(candidate)).toEqual(expect.arrayContaining([
      '逐首來源尚未核定', '原文尚未逐首校對', 'App 展示權尚未確認', '可抽籤資料未齊',
    ]));
    const ready = { ...candidate, sourceVerified: true, textVerified: true, rightsCleared: true, poems: yuelaoTaiwanPoems.slice(0, 27) };
    expect(isOracleEditionSelectable(ready)).toBe(true);
    expect(isOracleEditionSelectable({ ...ready, status: 'withdrawn' })).toBe(false);
  });
});

describe('大天后宮月老三筊定籤', () => {
  it('maps all 27 ordered combinations to distinct official numbers', () => {
    expect(TIANHOU_THREE_CUP_PATTERNS).toHaveLength(27);
    expect(new Set(TIANHOU_THREE_CUP_PATTERNS.map((pattern) => pattern.join(','))).size).toBe(27);
    TIANHOU_THREE_CUP_PATTERNS.forEach((pattern, index) => {
      expect(resolveTianhouThreeCupNumber(pattern)).toBe(index + 1);
    });
    expect(resolveTianhouThreeCupNumber(['shengbei', 'yinbei', 'xiaobei'])).toBe(9);
    expect(resolveTianhouThreeCupNumber(['xiaobei', 'xiaobei', 'xiaobei'])).toBe(10);
    expect(resolveTianhouThreeCupNumber(['yinbei', 'xiaobei', 'yinbei'])).toBe(27);
    expect(resolveTianhouThreeCupNumber(['shengbei', 'yinbei'])).toBeNull();
    expect(getTianhouCupLabel('xiaobei')).toBe('陽');
  });
});
