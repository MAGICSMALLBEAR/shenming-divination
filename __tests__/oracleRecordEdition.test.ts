jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { gods } from '@/data/gods';
import { getOracleIntakeProgress } from '@/data/oracleIntakeProgress';
import { getRecordEditionDisplay } from '@/data/oracleRecordEdition';
import { yuelaoHongKongPoems, yuelaoTaiwanPoems } from '@/data/poems/yuelao';
import {
  addFavorite,
  clearHistory,
  findFavoriteRecord,
  getFavorites,
  getHistory,
  isFavorite,
  removeFavorite,
  setFavorites,
  type DivinationRecord,
} from '@/services/storage';
import { saveDivinationRecord } from '@/services/divination';

const godName = gods.find((god) => god.id === 13)!.name;

function record(id: string, editionId: string | undefined, poem: DivinationRecord['poem']): DivinationRecord {
  return {
    id, godName, poem, editionId, question: '', questionCategory: 'general', timestamp: 1,
  };
}

describe('籤詩版次與收藏', () => {
  beforeEach(async () => {
    await setFavorites([]);
    await clearHistory();
  });

  it('persists the edition identity and ritual pattern in history', async () => {
    const saved = await saveDivinationRecord({
      godName,
      poem: yuelaoTaiwanPoems[0],
      question: '感情方向',
      questionCategory: 'marriage',
      editionId: 'yuelao-taiwan-100',
      editionLabel: '月老靈籤・台灣版 100 首',
      editionVersionTag: 'yuelao-taiwan-100',
      ritualPattern: ['shengbei', 'xiaobei', 'yinbei'],
    });
    const [stored] = await getHistory();
    expect(stored.id).toBe(saved.id);
    expect(stored).toMatchObject({
      editionId: 'yuelao-taiwan-100',
      editionLabel: '月老靈籤・台灣版 100 首',
      editionVersionTag: 'yuelao-taiwan-100',
      ritualPattern: ['shengbei', 'xiaobei', 'yinbei'],
    });
    expect(getRecordEditionDisplay(stored)).toMatchObject({ id: 'yuelao-taiwan-100', inferred: false });
  });

  it('keeps the same poem number from two Moon God editions separate', async () => {
    const taiwan = record('tw', 'yuelao-taiwan-100', yuelaoTaiwanPoems[0]);
    const hongkong = record('hk', 'yuelao-hongkong-101', yuelaoHongKongPoems[0]);
    await addFavorite(taiwan);
    expect(await isFavorite(1, godName, hongkong.editionId, hongkong.poem.content)).toBe(false);
    await addFavorite(hongkong);
    expect(await getFavorites()).toHaveLength(2);
    expect((await findFavoriteRecord(1, godName, taiwan.editionId, taiwan.poem.content))?.id).toBe('tw');
    expect((await findFavoriteRecord(1, godName, hongkong.editionId, hongkong.poem.content))?.id).toBe('hk');
    await removeFavorite('tw');
    expect(await isFavorite(1, godName, hongkong.editionId, hongkong.poem.content)).toBe(true);
  });

  it('does not guess an ambiguous old edition, and replaces favorites from one known edition', async () => {
    const older = record('old', undefined, yuelaoTaiwanPoems[0]);
    await addFavorite(older);
    expect(getRecordEditionDisplay(older)).toMatchObject({ id: null, label: '舊紀錄・版本未註明' });
    expect(await isFavorite(1, godName, 'yuelao-taiwan-100', older.poem.content)).toBe(false);
    await addFavorite(record('new', 'yuelao-taiwan-100', yuelaoTaiwanPoems[0]));
    await addFavorite(record('newer', 'yuelao-taiwan-100', yuelaoTaiwanPoems[0]));
    expect((await getFavorites()).map((item) => item.id)).toEqual(['newer', 'old']);
    const uniqueOld = record('unique-old', undefined, yuelaoHongKongPoems[100]);
    expect(getRecordEditionDisplay(uniqueOld)).toMatchObject({ id: 'yuelao-hongkong-101', inferred: true });
    const unknown = record('unknown', undefined, { ...yuelaoTaiwanPoems[0], content: '未收錄的舊籤文' });
    expect(getRecordEditionDisplay(unknown).label).toBe('舊紀錄・版本未註明');
  });
});

describe('籤本來源進度', () => {
  it('separates live editions, transcribed editions, one reviewing draft, and three awaiting a base text', () => {
    const progress = getOracleIntakeProgress();
    expect(progress.filter((item) => item.status === '可抽籤')).toHaveLength(7);
    expect(progress.filter((item) => item.status === '原文已校・待展示權')).toHaveLength(3);
    expect(progress.filter((item) => item.status === '校對中')).toHaveLength(1);
    expect(progress.filter((item) => item.status === '待取得底本')).toHaveLength(3);
    const indexed = progress.find((item) => item.editionId === 'tainan-tianhou-yuelao-27')!;
    expect(indexed).toMatchObject({ officialLinks: 27, checkedTextCount: 27, cleanTextCount: 27, rightsCleared: false });
    const corrupted = progress.find((item) => item.editionId === 'cifeng-mazu-100')!;
    expect(corrupted).toMatchObject({ checkedTextCount: 100, cleanTextCount: 99, status: '校對中' });
    const awaiting = progress.find((item) => item.editionId === 'guangze-ancient-provisional')!;
    expect(awaiting).toMatchObject({ officialLinks: 0, plannedSlots: null });
  });
});
