// 本地儲存服務 - 使用 AsyncStorage 儲存收藏、歷史、設定
import { Poem } from '@/data/poems/leiyushi';
import { DRAW_ANIMATION_DEFAULT_MS, normalizeDrawAnimationDuration } from '@/constants/divination';

const STORAGE_KEYS = {
  FAVORITES: '@divination_favorites',
  HISTORY: '@divination_history',
  SETTINGS: '@divination_settings',
  LAST_POEM: '@divination_last_poem',
} as const;

export interface DivinationRecord {
  id: string;
  godName: string;
  poem: Poem;
  question: string;
  questionCategory: string;
  aiInterpretation?: string;
  notes?: string;
  timestamp: number;
}

// 簡易 AsyncStorage 替代 (React Native AsyncStorage 的輕量封裝)
// 在實際 React Native 環境中，使用 @react-native-async-storage/async-storage
// 這裡提供介面一致的實作

let memoryStore: Record<string, string> = {};

export async function getItem(key: string): Promise<string | null> {
  try {
    // 嘗試使用 React Native AsyncStorage
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

// 收藏功能
export async function getFavorites(): Promise<DivinationRecord[]> {
  const data = await getItem(STORAGE_KEYS.FAVORITES);
  return data ? JSON.parse(data) : [];
}

export async function addFavorite(record: DivinationRecord): Promise<void> {
  const favorites = await getFavorites();
  favorites.unshift(record);
  await setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  await setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites.filter(f => f.id !== id)));
}

export async function isFavorite(poemNumber: number): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some(f => f.poem.number === poemNumber);
}

// 歷史紀錄
export async function getHistory(): Promise<DivinationRecord[]> {
  const data = await getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function addHistory(record: DivinationRecord): Promise<void> {
  const history = await getHistory();
  history.unshift(record);
  // 只保留最近50筆
  const trimmed = history.slice(0, 50);
  await setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
}

export async function updateNote(id: string, notes: string): Promise<void> {
  const history = await getHistory();
  const idx = history.findIndex(h => h.id === id);
  if (idx !== -1) {
    history[idx].notes = notes;
    await setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }
  // 也更新收藏中的同一筆
  const favorites = await getFavorites();
  const favIdx = favorites.findIndex(f => f.id === id);
  if (favIdx !== -1) {
    favorites[favIdx].notes = notes;
    await setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
}

export async function clearHistory(): Promise<void> {
  await removeItem(STORAGE_KEYS.HISTORY);
}

// 設定
export interface AppSettings {
  userName: string;
  birthDate: string;
  preferredGodId: number;
  strictMode?: boolean;
  dailyNotification?: boolean;
  birthdayNotification?: boolean;
  drawAnimationDurationMs?: number;
}

function normalizeSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    drawAnimationDurationMs: normalizeDrawAnimationDuration(settings.drawAnimationDurationMs ?? DRAW_ANIMATION_DEFAULT_MS),
  };
}

export async function getSettings(): Promise<AppSettings | null> {
  const data = await getItem(STORAGE_KEYS.SETTINGS);
  return data ? normalizeSettings(JSON.parse(data)) : null;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(normalizeSettings(settings)));
}

// 最後一支籤詩（供神明對話頁面取得上下文）
export interface LastPoemContext {
  godName: string;
  poemContent: string;
  poemTitle: string;
  poemLevel: string;
  aiInterpretation?: string;
  question?: string;
  timestamp: number;
}

export async function saveLastPoemContext(ctx: LastPoemContext): Promise<void> {
  await setItem(STORAGE_KEYS.LAST_POEM, JSON.stringify(ctx));
}

export async function getLastPoemContext(): Promise<LastPoemContext | null> {
  const data = await getItem(STORAGE_KEYS.LAST_POEM);
  return data ? JSON.parse(data) : null;
}
