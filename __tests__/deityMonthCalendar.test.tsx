import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { DeityMonthCalendar } from '@/components/home/DeityMonthCalendar';

describe('DeityMonthCalendar', () => {
  it('shows accurate monthly observances and opens the selected deity', async () => {
    const onConsult = jest.fn();
    const view = await render(
      <DeityMonthCalendar initialDate={new Date(2026, 4, 1, 12)} onConsult={onConsult} />,
    );

    expect(view.getByText('2026 年 5 月')).toBeTruthy();
    expect(view.getByText('天上聖母聖誕')).toBeTruthy();
    expect(view.getByText('5月9日')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('向媽祖求籤'));
    expect(onConsult).toHaveBeenCalledWith(3);
  });

  it('moves between solar months', async () => {
    const view = await render(
      <DeityMonthCalendar initialDate={new Date(2026, 4, 1, 12)} onConsult={jest.fn()} />,
    );

    await fireEvent.press(view.getByLabelText('查看下個月神明月曆'));
    expect(view.getByText('2026 年 6 月')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('查看上個月神明月曆'));
    expect(view.getByText('2026 年 5 月')).toBeTruthy();
  });

  it('opens the observance details when requested', async () => {
    const onOpenDetails = jest.fn();
    const view = await render(
      <DeityMonthCalendar
        initialDate={new Date(2026, 4, 1, 12)}
        onConsult={jest.fn()}
        onOpenDetails={onOpenDetails}
      />,
    );

    await fireEvent.press(view.getByLabelText('查看天上聖母聖誕詳情'));
    expect(onOpenDetails).toHaveBeenCalledWith('mazu-birthday');
  });
});
