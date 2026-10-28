import { act, renderHook } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/services/ai', () => ({ getAIInterpretation: jest.fn(async () => '測試解籤') }));
jest.mock('@/services/reviewService', () => ({
  shouldRequestReview: jest.fn(async () => false),
  requestReview: jest.fn(),
}));

import * as registry from '@/data/oracleEditionRegistry';
import * as selection from '@/data/oracleEditionSelection';
import { yuelaoTaiwanPoems } from '@/data/poems/yuelao';
import { useDivination } from '@/hooks/useDivination';

describe('三筊直接定籤流程', () => {
  it('uses the ordered cup pattern as the poem number without another verification', async () => {
    const edition: registry.OracleEdition = {
      id: 'tainan-tianhou-yuelao-27', godId: 13, label: '測試三筊籤', temple: '祀典大天后宮',
      expectedCount: 27, status: 'published', drawMethod: 'three-cup-direct',
      sourceUrl: 'https://example.org/official-index', sourceVerified: true,
      textVerified: true, rightsCleared: true, poems: yuelaoTaiwanPoems.slice(0, 27),
    };
    const originalResolve = registry.resolveOracleEdition;
    const resolveSpy = jest.spyOn(registry, 'resolveOracleEdition').mockImplementation((godId, preferredId) =>
      godId === 13 ? edition : originalResolve(godId, preferredId));
    const selectionSpy = jest.spyOn(selection, 'getSelectedOracleEditionId').mockReturnValue(edition.id);
    let random: jest.SpyInstance | null = null;
    try {
      const { result } = await renderHook(() => useDivination());
      await act(async () => result.current.selectGod(13));
      await act(async () => result.current.startMeditation('感情方向', 'marriage', '善信'));
      await act(async () => result.current.finishMeditation());
      expect(result.current.step).toBe('three-cup-draw');

      random = jest.spyOn(Math, 'random').mockReturnValue(0.1); // 聖
      await act(async () => result.current.performVerificationJiaobei());
      random.mockReturnValue(0.9); // 陰
      await act(async () => result.current.performVerificationJiaobei());
      random.mockReturnValue(0.6); // 陽
      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => result.current.completeThreeCupDraw());
      expect(result.current.pendingPoem?.number).toBe(9);
      expect(result.current.step).toBe('drawing');

      await act(async () => result.current.finishDrawAnimation());
      expect(result.current.step).toBe('result');
      expect(result.current.currentRecord?.poem.number).toBe(9);
      expect(result.current.currentRecord?.ritualPattern).toEqual(['shengbei', 'yinbei', 'xiaobei']);
      expect(result.current.currentRecord?.editionId).toBe(edition.id);
      expect(result.current.currentRecord?.poemConfirmed).toBeUndefined();
    } finally {
      random?.mockRestore();
      selectionSpy.mockRestore();
      resolveSpy.mockRestore();
    }
  });
});
