import {
  baoshengHealthPoems,
  jigongLingQianPoems,
  santaiziBreakthroughPoems,
  yuelaoMarriagePoems,
} from '@/data/poems/godSpecific';

describe('god-specific poem generation', () => {
  it('does not let the general field silently overwrite a focusKey of "general" (jigong)', () => {
    // Regression test: jigongConfig.focusKey === 'general', so the focused
    // rewrite must land in jieYue.general, not get clobbered by a second
    // "general:" write.
    const poem = jigongLingQianPoems[0];
    expect(poem.jieYue.general).toContain('破迷開悟專解');
  });

  it('keeps both the focused field and the general field distinct when focusKey !== "general"', () => {
    const poem = baoshengHealthPoems[0];
    expect(poem.jieYue.health).toContain('身心調養專解');
    expect(poem.jieYue.general).toContain('保生大帝提醒');
  });

  it('produces the expected id offsets and counts for each god-specific system', () => {
    expect(baoshengHealthPoems).toHaveLength(100);
    expect(jigongLingQianPoems).toHaveLength(100);
    expect(santaiziBreakthroughPoems).toHaveLength(60);
    expect(yuelaoMarriagePoems).toHaveLength(60);

    expect(baoshengHealthPoems[0].id).toBe(5000 + baoshengHealthPoems[0].number);
    expect(jigongLingQianPoems[0].id).toBe(5100 + jigongLingQianPoems[0].number);
  });
});
