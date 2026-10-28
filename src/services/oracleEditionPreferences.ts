import { useCallback, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getPersistedOracleEditionSelections,
  getSelectedOracleEditionId,
  setOracleEditionSelection,
  subscribeOracleEditionSelection,
} from '@/data/oracleEditionSelection';
import { saveYuelaoEdition } from './yuelaoEditionPreferences';

const STORAGE_KEY = 'oracle_edition_selections_v1';
let initialized = false;
export { getSelectedOracleEditionId } from '@/data/oracleEditionSelection';

export async function initOracleEditionSelections(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored: unknown = raw ? JSON.parse(raw) : null;
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return;
    for (const [key, value] of Object.entries(stored)) {
      const godId = Number(key);
      if (!Number.isInteger(godId) || typeof value !== 'string') continue;
      setOracleEditionSelection(godId, value);
    }
  } catch {
    // Invalid or unavailable storage leaves each god on its published default.
  }
}

export async function saveOracleEditionSelection(godId: number, editionId: string): Promise<boolean> {
  if (!setOracleEditionSelection(godId, editionId)) return false;
  if (godId === 13 && (editionId === 'yuelao-hongkong-101' || editionId === 'yuelao-taiwan-100')) {
    await saveYuelaoEdition(editionId === 'yuelao-hongkong-101' ? 'hongkong' : 'taiwan');
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedOracleEditionSelections()));
  } catch {
    // Selection remains active for this session if persistence fails.
  }
  return true;
}

export function useOracleEditionSelection(godId?: number): string | null {
  const subscribe = useCallback((listener: () => void) =>
    godId == null ? () => {} : subscribeOracleEditionSelection(godId, listener), [godId]);
  const getSnapshot = useCallback(() =>
    godId == null ? null : getSelectedOracleEditionId(godId), [godId]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
