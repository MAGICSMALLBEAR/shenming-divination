import { getItem, setItem } from './storage';

export const TEMPLE_RECORDS_KEY = '@divination_temple_records';

export type TempleOfferingType = 'light' | 'flower' | 'prayer';

export interface TempleRecord {
  id: string;
  godId: number;
  godName: string;
  type: TempleOfferingType;
  title: string;
  content: string;
  createdAt: number;
  expiresAt?: number;
}

function normalizeRecord(record: TempleRecord): TempleRecord {
  return {
    ...record,
    createdAt: Number(record.createdAt) || Date.now(),
  };
}

export async function getTempleRecords(): Promise<TempleRecord[]> {
  const raw = await getItem(TEMPLE_RECORDS_KEY);
  if (!raw) return [];

  try {
    const records = JSON.parse(raw) as TempleRecord[];
    return Array.isArray(records)
      ? records.map(normalizeRecord).sort((left, right) => right.createdAt - left.createdAt)
      : [];
  } catch {
    return [];
  }
}

export async function setTempleRecords(records: TempleRecord[]): Promise<void> {
  await setItem(TEMPLE_RECORDS_KEY, JSON.stringify(records.map(normalizeRecord).slice(0, 200)));
}

export async function addTempleRecord(
  record: Omit<TempleRecord, 'id' | 'createdAt'>
): Promise<TempleRecord> {
  const nextRecord: TempleRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
  };

  const records = await getTempleRecords();
  await setTempleRecords([nextRecord, ...records]);
  return nextRecord;
}

export function getActiveTempleRecords(records: TempleRecord[]): TempleRecord[] {
  const now = Date.now();
  return records.filter((record) => !record.expiresAt || record.expiresAt > now);
}

export function getGodTempleStats(records: TempleRecord[], godId: number) {
  const active = getActiveTempleRecords(records).filter((record) => record.godId === godId);

  return {
    lights: active.filter((record) => record.type === 'light').length,
    flowers: active.filter((record) => record.type === 'flower').length,
    prayers: active.filter((record) => record.type === 'prayer').length,
  };
}
