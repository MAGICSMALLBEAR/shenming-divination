import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { IncenseRitual } from '@/components/IncenseRitual';
import { Jiaobei } from '@/components/Jiaobei';
import { MeditationScreen } from '@/components/MeditationScreen';
import { RitualStylePicker } from '@/components/RitualStylePicker';

jest.mock('@/services/proceduralSound', () => ({
  playIncenseSound: jest.fn(() => Promise.resolve()),
  playShengbeiSound: jest.fn(() => Promise.resolve()),
  playTossSound: jest.fn(() => Promise.resolve()),
  vibrateLight: jest.fn(),
}));

describe('ritual interactions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('unlocks meditation after exactly five seconds', async () => {
    const onComplete = jest.fn();
    const view = await render(<MeditationScreen godName="Test God" onComplete={onComplete} />);

    expect(view.getByText('\u8acb\u975c\u5fc3\u7b49\u5f85...')).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(4999);
    });
    expect(view.queryByText('\u9078\u64c7\u62bd\u7c64\u65b9\u5f0f')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    await fireEvent.press(view.getByText('\u9078\u64c7\u62bd\u7c64\u65b9\u5f0f'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('moves from lighting incense to the offering action', async () => {
    const view = await render(
      <IncenseRitual
        godName="Test God"
        onComplete={jest.fn()}
        ritualStyleKey="bronze"
        onStyleChange={jest.fn()}
      />
    );

    await fireEvent.press(view.getByText('\u9ede\u71c3\u9999\u706b'));
    expect(view.getByText('\u9999\u706b\u9ede\u71c3\u4e2d\u2026')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(view.getByText('\u5c07\u9999\u5949\u5165\u9999\u7210')).toBeTruthy();
  });

  it('starts a jiaobei toss from the primary action', async () => {
    const onToss = jest.fn(() => 'xiaobei' as const);
    const view = await render(
      <Jiaobei
        onToss={onToss}
        onShengbei={jest.fn()}
        results={[]}
        lowMotion
        ritualStyleKey="bronze"
        onStyleChange={jest.fn()}
      />
    );

    await fireEvent.press(view.getByLabelText('\u64f2\u7b4a\u8acb\u793a'));
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(onToss).toHaveBeenCalledTimes(1);
  });

  it('changes between all ritual material choices', async () => {
    const onChange = jest.fn();
    const view = await render(<RitualStylePicker value="bronze" onChange={onChange} />);

    await fireEvent.press(
      view.getByLabelText(
        '\u9078\u64c7\u767d\u7389\u84ee\u83ef\u5100\u5f0f\u8cea\u611f',
        { includeHiddenElements: true }
      )
    );
    expect(onChange).toHaveBeenCalledWith('jade');
  });
});