import { act, renderHook } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/services/ai', () => ({ getAIInterpretation: jest.fn(async () => '測試解籤') }));
jest.mock('@/services/reviewService', () => ({
  shouldRequestReview: jest.fn(async () => false),
  requestReview: jest.fn(),
}));

import { gods } from '@/data/gods';
import { useDivination } from '@/hooks/useDivination';
import { getAIInterpretation } from '@/services/ai';
import { getLastPoemContext } from '@/services/storage';
import * as registry from '@/data/oracleEditionRegistry';
import * as selection from '@/data/oracleEditionSelection';

describe('求籤主流程', () => {
  it.each(['yuelao-taiwan-100', 'yuelao-hongkong-101'])('passes drawn edition %s to AI, history and follow-up storage', async (editionId) => {
    const selectionSpy = jest.spyOn(selection, 'getSelectedOracleEditionId').mockReturnValue(editionId);
    const edition = registry.getOracleEditionById(editionId)!;
    try {
      const { result } = await renderHook(() => useDivination());
      await act(async () => result.current.selectGod(13));
      await act(async () => result.current.startMeditation('感情方向', 'love', '善信'));
      await act(async () => result.current.chooseDrawMethod('direct'));
      await act(async () => result.current.finishDrawAnimation());
      expect(result.current.step).toBe('result');
      expect(getAIInterpretation).toHaveBeenLastCalledWith(expect.objectContaining({
        editionId, editionLabel: edition.label, editionTemple: edition.temple,
        editionVersionTag: expect.stringContaining(editionId === 'yuelao-taiwan-100' ? 'taiwan' : 'hongkong'),
        editionSource: expect.any(String), drawMethod: 'direct',
        poemContent: result.current.drawnPoem!.content,
      }));
      const request = (getAIInterpretation as jest.Mock).mock.calls.at(-1)![0];
      for (const stored of [result.current.currentRecord, await getLastPoemContext()]) {
        expect(stored).toMatchObject({
          editionId, editionLabel: request.editionLabel, editionVersionTag: request.editionVersionTag,
          editionSource: request.editionSource, drawMethod: request.drawMethod,
        });
      }
    } finally {
      selectionSpy.mockRestore();
    }
  });

  it('靜心完成後直接進入搖籤，無抽前擲筊', async () => {
    const god = gods.find((item) => item.poemSystem !== '諸葛神數')!;
    const { result } = await renderHook(() => useDivination());

    await act(async () => result.current.selectGod(god.id));
    await act(async () => result.current.startMeditation('工作方向', 'career', '善信'));
    await act(async () => result.current.finishMeditation());

    expect(result.current.step).toBe('drawing');
    expect(result.current.drawPhase).toBe('shaking');
    expect(result.current.drawMethod).toBe('shake');
  });

  it('驗籤失敗時作廢目前籤號並回籤筒', async () => {
    jest.useFakeTimers();
    const god = gods.find((item) => item.poemSystem !== '諸葛神數')!;
    const { result } = await renderHook(() => useDivination());

    await act(async () => result.current.selectGod(god.id));
    await act(async () => result.current.chooseDrawMethod('auto'));
    expect(result.current.pendingPoem).not.toBeNull();

    await act(async () => result.current.finishDrawAnimation());
    expect(result.current.step).toBe('verify-poem');
    expect(result.current.drawnPoem).not.toBeNull();

    await act(async () => result.current.rejectVerification());
    expect(result.current.step).toBe('drawing');
    expect(result.current.drawPhase).toBe('shaking');
    expect(result.current.drawMethod).toBe('shake');
    expect(result.current.drawnPoem).toBeNull();
    expect(result.current.verificationResults).toEqual([]);
    expect(result.current.currentRecord).toBeNull();
    await act(async () => { jest.advanceTimersByTime(2000); });
    jest.useRealTimers();
  });

  it('只有三次連續聖筊才會解籤並將確認結果存檔', async () => {
    const god = gods.find((item) => item.poemSystem !== '諸葛神數')!;
    const { result } = await renderHook(() => useDivination());
    await act(async () => result.current.selectGod(god.id));
    await act(async () => result.current.chooseDrawMethod('auto'));
    await act(async () => result.current.finishDrawAnimation());

    const random = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => result.current.completeVerification());
      expect(result.current.step).toBe('verify-poem');
      expect(result.current.currentRecord).toBeNull();

      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => result.current.completeVerification());
      expect(result.current.step).toBe('result');
      expect(result.current.currentRecord?.poemConfirmed).toBe(true);
      expect(result.current.currentRecord?.poemConfirmResult).toBe('連續三次聖筊確認');
    } finally {
      random.mockRestore();
    }
  });

  it('第三次聖筊的延遲 callback 仍會顯示籤詩結果', async () => {
    const god = gods.find((item) => item.poemSystem !== '隢貉?蟡')!;
    const { result } = await renderHook(() => useDivination());
    await act(async () => result.current.selectGod(god.id));
    await act(async () => result.current.chooseDrawMethod('auto'));
    await act(async () => result.current.finishDrawAnimation());

    // Jiaobei schedules this before onToss triggers a state rerender.
    const delayedCompletion = result.current.completeVerification;
    const random = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => result.current.performVerificationJiaobei());
      await act(async () => delayedCompletion());

      expect(result.current.step).toBe('result');
      expect(result.current.currentRecord?.poemConfirmed).toBe(true);
    } finally {
      random.mockRestore();
    }
  });
});
