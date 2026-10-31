jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/services/notifications', () => ({
  scheduleDreamReminder: jest.fn(async () => true),
  cancelDreamReminder: jest.fn(async () => true),
}));

import { deduplicateFavorites, setFavorites, getFavorites, type DivinationRecord } from '@/services/storage';
import { updateDreamEntry, saveDreamEntry, getDreamEntry, deleteDreamEntry } from '@/services/dreamJournal';
import { setDreamReminderTime, getDreamReminderPreferences, formatDreamReminderTime } from '@/services/dreamReminder';
import { yuelaoTaiwanPoems, yuelaoHongKongPoems } from '@/data/poems/yuelao';
import { gods } from '@/data/gods';
import { useDivination } from '@/hooks/useDivination';
import { act, renderHook } from '@testing-library/react-native';

describe('P1 功能測試', () => {
  beforeEach(async () => {
    await setFavorites([]);
  });

  describe('收藏資料去重與版次推定遷移', () => {
    it('自動補齊唯一可推定版次，並移除完全相同的重複收藏', async () => {
      const dummyPoem = yuelaoTaiwanPoems[0];
      const rec1: DivinationRecord = {
        id: 'rec_1',
        godName: '月下老人',
        poem: dummyPoem,
        question: '問感情',
        questionCategory: 'love',
        editionId: 'yuelao-taiwan-100',
        editionLabel: '月老靈籤・台灣版 100 首',
        timestamp: 1000,
      };
      const rec2: DivinationRecord = {
        id: 'rec_2',
        godName: '月下老人',
        poem: dummyPoem,
        question: '問感情',
        questionCategory: 'love',
        editionId: 'yuelao-taiwan-100',
        editionLabel: '月老靈籤・台灣版 100 首',
        timestamp: 2000,
      };
      const rec3: DivinationRecord = {
        id: 'rec_3',
        godName: '月下老人',
        poem: yuelaoHongKongPoems[100],
        question: '問姻緣',
        questionCategory: 'love',
        timestamp: 3000,
      };

      await setFavorites([rec1, rec2, rec3]);
      expect(await getFavorites()).toHaveLength(3);

      const result = await deduplicateFavorites();
      expect(result.beforeCount).toBe(3);
      expect(result.deduplicatedCount).toBe(1);
      expect(result.afterCount).toBe(2);

      const updated = await getFavorites();
      expect(updated).toHaveLength(2);
      const migrated = updated.find((r) => r.id === 'rec_3');
      expect(migrated?.editionId).toBe('yuelao-hongkong-101');
      expect(migrated?.editionLabel).toBe('月老靈籤・香港版 101 首');
    });
  });

  describe('夢境日記內容編輯與提醒時間自訂', () => {
    it('支援編輯夢境原文、感受與標籤', async () => {
      const entry = await saveDreamEntry({
        dream: '夢見自己在山林中走著',
        feeling: '平靜',
        tags: ['好夢'],
        result: {
          symbols: ['山'],
          interpretation: '象徵穩健',
          fortune: '吉',
          advice: '循序漸進',
        },
      });

      expect(entry.dream).toBe('夢見自己在山林中走著');
      await updateDreamEntry(entry.id, {
        dream: '夢見自己在高山之巔看雲海',
        feeling: '震撼感動',
        tags: ['好夢', '清醒夢'],
      });

      const updated = await getDreamEntry(entry.id);
      expect(updated?.dream).toBe('夢見自己在高山之巔看雲海');
      expect(updated?.feeling).toBe('震撼感動');
      expect(updated?.tags).toEqual(['好夢', '清醒夢']);

      await deleteDreamEntry(entry.id);
    });

    it('支援自訂早晨提醒時間並格式化輸出', async () => {
      await setDreamReminderTime(8, 15);
      const prefs = await getDreamReminderPreferences();
      expect(prefs.hour).toBe(8);
      expect(prefs.minute).toBe(15);
      expect(formatDreamReminderTime(prefs.hour, prefs.minute)).toBe('08:15');

      await setDreamReminderTime(7, 5);
      expect(formatDreamReminderTime(7, 5)).toBe('07:05');
    });
  });

  describe('取籤方式入口與切換', () => {
    it('支援從搖籤階段直接選擇心中報數，並以報數完成抽籤', async () => {
      const { result } = await renderHook(() => useDivination());
      const god = gods.find((g) => g.poemSystem !== '諸葛神數')!;
      await act(async () => result.current.selectGod(god.id));
      await act(async () => result.current.startMeditation('測試提問', 'career', '信眾'));
      await act(async () => result.current.finishMeditation());

      expect(result.current.step).toBe('drawing');
      expect(result.current.drawPhase).toBe('shaking');

      // Click 心中報數 from the drawing switcher
      await act(async () => result.current.chooseDrawMethod('number'));
      expect(result.current.step).toBe('enter-zhuge-number');

      // Submit a number
      await act(async () => result.current.performNumberDraw(88));
      expect(result.current.step).toBe('drawing');
      expect(result.current.drawPhase).toBe('revealing');

      await act(async () => result.current.finishDrawAnimation());
      expect(result.current.step).toBe('result');
      expect(result.current.drawnPoem).not.toBeNull();
    });

    it('支援直接點籤，省略三聖筊驗籤直接觀看結果', async () => {
      const { result } = await renderHook(() => useDivination());
      const god = gods.find((g) => g.poemSystem !== '諸葛神數')!;
      await act(async () => result.current.selectGod(god.id));
      await act(async () => result.current.chooseDrawMethod('direct'));
      expect(result.current.step).toBe('drawing');
      expect(result.current.drawPhase).toBe('revealing');

      await act(async () => result.current.finishDrawAnimation());
      expect(result.current.step).toBe('result');
    });
  });
});
