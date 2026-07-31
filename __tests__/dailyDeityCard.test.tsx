import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { DailyDeityCard } from '@/components/home/DailyDeityCard';
import { getDailyDeityOracle } from '@/services/dailyDeityOracle';

describe('DailyDeityCard', () => {
  it('shows the daily deity, poem and reflection disclaimer', async () => {
    const oracle = getDailyDeityOracle(new Date(2026, 4, 11, 12));
    const view = await render(<DailyDeityCard oracle={oracle} onConsult={jest.fn()} />);

    expect(view.getAllByText(oracle.god.name).length).toBeGreaterThan(0);
    expect(view.getByText(oracle.poem.title)).toBeTruthy();
    expect(view.getByText(`今日行動：${oracle.dailyAction}`)).toBeTruthy();

    await fireEvent.press(view.getByLabelText('展開神明日課解說'));
    expect(view.getByText(/不等同正式求籤/)).toBeTruthy();
  });

  it('starts the formal consultation from the primary action', async () => {
    const oracle = getDailyDeityOracle(new Date(2026, 6, 26, 12));
    const onConsult = jest.fn();
    const view = await render(<DailyDeityCard oracle={oracle} onConsult={onConsult} />);

    await fireEvent.press(view.getByLabelText(`向${oracle.god.name}正式求籤`));
    expect(onConsult).toHaveBeenCalledTimes(1);
  });
});
