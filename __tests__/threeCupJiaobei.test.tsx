import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

jest.mock('@/services/proceduralSound', () => ({
  playShengbeiSound: jest.fn(() => Promise.resolve()),
  playTossSound: jest.fn(() => Promise.resolve()),
  vibrateLight: jest.fn(),
}));

import { Jiaobei } from '@/components/Jiaobei';
import type { JiaobeiResult } from '@/services/divination';

function ThreeCupHarness({ onComplete }: { onComplete: () => void }) {
  const [results, setResults] = React.useState<JiaobeiResult[]>([]);
  const sequence = React.useRef<JiaobeiResult[]>(['shengbei', 'xiaobei', 'yinbei']);
  return (
    <Jiaobei
      phase="three-cup-direct"
      results={results}
      onToss={() => {
        const result = sequence.current[results.length];
        setResults((previous) => [...previous, result]);
        return result;
      }}
      onSequenceComplete={onComplete}
      ritualStyleKey="bronze"
      onStyleChange={() => {}}
      lowMotion
    />
  );
}

describe('三筊定籤畫面', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('records all three cup types and completes only after the third toss', async () => {
    const onComplete = jest.fn();
    const view = await render(<ThreeCupHarness onComplete={onComplete} />);

    await fireEvent.press(view.getByLabelText('擲筊定籤'));
    await act(async () => { jest.advanceTimersByTime(3000); });
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(view.getByText('繼續擲筊 2/3')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    await fireEvent.press(view.getByLabelText('繼續擲筊'));
    await act(async () => { jest.advanceTimersByTime(3000); });
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(view.getAllByText('陽杯').length).toBeGreaterThan(0);
    expect(view.getByText('繼續擲筊 3/3')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    await fireEvent.press(view.getByLabelText('繼續擲筊'));
    await act(async () => { jest.advanceTimersByTime(3000); });
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
