import { getSelectableOracleEditions, resolveOracleEdition } from './oracleEditionRegistry';
import { getYuelaoEdition, subscribeYuelaoEdition } from './yuelaoEdition';

const selections = new Map<number, string>();
const listeners = new Set<() => void>();

export function getSelectedOracleEditionId(godId: number): string | null {
  const stored = selections.get(godId);
  if (stored && getSelectableOracleEditions(godId).some((edition) => edition.id === stored)) return stored;
  if (godId === 13) return getYuelaoEdition() === 'hongkong' ? 'yuelao-hongkong-101' : 'yuelao-taiwan-100';
  return resolveOracleEdition(godId)?.id ?? null;
}

export function subscribeOracleEditionSelection(godId: number, listener: () => void): () => void {
  listeners.add(listener);
  const unsubscribeLegacy = godId === 13 ? subscribeYuelaoEdition(listener) : null;
  return () => {
    listeners.delete(listener);
    unsubscribeLegacy?.();
  };
}

export function setOracleEditionSelection(godId: number, editionId: string): boolean {
  if (!getSelectableOracleEditions(godId).some((edition) => edition.id === editionId)) return false;
  selections.set(godId, editionId);
  listeners.forEach((listener) => listener());
  return true;
}

export function getPersistedOracleEditionSelections(): Record<string, string> {
  return Object.fromEntries(selections);
}
