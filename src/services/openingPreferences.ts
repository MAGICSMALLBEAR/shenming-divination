import AsyncStorage from '@react-native-async-storage/async-storage';

import { OPENING_VARIANTS, type OpeningVariant } from '@/components/OpeningCeremony';

export type OpeningStyle = 'random' | OpeningVariant;
export type OpeningFrequency = 'every-launch' | 'daily-first' | 'first-use';

export interface OpeningPreferences {
  style: OpeningStyle;
  frequency: OpeningFrequency;
}

export const DEFAULT_OPENING_PREFERENCES: OpeningPreferences = {
  style: 'random',
  frequency: 'every-launch',
};

export const OPENING_FREQUENCIES: readonly OpeningFrequency[] = ['every-launch', 'daily-first', 'first-use'];

const PREFS_KEY = 'opening_preferences';
const LAST_SHOWN_KEY = 'opening_last_shown';

export function normalizeOpeningPreferences(value: unknown): OpeningPreferences {
  const raw = (value && typeof value === 'object' ? value : {}) as Partial<OpeningPreferences>;
  const style = raw.style === 'random' || OPENING_VARIANTS.includes(raw.style as OpeningVariant)
    ? raw.style as OpeningStyle
    : DEFAULT_OPENING_PREFERENCES.style;
  const frequency = OPENING_FREQUENCIES.includes(raw.frequency as OpeningFrequency)
    ? raw.frequency as OpeningFrequency
    : DEFAULT_OPENING_PREFERENCES.frequency;
  return { style, frequency };
}

export function toLocalDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** lastShownDateKey 為 null 代表從未播放過。 */
export function shouldPlayOpening(
  prefs: OpeningPreferences,
  lastShownDateKey: string | null,
  today = new Date(),
): boolean {
  if (prefs.frequency === 'every-launch') return true;
  if (prefs.frequency === 'first-use') return lastShownDateKey === null;
  return lastShownDateKey !== toLocalDateKey(today);
}

export function resolveOpeningVariant(prefs: OpeningPreferences): OpeningVariant | undefined {
  return prefs.style === 'random' ? undefined : prefs.style;
}

export async function loadOpeningPreferences(): Promise<OpeningPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return normalizeOpeningPreferences(raw ? JSON.parse(raw) : null);
  } catch {
    return DEFAULT_OPENING_PREFERENCES;
  }
}

export async function saveOpeningPreferences(prefs: OpeningPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(normalizeOpeningPreferences(prefs)));
}

export async function loadOpeningLastShown(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SHOWN_KEY);
  } catch {
    return null;
  }
}

export async function markOpeningShown(today = new Date()): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_KEY, toLocalDateKey(today));
  } catch {
    // 寫入失敗只會讓下次再播一次，不影響使用
  }
}
