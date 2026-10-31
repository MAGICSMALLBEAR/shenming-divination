jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAIInterpretation } from '@/services/ai';
import { clearInterpretationCache, getCachedInterpretation, getCacheStats, setCachedInterpretation } from '@/services/offlineCache';
import type { AIInterpretRequest } from '@/services/oracleAIContext';

const request: AIInterpretRequest = {
  godName: '月下老人', userName: '善信', question: '感情方向', questionCategory: 'love',
  poemNumber: 1, poemContent: '同一段籤文', poemMeaning: '白話解說', poemStory: '典故', poemLevel: '中平',
  editionId: 'yuelao-taiwan-100', editionLabel: '月老靈籤・台灣版 100 首',
  editionVersionTag: 'taiwan-v1', editionTemple: '新竹普天宮版本',
  editionSource: '來源說明', editionSourceUrl: 'https://example.org/taiwan', drawMethod: 'stick-confirmation',
};
const realFetch = global.fetch;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ interpretation: '【一句結論】\n測試解籤' }) })) as unknown as typeof fetch;
});

afterEach(() => { global.fetch = realFetch; jest.restoreAllMocks(); });

it('sends edition metadata to AI and reuses only an identical request', async () => {
  const first = await getAIInterpretation(request);
  // Property insertion order must not affect cache identity.
  const second = await getAIInterpretation(Object.fromEntries(Object.entries(request).reverse()) as unknown as AIInterpretRequest);
  expect(second).toBe(first);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
  expect(body).toMatchObject(request);
});

it.each([
  ['edition', { editionId: 'yuelao-hongkong-101', editionLabel: '月老靈簽・香港版 101 首' }],
  ['revision', { editionVersionTag: 'taiwan-v2' }],
  ['question', { question: '是否該主動聯絡？' }],
  ['user', { userName: '另一位善信' }],
  ['text', { poemContent: '修訂後的原文' }],
  ['commentary', { poemMeaning: '修訂後的解說' }],
  ['history', { recentHistorySummary: '月老第1籤／香港版' }],
  ['source', { editionSource: '來源修訂' }],
  ['ritual', { drawMethod: 'direct' }],
])('does not reuse a reading after changing %s', async (_field, changes) => {
  await getAIInterpretation(request);
  await getAIInterpretation({ ...request, ...changes });
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

it('isolates requests without an edition by their full poem text', async () => {
  const unknown = { ...request, editionId: undefined, editionLabel: undefined, editionVersionTag: undefined };
  await setCachedInterpretation(unknown, '第一首解讀');
  expect(await getCachedInterpretation({ ...unknown, poemContent: '另一首同號籤' })).toBeNull();
});

it('ignores and prunes pre-edition cache entries instead of migrating their readings', async () => {
  const oldKey = '@ai_cache:月下老人:1:love';
  await AsyncStorage.setItem(oldKey, JSON.stringify({ value: '錯版舊解讀', expiresAt: Date.now() + 100000 }));
  await AsyncStorage.setItem('@ai_cache_index', JSON.stringify([oldKey]));
  expect(await getCachedInterpretation(request)).toBeNull();
  expect(await getAIInterpretation(request)).not.toContain('錯版舊解讀');
  expect(await AsyncStorage.getItem(oldKey)).toBeNull();
  expect((await getCacheStats()).count).toBe(1);
});

it('checks the full context even if a compact cache key collides', async () => {
  await setCachedInterpretation(request, '正確解讀');
  const [key] = JSON.parse((await AsyncStorage.getItem('@ai_cache_index'))!);
  const entry = JSON.parse((await AsyncStorage.getItem(key))!);
  await AsyncStorage.setItem(key, JSON.stringify({ ...entry, context: '另一份請求', value: '錯版解讀' }));
  expect(await getCachedInterpretation(request)).toBeNull();
});

it('expires readings after seven days and clears the versioned cache', async () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(1000);
  await setCachedInterpretation(request, '過期前');
  expect(await getCachedInterpretation(request)).toBe('過期前');
  clock.mockReturnValue(1000 + 7 * 86400000 + 1);
  expect(await getCachedInterpretation(request)).toBeNull();
  await setCachedInterpretation(request, '新解讀');
  await clearInterpretationCache();
  expect(await getCachedInterpretation(request)).toBeNull();
  expect((await getCacheStats()).count).toBe(0);
});

it('does not cache a local backend fallback as a successful AI reading', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ interpretation: '【一句結論】\n本機解讀', provider: 'fallback' }) });
  await getAIInterpretation(request);
  expect(await getCachedInterpretation(request)).toBeNull();
});
