import { COMMENTS_KEY } from './commentsService';
import { STORAGE_KEYS, getItem, setItem } from './storage';
import { WISHES_KEY } from './wishTracker';

const BACKUP_VERSION = 1;

const BACKUP_KEYS = [
  STORAGE_KEYS.FAVORITES,
  STORAGE_KEYS.HISTORY,
  STORAGE_KEYS.SETTINGS,
  STORAGE_KEYS.LAST_POEM,
  WISHES_KEY,
  COMMENTS_KEY,
] as const;

export interface BackupPayload {
  version: number;
  exportedAt: string;
  data: Record<string, string | null>;
}

export async function createBackupPayload(): Promise<BackupPayload> {
  const pairs = await Promise.all(
    BACKUP_KEYS.map(async (key) => [key, await getItem(key)] as const)
  );

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(pairs),
  };
}

export async function exportBackupJson(): Promise<string> {
  return JSON.stringify(await createBackupPayload(), null, 2);
}

export async function importBackupJson(raw: string): Promise<void> {
  const payload = JSON.parse(raw) as BackupPayload;

  if (!payload || typeof payload !== 'object' || !payload.data) {
    throw new Error('備份格式不正確');
  }

  for (const key of BACKUP_KEYS) {
    const value = payload.data[key];
    if (typeof value === 'string') {
      await setItem(key, value);
    }
  }
}
