import React from 'react';
import { act, render } from '@testing-library/react-native';

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: ({ onError, ...props }: { onError?: () => void }) =>
      React.createElement(View, { ...props, onError }),
  };
});

import { GodPortrait, getGodPortraitInitial } from '@/components/GodPortrait';

describe('GodPortrait', () => {
  it('uses a concise deity-name fallback when there is no image source', async () => {
    const view = await render(
      <GodPortrait
        source={null}
        name="關聖帝君"
        accentColor="#F2D28A"
        primaryColor="#3B160B"
        style={{ width: 100, height: 120 }}
        testID="portrait"
      />
    );

    expect(view.getByTestId('portrait-fallback')).toBeTruthy();
    expect(view.getByText('關聖')).toBeTruthy();
    expect(view.getByLabelText('關聖帝君神像圖片暫時無法載入')).toBeTruthy();
  });

  it('switches to the fallback when expo-image reports a load error', async () => {
    const view = await render(
      <GodPortrait
        source={1}
        name="媽祖"
        accentColor="#F2D28A"
        primaryColor="#3B160B"
        style={{ width: 100, height: 120 }}
        testID="portrait"
      />
    );

    await act(async () => {
      view.getByTestId('portrait').props.onError();
    });

    expect(view.getByTestId('portrait-fallback')).toBeTruthy();
    expect(view.getByText('媽祖')).toBeTruthy();
  });

  it('normalizes whitespace and keeps a readable fallback for blank names', () => {
    expect(getGodPortraitInitial('  媽 祖  ')).toBe('媽祖');
    expect(getGodPortraitInitial('')).toBe('神明');
  });
});
