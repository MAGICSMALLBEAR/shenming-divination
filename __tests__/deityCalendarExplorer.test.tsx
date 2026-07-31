import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { DeityCalendarExplorer } from '@/components/home/DeityCalendarExplorer';

describe('DeityCalendarExplorer', () => {
  it('supports year navigation, search and year export', async () => {
    const onExportYear = jest.fn();
    const view = await render(
      <DeityCalendarExplorer
        initialDate={new Date(2026, 4, 1, 12)}
        onConsult={jest.fn()}
        onOpenDetails={jest.fn()}
        onExportYear={onExportYear}
      />,
    );

    expect(view.getByText('2026 年 5 月')).toBeTruthy();
    await fireEvent.press(view.getByLabelText('查看下一年神明月曆'));
    expect(view.getByText('2027 年 5 月')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('匯出 2027 年神明日曆'));
    expect(onExportYear).toHaveBeenCalledWith(2027);

    await fireEvent.changeText(view.getByPlaceholderText('搜尋神明或紀念日'), '不存在');
    expect(view.getByText('目前條件沒有符合的紀念日。')).toBeTruthy();
  });

  it('selects an event date and keeps the details action available', async () => {
    const onOpenDetails = jest.fn();
    const view = await render(
      <DeityCalendarExplorer
        initialDate={new Date(2026, 4, 1, 12)}
        onConsult={jest.fn()}
        onOpenDetails={onOpenDetails}
        onExportYear={jest.fn()}
      />,
    );

    await fireEvent.press(view.getByLabelText('5月9日，1筆紀念日'));
    expect(view.getByText('天上聖母聖誕')).toBeTruthy();
    expect(view.getByText('顯示整月紀念日')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('查看天上聖母聖誕詳情'));
    expect(onOpenDetails).toHaveBeenCalledWith('mazu-birthday');
  });

  it('shows followed deities, upcoming dates and toggles following', async () => {
    const onToggleFollow = jest.fn();
    const view = await render(
      <DeityCalendarExplorer
        initialDate={new Date(2026, 4, 1, 12)}
        followedGodIds={[3]}
        onToggleFollow={onToggleFollow}
        onConsult={jest.fn()}
        onOpenDetails={jest.fn()}
        onExportYear={jest.fn()}
      />,
    );

    expect(view.getByText('已關注 1 位神明')).toBeTruthy();
    expect(view.getAllByText('天上聖母聖誕').length).toBeGreaterThan(0);

    await fireEvent.press(view.getByLabelText('取消關注媽祖'));
    expect(onToggleFollow).toHaveBeenCalledWith(3);

    await fireEvent.press(view.getByText('只看已關注'));
    expect(view.getByText('顯示全部')).toBeTruthy();
  });
});
