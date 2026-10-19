import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getYuelaoEdition,
  isYuelaoEdition,
  setYuelaoEdition,
  subscribeYuelaoEdition,
  type YuelaoEdition,
} from '@/data/yuelaoEdition';

const EDITION_KEY = 'yuelao_edition';

let initialized = false;

export async function initYuelaoEditionFromStorage(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const stored = await AsyncStorage.getItem(EDITION_KEY);
    if (isYuelaoEdition(stored)) setYuelaoEdition(stored);
  } catch {
    // 讀取失敗時維持預設的台灣版
  }
}

export async function saveYuelaoEdition(edition: YuelaoEdition): Promise<void> {
  setYuelaoEdition(edition);
  try {
    await AsyncStorage.setItem(EDITION_KEY, edition);
  } catch {
    // 寫入失敗只影響下次啟動的預設值
  }
}

export function useYuelaoEdition(): YuelaoEdition {
  return useSyncExternalStore(subscribeYuelaoEdition, getYuelaoEdition, getYuelaoEdition);
}
