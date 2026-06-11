import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@ai_cache:';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ENTRIES = 50;
const INDEX_KEY = '@ai_cache_index';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

function buildKey(godName: string, poemNumber: number, questionCategory: string): string {
  return `${CACHE_PREFIX}${godName}:${poemNumber}:${questionCategory}`;
}

async function getIndex(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setIndex(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

async function evictOldest(index: string[]): Promise<string[]> {
  // Remove expired entries first
  const now = Date.now();
  const alive: string[] = [];
  for (const key of index) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        if (entry.expiresAt > now) {
          alive.push(key);
        } else {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch {
      // skip corrupted
    }
  }
  // If still over limit, remove the oldest (front of array = oldest)
  while (alive.length >= MAX_ENTRIES) {
    const oldest = alive.shift();
    if (oldest) await AsyncStorage.removeItem(oldest);
  }
  return alive;
}

export async function getCachedInterpretation(
  godName: string,
  poemNumber: number,
  questionCategory: string
): Promise<string | null> {
  const key = buildKey(godName, poemNumber, questionCategory);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export async function setCachedInterpretation(
  godName: string,
  poemNumber: number,
  questionCategory: string,
  value: string
): Promise<void> {
  const key = buildKey(godName, poemNumber, questionCategory);
  const entry: CacheEntry = {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  try {
    let index = await getIndex();
    index = await evictOldest(index);
    if (!index.includes(key)) index.push(key);
    await AsyncStorage.setItem(key, JSON.stringify(entry));
    await setIndex(index);
  } catch {
    // ignore write failures
  }
}

export async function clearInterpretationCache(): Promise<void> {
  try {
    const index = await getIndex();
    await Promise.all(index.map((k) => AsyncStorage.removeItem(k)));
    await AsyncStorage.removeItem(INDEX_KEY);
  } catch {
    // ignore
  }
}

export async function getCacheStats(): Promise<{ count: number; oldestDays: number }> {
  try {
    const index = await getIndex();
    if (index.length === 0) return { count: 0, oldestDays: 0 };
    const now = Date.now();
    let minExpiry = Infinity;
    for (const key of index) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        if (entry.expiresAt < minExpiry) minExpiry = entry.expiresAt;
      }
    }
    const oldestDays = minExpiry === Infinity ? 0 : Math.round((minExpiry - now + CACHE_TTL_MS) / 86400000);
    return { count: index.length, oldestDays };
  } catch {
    return { count: 0, oldestDays: 0 };
  }
}
