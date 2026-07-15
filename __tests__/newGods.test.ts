import { gods, getPoemsByGod } from '@/data/gods';
import { getGodProfile } from '@/data/godProfiles';
import { getGodQuestionGuide } from '@/data/godQuestionGuides';
import { getGodBlessingSet } from '@/data/godBlessings';
import { getGodCardImage, getGodCloseupImage, getGodSoftImage } from '@/data/godImages';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';

describe('deity expansion batches', () => {
  const expected = [
    { id: 26, name: '玄壇元帥趙公明', count: 100, guideNeedle: '玄壇元帥' },
    { id: 27, name: '虎爺', count: 60, guideNeedle: '虎爺' },
    { id: 28, name: '九天玄女', count: 100, guideNeedle: '九天玄女' },
    { id: 29, name: '太歲星君', count: 60, guideNeedle: '太歲星君' },
    { id: 30, name: '臨水夫人', count: 100, guideNeedle: '臨水夫人' },
    { id: 31, name: '義民爺', count: 60, guideNeedle: '義民爺' },
    { id: 32, name: '孔子', count: 100, guideNeedle: '至聖先師' },
    { id: 33, name: '藥師佛', count: 100, guideNeedle: '藥師佛' },
  ];

  it.each(expected)('fully configures $name', ({ id, name, count, guideNeedle }) => {
    expect(gods.find((god) => god.id === id)?.name).toBe(name);
    expect(getPoemsByGod(id)).toHaveLength(count);
    expect(getOracleCatalogByGodId(id).totalPoems).toBe(count);
    expect(getGodProfile(id)).not.toBeNull();
    expect(getGodQuestionGuide(id).title).toContain(guideNeedle);
    expect(getGodBlessingSet(id)?.blessings).toHaveLength(5);
    expect(getGodCardImage(id)).not.toBeNull();
    expect(getGodSoftImage(id)).not.toBeNull();
    expect(getGodCloseupImage(id)).not.toBeNull();
  });
});