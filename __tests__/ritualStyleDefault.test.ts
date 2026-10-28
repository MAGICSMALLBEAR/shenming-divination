import { resolveDefaultRitualStyleKey } from '@/constants/draw-animation-styles';
import { getDefaultRitualStyleKey } from '@/constants/ritual-styles';
import { gods } from '@/data/gods';

describe('上香預設質感', () => {
  const guanyin = gods.find((god) => god.category === 'compassion')!;

  it('依神明預設：沒有設定或設定為 random 時照神明屬性挑質感', () => {
    expect(resolveDefaultRitualStyleKey(guanyin)).toBe(getDefaultRitualStyleKey(guanyin));
    expect(resolveDefaultRitualStyleKey(guanyin, { drawAnimationMode: 'random', drawAnimationStyleKey: 'ebony' }))
      .toBe(getDefaultRitualStyleKey(guanyin));
  });

  it('固定質感：每位神明都先帶入設定頁指定的質感', () => {
    for (const god of gods.slice(0, 10)) {
      expect(resolveDefaultRitualStyleKey(god, { drawAnimationMode: 'fixed', drawAnimationStyleKey: 'jade' })).toBe('jade');
    }
  });

  it('固定質感但存了無效值時退回青銅', () => {
    expect(resolveDefaultRitualStyleKey(guanyin, { drawAnimationMode: 'fixed', drawAnimationStyleKey: 'gold' })).toBe('bronze');
  });
});
