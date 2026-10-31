import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AIInterpretRequest } from './oracleAIContext';

// v2 intentionally never reads keys from the old number/category-only cache.
const CACHE_PREFIX = '@ai_cache:v2:';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ENTRIES = 50;
const INDEX_KEY = '@ai_cache_index';

interface CacheEntry {
  value: string;
  expiresAt: number;
  context: string;
}

function serializeContext(params: AIInterpretRequest): string {
  // Fixed order makes equivalent requests independent of object property order.
  return JSON.stringify([
    params.godName, params.poemNumber, params.editionId ?? '', params.editionLabel ?? '',
    params.editionVersionTag ?? '', params.editionTemple ?? '', params.editionSource ?? '',
    params.editionSourceUrl ?? '', params.drawMethod ?? '', params.poemContent,
    params.poemMeaning, params.poemStory, params.poemLevel, params.userName,
    params.question, params.questionCategory, params.recentHistorySummary ?? '',
  ]);
}

function buildKey(context: string): string {
  // Compact lookup only; the full context is also checked so hash collisions cannot reuse a reading.
  let hash = 2166136261;
  for (let i = 0; i < context.length; i++) {
    hash = Math.imul(hash ^ context.charCodeAt(i), 16777619);
  }
  return `${CACHE_PREFIX}${(hash >>> 0).toString(16)}`;
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
        if (key.startsWith(CACHE_PREFIX) && entry.expiresAt > now) {
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
  params: AIInterpretRequest
): Promise<string | null> {
  const context = serializeContext(params);
  const key = buildKey(context);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return entry.context === context && typeof entry.value === 'string' ? entry.value : null;
  } catch {
    return null;
  }
}

export async function setCachedInterpretation(
  params: AIInterpretRequest,
  value: string
): Promise<void> {
  const context = serializeContext(params);
  const key = buildKey(context);
  const entry: CacheEntry = {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
    context,
  };
  try {
    let index = (await getIndex()).filter((existing) => existing !== key);
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
