import type { Lang } from '@/services/i18n';
import type { Poem } from '@/data/poems/leiyushi';
import {
  DRAW_ANIMATION_DEFAULT_MS,
  normalizeDrawAnimationDuration,
} from '@/constants/divination';
import {
  normalizeDrawAnimationMode,
  normalizeDrawAnimationStyleKey,
  normalizeShakeMode,
  type DrawAnimationMode,
  type DrawAnimationStyleKey,
  type ShakeMode,
} from '@/constants/draw-animation-styles';

export const STORAGE_KEYS = {
  FAVORITES: '@divination_favorites',
  HISTORY: '@divination_history',
  SETTINGS: '@divination_settings',
  LAST_POEM: '@divination_last_poem',
  FAMILY_MEMBERS: '@divination_family_members',
} as const;

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;  // 例：媽媽、爸爸、兄弟
  birthDate?: string;
}

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
  verificationDueAt?: number;
  verificationFinalDueAt?: number;
  actionPlan?: string[];
  actionProgress?: boolean[];
  poemConfirmed?: boolean;
  poemConfirmResult?: string;
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
  shakeMode?: ShakeMode;
  lowMotionMode?: boolean;
  theme?: 'dark' | 'light' | 'system';  // P4: 主題模式
  familyMembers?: FamilyMember[];
  ambientSound?: boolean;
  aiServerUrl?: string;
  aiApiKey?: string;
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

export interface VerificationFollowUpSummary {
  due: DivinationRecord[];
  upcoming: DivinationRecord[];
  pending: DivinationRecord[];
  matchedCount: number;
  reviewedCount: number;
  totalCount: number;
}

let memoryStore: Record<string, string> = {};

function normalizeRecord(record: DivinationRecord): DivinationRecord {
  const timestamp = record.timestamp ?? Date.now();
  return {
    ...record,
    verificationStatus: record.verificationStatus ?? 'pending',
    verificationDueAt: record.verificationDueAt ?? timestamp + 7 * 24 * 60 * 60 * 1000,
    verificationFinalDueAt: record.verificationFinalDueAt ?? timestamp + 30 * 24 * 60 * 60 * 1000,
    actionPlan: Array.isArray(record.actionPlan) ? record.actionPlan : undefined,
    actionProgress: Array.isArray(record.actionProgress) ? record.actionProgress : [],
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
    shakeMode: normalizeShakeMode(settings.shakeMode),
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

export async function isFavorite(poemNumber: number, godName?: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((record) =>
    record.poem.number === poemNumber &&
    (!godName || record.godName === godName)
  );
}

export async function getHistory(): Promise<DivinationRecord[]> {
  const data = await getItem(STORAGE_KEYS.HISTORY);
  return data ? normalizeRecords(JSON.parse(data)) : [];
}

export async function getVerificationFollowUps(): Promise<VerificationFollowUpSummary> {
  const history = await getHistory();
  const now = Date.now();
  const pending = history.filter((record) => (record.verificationStatus ?? 'pending') === 'pending');
  const due = pending.filter(
    (record) =>
      (record.verificationDueAt ?? 0) <= now ||
      (record.verificationFinalDueAt ?? 0) <= now
  );
  const dueIds = new Set(due.map((record) => record.id));
  const upcoming = pending
    .filter((record) => !dueIds.has(record.id))
    .sort((left, right) => (left.verificationDueAt ?? 0) - (right.verificationDueAt ?? 0));
  const matchedCount = history.filter((record) => record.verificationStatus === 'matched').length;
  const reviewedCount = history.filter((record) => {
    const status = record.verificationStatus ?? 'pending';
    return status !== 'pending';
  }).length;

  return {
    due,
    upcoming,
    pending,
    matchedCount,
    reviewedCount,
    totalCount: history.length,
  };
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


export async function updateActionProgress(
  id: string,
  actionIndex: number,
  done: boolean
): Promise<void> {
  const history = await getHistory();
  const target = history.find((record) => record.id === id);
  const current = target?.actionProgress ?? [];
  const next = [...current];
  next[actionIndex] = done;
  await updateDivinationRecord(id, { actionProgress: next });
}

export async function updatePoemConfirmation(
  id: string,
  confirmed: boolean,
  result: string
): Promise<void> {
  await updateDivinationRecord(id, {
    poemConfirmed: confirmed,
    poemConfirmResult: result,
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

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const data = await getItem(STORAGE_KEYS.FAMILY_MEMBERS);
  return data ? JSON.parse(data) : [];
}

export async function saveFamilyMembers(members: FamilyMember[]): Promise<void> {
  await setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
}

export async function addFamilyMember(member: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
  const members = await getFamilyMembers();
  const newMember: FamilyMember = { ...member, id: `fam_${Date.now()}` };
  await saveFamilyMembers([...members, newMember]);
  return newMember;
}

export async function removeFamilyMember(id: string): Promise<void> {
  const members = await getFamilyMembers();
  await saveFamilyMembers(members.filter(m => m.id !== id));
}

