import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { gods, getPoemsByGod } from '@/data/gods';
import {
  chenghuangFocusedPoems,
  deityFocusedSystemMeta,
  dizangFocusedPoems,
  jinmuFocusedPoems,
  mazuFocusedPoems,
  wenchangFocusedPoems,
  xuantianFocusedPoems,
} from '@/data/poems/deityFocused';

describe('oracle coverage and dedicated deity systems', () => {
  it('keeps every god mapped to the advertised number of poems', () => {
    for (const god of gods) {
      const poems = getPoemsByGod(god.id);
      expect(poems).toHaveLength(god.totalPoems);
      expect(poems.map((poem) => poem.number)).toEqual(
        Array.from({ length: god.totalPoems }, (_, index) => index + 1)
      );
    }
  });

  it('keeps the source catalog count and coverage aligned with each god', () => {
    for (const god of gods) {
      const catalog = getOracleCatalogByGodId(god.id);
      expect(catalog.totalPoems).toBe(god.totalPoems);
      expect(catalog.versionTag).not.toBe('internal-general-v1');
    }
  });

  it('keeps strengthened system labels aligned across god cards and source audit', () => {
    for (const godId of [3, 8, 10, 14, 18, 19]) {
      const god = gods.find((item) => item.id === godId);
      expect(god).toBeDefined();
      expect(getOracleCatalogByGodId(godId).label).toBe(god?.poemSystem);
    }
  });

  it('provides independent focused arrays for the six strengthened systems', () => {
    expect(mazuFocusedPoems).toHaveLength(100);
    expect(wenchangFocusedPoems).toHaveLength(100);
    expect(xuantianFocusedPoems).toHaveLength(28);
    expect(chenghuangFocusedPoems).toHaveLength(60);
    expect(jinmuFocusedPoems).toHaveLength(28);
    expect(dizangFocusedPoems).toHaveLength(24);

    expect(mazuFocusedPoems[0].jieYue.travel).toContain('聖母護航專解');
    expect(wenchangFocusedPoems[0].jieYue.study).toContain('功名學業專解');
    expect(xuantianFocusedPoems[0].jieYue.general).toContain('鎮煞穩局專解');
    expect(chenghuangFocusedPoems[0].jieYue.career).toContain('公道文書專解');
    expect(jinmuFocusedPoems[0].jieYue.general).toContain('慈光和合專解');
    expect(dizangFocusedPoems[0].jieYue.health).toContain('安心解厄專解');
  });

  it('assigns a unique version and id namespace to each focused system', () => {
    const metadata = Object.values(deityFocusedSystemMeta);
    expect(new Set(metadata.map((item) => item.versionTag)).size).toBe(metadata.length);
    expect(new Set(metadata.map((item) => item.idOffset)).size).toBe(metadata.length);
  });
});