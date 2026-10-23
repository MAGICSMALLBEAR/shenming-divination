import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import JiaobeiAskScreen from '@/app/jiaobei-ask';
import { gods } from '@/data/gods';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock('@/services/proceduralSound', () => ({
  playShengbeiSound: jest.fn(() => Promise.resolve()),
  playTossSound: jest.fn(() => Promise.resolve()),
  vibrateLight: jest.fn(),
}));
jest.mock('@/services/storage', () => ({ getSettings: jest.fn(() => Promise.resolve(null)) }));
jest.mock('@/services/divination', () => ({ tossJiaobei: jest.fn(() => 'shengbei') }));

describe('擲筊問事', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('沒輸入問題不能開始；聖筊後顯示允可並可問下一件事', async () => {
    const view = await render(<JiaobeiAskScreen />);

    expect(view.getByLabelText('請先輸入想請示的事')).toBeDisabled();
    await fireEvent.changeText(view.getByLabelText('想請示的事'), '這週適合去面試嗎？');
    await fireEvent.press(view.getByLabelText('開始請示'));
    expect(view.getByText('這週適合去面試嗎？')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('擲筊請示'));
    // 擲筊動畫結束後，元件再延遲 0.9 秒才通知聖筊
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(view.getByText(`聖杯：${gods[0].name}允可這件事。`)).toBeTruthy();

    await fireEvent.press(view.getByText('問下一件事'));
    expect(view.getByLabelText('想請示的事').props.value).toBe('');
  });
});
