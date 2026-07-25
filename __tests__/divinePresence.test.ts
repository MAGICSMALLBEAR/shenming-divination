import { getDivinePresenceMode } from '@/components/divine-presence/DivinePresenceStage';

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
    expect(getDivinePresenceMode('toss-jiaobei', result)).toBe(expected);
  });

  it('hands the visual focus to the poem during drawing and interpretation', () => {
    expect(getDivinePresenceMode('drawing')).toBe('revealing');
    expect(getDivinePresenceMode('ai-interpret')).toBe('revealing');
    expect(getDivinePresenceMode('result')).toBe('resting');
  });
});
