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
    { id: 34, name: '齊天大聖', count: 60, guideNeedle: '齊天大聖' },
    { id: 35, name: '鍾馗', count: 60, guideNeedle: '鍾馗天師' },
    { id: 36, name: '王母娘娘', count: 100, guideNeedle: '王母娘娘' },
    { id: 37, name: '巧聖先師', count: 60, guideNeedle: '巧聖先師' },
    { id: 38, name: '東嶽大帝', count: 100, guideNeedle: '東嶽大帝' },
    { id: 39, name: '閻羅天子', count: 100, guideNeedle: '閻羅天子' },
    { id: 40, name: '酆都大帝', count: 100, guideNeedle: '酆都大帝' },
    { id: 41, name: '五顯大帝', count: 60, guideNeedle: '五顯大帝' },
    { id: 42, name: '池府千歲', count: 60, guideNeedle: '池府千歲' },
    { id: 43, name: '五年千歲', count: 60, guideNeedle: '五年千歲' },
    { id: 44, name: '關平太子', count: 60, guideNeedle: '關平太子' },
    { id: 45, name: '周倉將軍', count: 60, guideNeedle: '周倉將軍' },
    { id: 46, name: '千里眼', count: 60, guideNeedle: '千里眼' },
    { id: 47, name: '順風耳', count: 60, guideNeedle: '順風耳' },
    { id: 48, name: '太陽星君', count: 60, guideNeedle: '太陽星君' },
    { id: 49, name: '太陰娘娘', count: 100, guideNeedle: '太陰娘娘' },
    { id: 50, name: '法主真君', count: 60, guideNeedle: '法主真君' },
    { id: 51, name: '地基主', count: 60, guideNeedle: '地基主' },
    { id: 52, name: '黃大仙', count: 60, guideNeedle: '黃大仙' },
    { id: 53, name: '二郎神', count: 60, guideNeedle: '二郎神' },
    { id: 54, name: '張天師', count: 60, guideNeedle: '張天師' },
    { id: 55, name: '華陀先師', count: 60, guideNeedle: '華陀先師' },
    { id: 56, name: '十八王公', count: 60, guideNeedle: '十八王公' },
    { id: 57, name: '雷公', count: 60, guideNeedle: '雷公' },
    { id: 58, name: '釋迦牟尼佛', count: 100, guideNeedle: '釋迦牟尼佛' },
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