import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OpeningGate } from '@/components/OpeningGate';
import {
  DEFAULT_OPENING_PREFERENCES,
  normalizeOpeningPreferences,
  resolveOpeningVariant,
  saveOpeningPreferences,
  shouldPlayOpening,
  toLocalDateKey,
} from '@/services/openingPreferences';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const today = new Date(2026, 9, 16, 9);

describe('opening preferences', () => {
  it('plays on every launch by default', () => {
    expect(shouldPlayOpening(DEFAULT_OPENING_PREFERENCES, '2026-10-16', today)).toBe(true);
  });

  it('plays only once per local day for daily-first', () => {
    const prefs = { style: 'random' as const, frequency: 'daily-first' as const };
    expect(shouldPlayOpening(prefs, null, today)).toBe(true);
    expect(shouldPlayOpening(prefs, '2026-10-15', today)).toBe(true);
    expect(shouldPlayOpening(prefs, toLocalDateKey(today), today)).toBe(false);
  });

  it('plays only before the first recorded launch for first-use', () => {
    const prefs = { style: 'lotus' as const, frequency: 'first-use' as const };
    expect(shouldPlayOpening(prefs, null, today)).toBe(true);
    expect(shouldPlayOpening(prefs, '2020-01-01', today)).toBe(false);
  });

  it('falls back to defaults for corrupted or outdated values', () => {
    expect(normalizeOpeningPreferences(null)).toEqual(DEFAULT_OPENING_PREFERENCES);
    expect(normalizeOpeningPreferences({ style: 'fireworks', frequency: 'weekly' })).toEqual(DEFAULT_OPENING_PREFERENCES);
    expect(normalizeOpeningPreferences({ style: 'seal', frequency: 'daily-first' })).toEqual({ style: 'seal', frequency: 'daily-first' });
  });

  it('uses a fixed variant only when one is chosen', () => {
    expect(resolveOpeningVariant({ style: 'random', frequency: 'every-launch' })).toBeUndefined();
    expect(resolveOpeningVariant({ style: 'incense', frequency: 'every-launch' })).toBe('incense');
  });
});

describe('opening gate', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the opening and records the launch date when it should play', async () => {
    const view = await render(<OpeningGate />);
    await waitFor(() => expect(view.getByText('略過')).toBeTruthy());
    await waitFor(async () => expect(await AsyncStorage.getItem('opening_last_shown')).not.toBeNull());
    // 檔案內第一次渲染 OpeningGate，CI 冷啟動常超過預設 5 秒
  }, 15000);

  it('skips the opening when first-use has already been shown', async () => {
    await saveOpeningPreferences({ style: 'random', frequency: 'first-use' });
    await AsyncStorage.setItem('opening_last_shown', '2026-01-01');
    const view = await render(<OpeningGate />);
    await waitFor(() => expect(view.toJSON()).toBeNull());
  });
});
