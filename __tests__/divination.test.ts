import { drawPoem, tossJiaobei } from '@/services/divination';
import { gods } from '@/data/gods';

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
