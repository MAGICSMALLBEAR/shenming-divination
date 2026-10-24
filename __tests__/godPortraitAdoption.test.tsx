import fs from 'fs';
import path from 'path';
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

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/proceduralSound', () => ({
  playIncenseSound: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/shareCard', () => ({
  captureAndShare: jest.fn(() => Promise.resolve()),
}));

import { IncenseRitual } from '@/components/IncenseRitual';
import { PoemCard } from '@/components/PoemCard';
import { UpgradedShareCard } from '@/components/UpgradedShareCard';
import { gods } from '@/data/gods';
import { leiyushiPoems } from '@/data/poems/leiyushi';

const guanGong = gods.find((god) => god.id === 1)!;
const poem = leiyushiPoems[0];

async function failImage(view: Awaited<ReturnType<typeof render>>, testID: string) {
  await act(async () => {
    view.getByTestId(testID).props.onError();
  });
  expect(view.getByTestId(`${testID}-fallback`)).toBeTruthy();
}

describe('GodPortrait adoption on high-traffic surfaces', () => {
  it('keeps the incense ritual shrine readable when the closeup fails', async () => {
    const view = await render(
      <IncenseRitual
        godId={guanGong.id}
        godName={guanGong.name}
        onComplete={jest.fn()}
        ritualStyleKey="bronze"
        onStyleChange={jest.fn()}
        reducedMotion
      />
    );

    await failImage(view, 'incense-god-portrait');
    expect(view.getByLabelText(`${guanGong.name}神像圖片暫時無法載入`)).toBeTruthy();
  });

  it('keeps the oracle result header readable when the closeup fails', async () => {
    const view = await render(
      <PoemCard poem={poem} godName={guanGong.name} god={guanGong} lowMotion />
    );

    await failImage(view, 'poem-god-portrait');
  });

  it.each(['classic', 'festival'] as const)('falls back on the %s share card', async (template) => {
    const view = await render(
      <UpgradedShareCard template={template} godId={guanGong.id} godName={guanGong.name} poem={poem} />
    );

    await failImage(view, `share-${template}-god-portrait`);
  });

  it('renders deity art through GodPortrait instead of a bare Image on home and temple screens', () => {
    const files = [
      'src/app/(tabs)/index.tsx',
      'src/app/(tabs)/temple.tsx',
      'src/components/IncenseRitual.tsx',
      'src/components/PoemCard.tsx',
      'src/components/UpgradedShareCard.tsx',
    ];
    const bareGodImage = /<Image\s[^>]*source=\{(getGod\w+Image|portraitImage|closeupImage|godImage|image)\b/;

    for (const file of files) {
      const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
      expect({ file, bare: bareGodImage.test(source) }).toEqual({ file, bare: false });
      expect({ file, usesPortrait: source.includes('<GodPortrait') }).toEqual({ file, usesPortrait: true });
    }
  });
});
