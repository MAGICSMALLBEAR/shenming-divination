import { gods, getPoemsByGod } from '@/data/gods';
import { getGodBlessingSet } from '@/data/godBlessings';
import { getGodCardImage, getGodCloseupImage, getGodSoftImage } from '@/data/godImages';
import { getGodProfile } from '@/data/godProfiles';
import { getGodQuestionGuide } from '@/data/godQuestionGuides';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { drawPoem, tossJiaobei } from '@/services/divination';

describe('tossJiaobei', () => {
  it('always returns one of the three valid jiaobei outcomes', () => {
    const valid = new Set(['shengbei', 'xiaobei', 'yinbei']);
    for (let i = 0; i < 50; i++) {
      expect(valid.has(tossJiaobei())).toBe(true);
    }
  });
});

describe('drawPoem', () => {
  it('returns a valid poem for every configured god', () => {
    for (const god of gods) {
      const poem = drawPoem(god.id);
      expect(poem).toBeTruthy();
      expect(typeof poem.number).toBe('number');
      expect(poem.number).toBeGreaterThan(0);
      expect(typeof poem.content).toBe('string');
      expect(poem.content.length).toBeGreaterThan(0);
    }
  });
});

describe('configured god data', () => {
  it('keeps each god totalPoems in sync with its configured poem set and catalog', () => {
    for (const god of gods) {
      const poems = getPoemsByGod(god.id);
      const catalog = getOracleCatalogByGodId(god.id);

      expect(poems).toHaveLength(god.totalPoems);
      expect(catalog.totalPoems).toBe(god.totalPoems);
      expect(catalog.label).toBeTruthy();
    }
  });

  it('provides images, profiles, blessings, and question guides for every god', () => {
    for (const god of gods) {
      expect(getGodCardImage(god.id)).toBeTruthy();
      expect(getGodSoftImage(god.id)).toBeTruthy();
      expect(getGodCloseupImage(god.id)).toBeTruthy();
      expect(getGodProfile(god.id)).toBeTruthy();
      expect(getGodBlessingSet(god.id)?.blessings).toHaveLength(5);
      expect(getGodQuestionGuide(god.id).prompts.length).toBeGreaterThan(0);
    }
  });
});