import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import SutraCopyScreen from '@/app/sutra-copy';
import { HEART_SUTRA_CHARS, HEART_SUTRA_TEXT } from '@/data/heartSutra';
import {
  calcStreak,
  checkInToday,
  getDailyPractice,
  localDateKey,
  recordSutraCopy,
  saveSutraDraft,
} from '@/services/dailyPractice';

const mockMemory = new Map<string, string>();
jest.mock('@/services/storage', () => ({
  getItem: jest.fn(async (key: string) => mockMemory.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockMemory.set(key, value); }),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));

beforeEach(() => mockMemory.clear());

describe('連續天數', () => {
  it('今天已簽到從今天往回數，今天還沒簽到從昨天往回數', () => {
    const days = ['2026-10-20', '2026-10-21', '2026-10-22'];
    expect(calcStreak([...days, '2026-10-23'], '2026-10-23')).toBe(4);
    expect(calcStreak(days, '2026-10-23')).toBe(3);
    expect(calcStreak(days, '2026-10-24')).toBe(0);
  });

  it('跨月份也連續', () => {
    expect(calcStreak(['2026-09-29', '2026-09-30', '2026-10-01'], '2026-10-01')).toBe(3);
  });

  it('本地日期格式', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('簽到與抄經紀錄', () => {
  it('同一天簽到兩次只算一次', async () => {
    const now = new Date(2026, 9, 23, 9);
    await checkInToday(now);
    const state = await checkInToday(now);
    expect(state.checkIns).toEqual(['2026-10-23']);
  });

  it('抄完一部心經會算當天簽到，並清掉草稿', async () => {
    const now = new Date(2026, 9, 23, 21);
    await saveSutraDraft('觀自在', now);
    expect((await getDailyPractice()).sutraDraft?.text).toBe('觀自在');
    const state = await recordSutraCopy(now);
    expect(state.checkIns).toEqual(['2026-10-23']);
    expect(state.sutraCopies).toEqual(['2026-10-23']);
    expect(state.sutraDraft).toBeUndefined();
  });
});

describe('心經經文', () => {
  it('玄奘譯本正文 260 字，首尾正確', () => {
    expect(HEART_SUTRA_CHARS).toHaveLength(260);
    expect(HEART_SUTRA_CHARS.slice(0, 5).join('')).toBe('觀自在菩薩');
    expect(HEART_SUTRA_CHARS.slice(-5).join('')).toBe('菩提莎婆訶');
  });
});

describe('抄經頁', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('抄錯會提示正確字；抄完全文才能回向，回向後記錄一部', async () => {
    const view = await render(<SutraCopyScreen />);
    const input = view.getByLabelText('抄經輸入');

    await fireEvent.changeText(input, '觀自再');
    expect(view.getByText('第 3 字應為「在」，可以刪掉重寫。')).toBeTruthy();
    expect(view.getByLabelText('抄完全部經文後才能回向')).toBeDisabled();

    await fireEvent.changeText(input, HEART_SUTRA_TEXT.replace(/[，。！；、：]/g, ''));
    expect(view.getByText('已抄 260 / 260 字')).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByLabelText('圓滿回向'));
    });
    expect(view.getByText('功德圓滿')).toBeTruthy();
    const state = await getDailyPractice();
    expect(state.sutraCopies).toHaveLength(1);
    expect(state.checkIns).toEqual([localDateKey()]);
    // Rendering all 260 characters runs past 5 s on loaded CI runners.
  }, 15000);
});
