// 月老靈籤版本（台灣版／香港版）的目前選擇。
// 純記憶體狀態，讓 getPoemsByGod 等同步函式可以直接讀取；持久化由 services/yuelaoEditionPreferences 負責。
import type { Poem } from './poems/leiyushi';

export type YuelaoEdition = 'taiwan' | 'hongkong';

export const YUELAO_GOD_ID = 13;
export const DEFAULT_YUELAO_EDITION: YuelaoEdition = 'taiwan';

export const YUELAO_EDITION_LABELS: Record<YuelaoEdition, string> = {
  taiwan: '台灣版・一百籤',
  hongkong: '香港版・一百零一簽',
};

export const YUELAO_EDITION_SHORT_LABELS: Record<YuelaoEdition, string> = {
  taiwan: '台灣版',
  hongkong: '香港版',
};

let currentEdition: YuelaoEdition = DEFAULT_YUELAO_EDITION;
const listeners = new Set<() => void>();

export function isYuelaoEdition(value: unknown): value is YuelaoEdition {
  return value === 'taiwan' || value === 'hongkong';
}

export function getYuelaoEdition(): YuelaoEdition {
  return currentEdition;
}

export function setYuelaoEdition(edition: YuelaoEdition): void {
  if (edition === currentEdition) return;
  currentEdition = edition;
  listeners.forEach((listener) => listener());
}

export function subscribeYuelaoEdition(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 台灣版 id 為 8601–8700，香港版為 8701–8801（見 poems/yuelao.ts）
export function getYuelaoEditionOfPoem(poem: Pick<Poem, 'id'> | null | undefined): YuelaoEdition | undefined {
  if (!poem) return undefined;
  if (poem.id >= 8601 && poem.id <= 8700) return 'taiwan';
  if (poem.id >= 8701 && poem.id <= 8801) return 'hongkong';
  return undefined;
}
