import { blendOver, getDivinePresenceMode } from '@/components/divine-presence/DivinePresenceStage';

describe('divine presence state mapping', () => {
  it('moves from offering to meditation after incense is complete', () => {
    expect(getDivinePresenceMode('meditate', null, false)).toBe('offering');
    expect(getDivinePresenceMode('meditate', null, true)).toBe('meditating');
  });

  it.each([
    ['shengbei', 'approve'],
    ['xiaobei', 'reconsider'],
    ['yinbei', 'decline'],
  ] as const)('maps %s to the matching deity response', (result, expected) => {
    expect(getDivinePresenceMode('verify-poem', result)).toBe(expected);
  });

  it('hands the visual focus to the poem during drawing and interpretation', () => {
    expect(getDivinePresenceMode('drawing')).toBe('revealing');
    expect(getDivinePresenceMode('ai-interpret')).toBe('revealing');
    expect(getDivinePresenceMode('result')).toBe('resting');
  });
});

describe('portrait edge fade colour', () => {
  it('matches the backdrop composited over the stage so the fade has no seam', () => {
    // #RRGGBBAA backdrop at 72% layer opacity: weight = 0x38/255 * 0.72 ≈ 0.158
    expect(blendOver('#100B08', '#1A3A6E38', 0.72)).toBe('#121218');
    expect(blendOver('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(blendOver('#100B08', '#111821', 0)).toBe('#100B08');
    expect(blendOver('#100B08', '#111821', 1)).toBe('#111821');
  });
});
