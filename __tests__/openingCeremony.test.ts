import { OPENING_VARIANTS, pickOpeningVariant } from '@/components/OpeningCeremony';

describe('opening ceremony variants', () => {
  it('ships five distinct temple-inspired openings', () => {
    expect(OPENING_VARIANTS).toEqual(['temple', 'incense', 'seal', 'lotus', 'radiance']);
    expect(new Set(OPENING_VARIANTS).size).toBe(5);
  });

  it('maps the random range across every variant', () => {
    expect([0, 0.2, 0.4, 0.6, 0.8].map(pickOpeningVariant)).toEqual(OPENING_VARIANTS);
  });

  it('clamps unexpected random values safely', () => {
    expect(pickOpeningVariant(-1)).toBe('temple');
    expect(pickOpeningVariant(4)).toBe('radiance');
    expect(pickOpeningVariant(Number.NaN)).toBe('temple');
  });
});
