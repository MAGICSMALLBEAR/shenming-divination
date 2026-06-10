import type { Lang } from '@/services/i18n';
import type { Poem } from '@/data/poems/leiyushi';
import {
  DRAW_ANIMATION_DEFAULT_MS,
  normalizeDrawAnimationDuration,
} from '@/constants/divination';
import {
  normalizeDrawAnimationMode,
  normalizeDrawAnimationStyleKey,
  type DrawAnimationMode,
  type DrawAnimationStyleKey,
} from '@/constants/draw-animation-styles';

export const STORAGE_KEYS = {
  FAVORITES: '@divination_favorites',
  HISTORY: '@divination_history',
  SETTINGS: '@divination_settings',
  LAST_POEM: '@divination_last_poem',
} as const;

export type VerificationStatus = 'pending' | 'matched' | 'unmatched';

export interface DivinationRecord {
  id: string;
  godName: string;
  poem: Poem;
  question: string;
  questionCategory: string;
  aiInterpretation?: string;
  notes?: string;
  timestamp: number;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  verificationUpdatedAt?: number;
  actionPlan?: string[];
}

export interface AppSettings {
  userName: string;
  birthDate: string;
  preferredGodId: number;
  language?: Lang;
  strictMode?: boolean;
  dailyNotification?: boolean;
  birthdayNotification?: boolean;
  drawAnimationDurationMs?: number;
  drawAnimationMode?: DrawAnimationMode;
  drawAnimationStyleKey?: DrawAnimationStyleKey;
  theme?: 'dark' | 'light' | 'system';  // P4: 主題模式
}

export interface LastPoemContext {
  godName: string;
  poemContent: string;
  poemTitle: string;
  poemLevel: string;
  aiInterpretation?: string;
  question?: string;
  timestamp: number;
}

let memoryStore: Record<string, string> = {};

function normalizeRecord(record: DivinationRecord): DivinationRecord {
  return {
    ...record,
    verificationStatus: record.verificationStatus ?? 'pending',
    actionPlan: Array.isArray(record.actionPlan) ? record.actionPlan : undefined,
  };
}

function normalizeRecords(records: DivinationRecord[]): DivinationRecord[] {
  return records.map(normalizeRecord);
}

function normalizeSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    drawAnimationDurationMs: normalizeDrawAnimationDuration(
      settings.drawAnimationDurationMs ?? DRAW_ANIMATION_DEFAULT_MS
    ),
    drawAnimationMode: normalizeDrawAnimationMode(settings.drawAnimationMode),
    drawAnimationStyleKey: normalizeDrawAnimationStyleKey(settings.drawAnimationStyleKey),
  };
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStore[key] ?? null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStore[key] = value;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(key);
  } catch {
    delete memoryStore[key];
  }
}

export async function getFavorites(): Promise<DivinationRecord[]> {
  const data = await getItem(STORAGE_KEYS.FAVORITES);
  return data ? normalizeRecords(JSON.parse(data)) : [];
}

export async function setFavorites(records: DivinationRecord[]): Promise<void> {
  await setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(normalizeRecords(records)));
}

export async function addFavorite(record: DivinationRecord): Promise<void> {
  const favorites = await getFavorites();
  favorites.unshift(normalizeRecord(record));
  await setFavorites(favorites);
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  await setFavorites(favorites.filter((record) => record.id !== id));
}

export async function isFavorite(poemNumber: number): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((record) => record.poem.number === poemNumber);
}

export async function getHistory(): Promise<DivinationRecord[]> {
  const data = await getItem(STORAGE_KEYS.HISTORY);
  return data ? normalizeRecords(JSON.parse(data)) : [];
}

export async function setHistory(records: DivinationRecord[]): Promise<void> {
  await setItem(STORAGE_KEYS.HISTORY, JSON.stringify(normalizeRecords(records)));
}

export async function addHistory(record: DivinationRecord): Promise<void> {
  const history = await getHistory();
  history.unshift(normalizeRecord(record));
  await setHistory(history.slice(0, 50));
}

export async function updateDivinationRecord(
  id: string,
  updates: Partial<DivinationRecord>
): Promise<void> {
  const history = await getHistory();
  const favorites = await getFavorites();

  const patchRecord = (records: DivinationRecord[]) =>
    records.map((record) =>
      record.id === id ? normalizeRecord({ ...record, ...updates }) : record
    );

  await Promise.all([setHistory(patchRecord(history)), setFavorites(patchRecord(favorites))]);
}

export async function updateNote(id: string, notes: string): Promise<void> {
  await updateDivinationRecord(id, { notes });
}

export async function updateVerification(
  id: string,
  verificationStatus: VerificationStatus,
  verificationNotes: string
): Promise<void> {
  await updateDivinationRecord(id, {
    verificationStatus,
    verificationNotes: verificationNotes.trim() || undefined,
    verificationUpdatedAt: Date.now(),
  });
}

export async function clearHistory(): Promise<void> {
  await removeItem(STORAGE_KEYS.HISTORY);
}

export async function getSettings(): Promise<AppSettings | null> {
  const data = await getItem(STORAGE_KEYS.SETTINGS);
  return data ? normalizeSettings(JSON.parse(data)) : null;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(normalizeSettings(settings)));
}

export async function saveLastPoemContext(ctx: LastPoemContext): Promise<void> {
  await setItem(STORAGE_KEYS.LAST_POEM, JSON.stringify(ctx));
}

export async function getLastPoemContext(): Promise<LastPoemContext | null> {
  const data = await getItem(STORAGE_KEYS.LAST_POEM);
  return data ? JSON.parse(data) : null;
}
