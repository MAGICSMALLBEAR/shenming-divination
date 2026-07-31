// Unit tests for latest features: 風水羅盤, 拜拜指南, 解夢, 年度回顧

import { getDirection, getDailyDirection, getAllDirections } from '@/services/fengshuiCompass';
import { worshipGuides } from '@/data/worshipGuide';
import { analyzeDream } from '@/services/dreamAnalysis';
import { generateYearlyReview, getAvailableYears } from '@/services/yearlyReview';

// ─── Mocks for yearlyReview ───

const mockGetHistory = jest.fn();
const mockGetWishes = jest.fn();

jest.mock('@/services/storage', () => ({
  getHistory: (...args: unknown[]) => mockGetHistory(...args),
}));

jest.mock('@/services/wishTracker', () => ({
  getWishes: (...args: unknown[]) => mockGetWishes(...args),
}));

// ─── 風水羅盤 (fengshuiCompass) ───

describe('fengshuiCompass', () => {
  describe('getDirection', () => {
    it('returns 坎卦 (北) for 0°', () => {
      const result = getDirection(0);
      expect(result.direction).toBe('北');
      expect(result.bagua).toBe('坎');
      expect(result.baguaSymbol).toBe('☵');
    });

    it('returns 震卦 (東) for 90°', () => {
      const result = getDirection(90);
      expect(result.direction).toBe('東');
      expect(result.bagua).toBe('震');
      expect(result.baguaSymbol).toBe('☳');
    });

    it('returns 離卦 (南) for 180°', () => {
      const result = getDirection(180);
      expect(result.direction).toBe('南');
      expect(result.bagua).toBe('離');
      expect(result.baguaSymbol).toBe('☲');
    });

    it('returns 兌卦 (西) for 270°', () => {
      const result = getDirection(270);
      expect(result.direction).toBe('西');
      expect(result.bagua).toBe('兌');
      expect(result.baguaSymbol).toBe('☱');
    });

    it('handles edge case: 360° wraps to 0° (坎卦 北)', () => {
      const result = getDirection(360);
      expect(result.direction).toBe('北');
      expect(result.bagua).toBe('坎');
    });

    it('handles edge case: -90° normalizes to 270° (兌卦 西)', () => {
      const result = getDirection(-90);
      expect(result.direction).toBe('西');
      expect(result.bagua).toBe('兌');
    });

    it('handles edge case: 720° normalizes to 0° (坎卦 北)', () => {
      const result = getDirection(720);
      expect(result.direction).toBe('北');
      expect(result.bagua).toBe('坎');
    });

    it('returns all required fields for every 45° increment', () => {
      for (let heading = 0; heading < 360; heading += 45) {
        const result = getDirection(heading);
        expect(result).toHaveProperty('direction');
        expect(result).toHaveProperty('heading');
        expect(result).toHaveProperty('bagua');
        expect(result).toHaveProperty('baguaSymbol');
        expect(result).toHaveProperty('element');
        expect(result).toHaveProperty('fortune');
        expect(result).toHaveProperty('fortuneType');
        expect(result).toHaveProperty('suitable');
        expect(result).toHaveProperty('avoid');
        expect(result).toHaveProperty('description');
        expect(typeof result.direction).toBe('string');
        expect(typeof result.bagua).toBe('string');
        expect(typeof result.element).toBe('string');
        expect(typeof result.fortune).toBe('string');
        expect(['great', 'good', 'neutral']).toContain(result.fortuneType);
      }
    });
  });

  describe('getDailyDirection', () => {
    it('returns a valid DailyDirection with reason', () => {
      const result = getDailyDirection();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('direction');
      expect(result).toHaveProperty('bagua');
      expect(result).toHaveProperty('element');
      expect(result).toHaveProperty('reason');
      expect(typeof result.reason).toBe('string');
      expect(result.reason.length).toBeGreaterThan(10);
    });

    it('returns consistent result for the same date', () => {
      const date = new Date(2026, 6, 15);
      const result1 = getDailyDirection(date);
      const result2 = getDailyDirection(date);
      expect(result1.direction).toBe(result2.direction);
      expect(result1.bagua).toBe(result2.bagua);
    });

    it('includes all DirectionResult fields plus reason', () => {
      const result = getDailyDirection();
      expect(result).toHaveProperty('direction');
      expect(result).toHaveProperty('heading');
      expect(result).toHaveProperty('bagua');
      expect(result).toHaveProperty('baguaSymbol');
      expect(result).toHaveProperty('element');
      expect(result).toHaveProperty('fortune');
      expect(result).toHaveProperty('fortuneType');
      expect(result).toHaveProperty('suitable');
      expect(result).toHaveProperty('avoid');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('reason');
    });
  });

  describe('getAllDirections', () => {
    it('returns 8 entries', () => {
      const directions = getAllDirections();
      expect(directions).toHaveLength(8);
    });

    it('each direction has required fields (bagua, element, fortune, suitable, avoid)', () => {
      const directions = getAllDirections();
      for (const dir of directions) {
        expect(dir).toHaveProperty('bagua');
        expect(dir).toHaveProperty('element');
        expect(dir).toHaveProperty('fortune');
        expect(dir).toHaveProperty('suitable');
        expect(dir).toHaveProperty('avoid');
        expect(typeof dir.bagua).toBe('string');
        expect(dir.bagua.length).toBeGreaterThan(0);
        expect(typeof dir.element).toBe('string');
        expect(typeof dir.fortune).toBe('string');
        expect(typeof dir.suitable).toBe('string');
        expect(typeof dir.avoid).toBe('string');
      }
    });

    it('contains all 8 bagua names', () => {
      const directions = getAllDirections();
      const baguaNames = directions.map((d) => d.bagua);
      const expected = ['乾', '兌', '坤', '坎', '艮', '巽', '震', '離'];
      expect(baguaNames).toEqual(expect.arrayContaining(expected));
      expect(baguaNames).toHaveLength(8);
    });
  });
});

// ─── 拜拜指南 (worshipGuide) ───

describe('worshipGuide', () => {
  it('worshipGuides is a non-empty array', () => {
    expect(Array.isArray(worshipGuides)).toBe(true);
    expect(worshipGuides.length).toBeGreaterThan(0);
  });

  it('each guide has required fields (godName, offerings, steps, taboos, prayer)', () => {
    for (const guide of worshipGuides) {
      expect(guide).toHaveProperty('godName');
      expect(guide).toHaveProperty('offerings');
      expect(guide).toHaveProperty('steps');
      expect(guide).toHaveProperty('taboos');
      expect(guide).toHaveProperty('prayer');
      expect(typeof guide.godName).toBe('string');
      expect(guide.godName.length).toBeGreaterThan(0);
      expect(Array.isArray(guide.offerings)).toBe(true);
      expect(Array.isArray(guide.steps)).toBe(true);
      expect(Array.isArray(guide.taboos)).toBe(true);
      expect(typeof guide.prayer).toBe('string');
      expect(guide.prayer.length).toBeGreaterThan(0);
    }
  });

  it('general guide exists (godId === 0)', () => {
    const generalGuide = worshipGuides.find((g) => g.godId === 0);
    expect(generalGuide).toBeDefined();
    expect(generalGuide!.godName).toContain('通用');
  });

  it('at least 10 category-specific guides exist', () => {
    const specificGuides = worshipGuides.filter((g) => g.godId !== 0);
    expect(specificGuides.length).toBeGreaterThanOrEqual(10);
  });

  it('offerings arrays are non-empty for each guide', () => {
    for (const guide of worshipGuides) {
      expect(guide.offerings.length).toBeGreaterThan(0);
    }
  });

  it('steps arrays are non-empty for each guide', () => {
    for (const guide of worshipGuides) {
      expect(guide.steps.length).toBeGreaterThan(0);
    }
  });

  it('each guide has a valid category', () => {
    const validCategories = [
      '天公', '王爺', '媽祖', '觀音', '關帝', '土地公',
      '財神', '文昌', '註生', '保生', '城隍', '陰神', '其他',
    ];
    for (const guide of worshipGuides) {
      expect(validCategories).toContain(guide.category);
    }
  });
});

// ─── 解夢 (dreamAnalysis) ───

describe('dreamAnalysis', () => {
  it('returns result with symbols, interpretation, fortune, and advice', () => {
    const result = analyzeDream('我夢見一條龍在天空中飛翔');
    expect(result).toHaveProperty('symbols');
    expect(result).toHaveProperty('interpretation');
    expect(result).toHaveProperty('fortune');
    expect(result).toHaveProperty('advice');
    expect(Array.isArray(result.symbols)).toBe(true);
    expect(typeof result.interpretation).toBe('string');
    expect(result.interpretation.length).toBeGreaterThan(0);
    expect(typeof result.advice).toBe('string');
    expect(result.advice.length).toBeGreaterThan(0);
  });

  it('fortune is one of 吉, 中, or 凶', () => {
    const dreams = [
      '我夢見一條龍',
      '我夢見地震',
      '我夢見花朵盛開',
      '我夢見迷路了',
      '我夢見牙齒掉落',
    ];
    for (const dream of dreams) {
      const result = analyzeDream(dream);
      expect(['吉', '中', '凶']).toContain(result.fortune);
    }
  });

  it('detects common dream symbol 水 in symbols', () => {
    const result = analyzeDream('我夢見大海的水很清澈');
    expect(result.symbols).toContain('水');
  });

  it('detects multiple symbols in a complex dream', () => {
    const result = analyzeDream('夢見在山上的寺廟裡看到一條龍和魚在水中游');
    // Should detect at least some of: 山, 寺廟, 龍, 魚, 水
    expect(result.symbols.length).toBeGreaterThan(0);
    // At minimum 水 or 魚 should be found
    const hasWaterOrFish = result.symbols.some((s) => s === '水' || s === '魚');
    expect(hasWaterOrFish).toBe(true);
  });

  it('feeling parameter affects the result', () => {
    const dream = '我夢見一條蛇';
    const resultWithoutFeeling = analyzeDream(dream);
    const resultWithFear = analyzeDream(dream, '害怕');

    // Feeling should change at least one of fortune or interpretation
    const hasChanged =
      resultWithoutFeeling.fortune !== resultWithFear.fortune ||
      resultWithoutFeeling.interpretation !== resultWithFear.interpretation ||
      resultWithoutFeeling.advice !== resultWithFear.advice;

    expect(hasChanged).toBe(true);
  });

  it('positive feeling improves fortune', () => {
    // 墜落 is normally 凶
    const baseResult = analyzeDream('我夢見從高處墜落');
    const happyResult = analyzeDream('我夢見從高處墜落', '開心');

    // Base fortune for 墜落 is 凶, positive feeling should bump it to at most 中
    // But if only one symbol, score is -1, not <= -2, so base fortune might be 中
    // Let's verify the actual fortune
    expect(baseResult.fortune).toBe('中'); // single 凶 symbol → score -1, not <= -2 → 中
    // 開心 is positive → 中 → 吉
    expect(happyResult.fortune).toBe('吉');
  });

  it('negative feeling worsens fortune', () => {
    // 龍 is 吉 (score +1)
    const baseResult = analyzeDream('我夢見一條龍');
    const sadResult = analyzeDream('我夢見一條龍', '悲傷');

    expect(baseResult.fortune).toBe('中'); // single 吉 symbol → score +1, not >= 2 → 中
    // 悲傷 is negative → 中 → 凶
    expect(sadResult.fortune).toBe('凶');
  });

  it('empty dream string returns valid result (does not crash)', () => {
    let result: ReturnType<typeof analyzeDream>;
    expect(() => {
      result = analyzeDream('');
    }).not.toThrow();
    result = analyzeDream('');
    expect(result).toBeDefined();
    expect(result.symbols).toEqual([]);
    expect(result.fortune).toBe('中');
    expect(typeof result.interpretation).toBe('string');
    expect(typeof result.advice).toBe('string');
  });

  it('whitespace-only dream string returns valid result', () => {
    const result = analyzeDream('   ');
    expect(result).toBeDefined();
    expect(result.symbols).toEqual([]);
    expect(result.fortune).toBe('中');
  });

  it('returns symbols up to a maximum of 8', () => {
    const result = analyzeDream(
      '夢見水裡有魚和蛇，天上飛著鳥和龍，山上刮著風下著雨，還有火在燒'
    );
    expect(result.symbols.length).toBeLessThanOrEqual(8);
  });
});

// ─── 年度回顧 (yearlyReview) ───

describe('yearlyReview', () => {
  beforeEach(() => {
    mockGetHistory.mockReset();
    mockGetWishes.mockReset();
    // Default: empty
    mockGetHistory.mockResolvedValue([]);
    mockGetWishes.mockResolvedValue([]);
  });

  describe('generateYearlyReview', () => {
    it('returns { insufficient: true } with no records', async () => {
      mockGetHistory.mockResolvedValue([]);
      mockGetWishes.mockResolvedValue([]);

      const result = await generateYearlyReview(2025);
      expect(result.insufficient).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.totalDraws).toBe(0);
    });

    it('returns { insufficient: true } with fewer than 3 records', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '測試籤', poem: '', interpretation: '' },
          question: '我的運勢如何？',
          questionCategory: 'general',
          timestamp: new Date('2025-03-15').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '中平', title: '測試籤2', poem: '', interpretation: '' },
          question: '事業發展？',
          questionCategory: 'career',
          timestamp: new Date('2025-06-20').getTime(),
        },
      ]);
      mockGetWishes.mockResolvedValue([]);

      const result = await generateYearlyReview(2025);
      expect(result.insufficient).toBe(true);
      expect(result.totalDraws).toBe(2);
    });

    it('returns full review with 3+ records', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '籤1', poem: '', interpretation: '' },
          question: '我的運勢如何？',
          questionCategory: 'general',
          timestamp: new Date('2025-01-15').getTime(),
          verificationStatus: 'matched' as const,
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 5, level: '中平', title: '籤2', poem: '', interpretation: '' },
          question: '事業發展如何？',
          questionCategory: 'career',
          timestamp: new Date('2025-03-20').getTime(),
        },
        {
          id: '3',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '籤1', poem: '', interpretation: '' },
          question: '感情姻緣？',
          questionCategory: 'love',
          timestamp: new Date('2025-06-10').getTime(),
          verificationStatus: 'unmatched' as const,
        },
      ]);
      mockGetWishes.mockResolvedValue([]);

      const result = await generateYearlyReview(2025);
      expect(result.insufficient).toBe(false);
      expect(result.totalDraws).toBe(3);
      expect(result.year).toBe(2025);
      expect(result.favoriteGod).not.toBeNull();
      expect(result.favoriteGod!.name).toBe('媽祖');
      expect(result.favoriteGod!.count).toBe(2);
      expect(result.favoriteQuestionCategory).not.toBeNull();
      expect(result.levelDistribution.length).toBeGreaterThan(0);
      expect(result.verifiedCount).toBe(2);
      expect(result.matchedCount).toBe(1);
      expect(result.unmatchedCount).toBe(1);
      expect(result.monthlyDraws).toHaveLength(12);
      expect(result.longestStreak).toBeGreaterThanOrEqual(1);
      expect(result.topPoem).not.toBeNull();
    });

    it('returns monthlyDraws as array of 12 numbers', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '籤1', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'general',
          timestamp: new Date('2025-01-15').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '吉', title: '籤2', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'career',
          timestamp: new Date('2025-03-20').getTime(),
        },
        {
          id: '3',
          godName: '土地公',
          poem: { number: 3, level: '下下', title: '籤3', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'wealth',
          timestamp: new Date('2025-06-10').getTime(),
        },
      ]);
      mockGetWishes.mockResolvedValue([]);

      const result = await generateYearlyReview(2025);
      expect(result.monthlyDraws).toHaveLength(12);
      expect(result.monthlyDraws.every((v) => typeof v === 'number')).toBe(true);
      // January (index 0) should have 1
      expect(result.monthlyDraws[0]).toBe(1);
      // March (index 2) should have 1
      expect(result.monthlyDraws[2]).toBe(1);
    });

    it('tracks wishes fulfilled count', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '籤1', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'general',
          timestamp: new Date('2025-03-15').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '中平', title: '籤2', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'career',
          timestamp: new Date('2025-06-20').getTime(),
        },
        {
          id: '3',
          godName: '土地公',
          poem: { number: 3, level: '中平', title: '籤3', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'wealth',
          timestamp: new Date('2025-09-10').getTime(),
        },
      ]);
      mockGetWishes.mockResolvedValue([
        {
          id: 'w1',
          content: '願望1',
          godName: '媽祖',
          poemNumber: 1,
          poemSummary: '',
          createdAt: new Date('2025-04-01').getTime(),
          fulfilled: true,
        },
        {
          id: 'w2',
          content: '願望2',
          godName: '關聖帝君',
          poemNumber: 2,
          poemSummary: '',
          createdAt: new Date('2025-07-01').getTime(),
          fulfilled: false,
        },
      ]);

      const result = await generateYearlyReview(2025);
      expect(result.totalWishes).toBe(2);
      expect(result.wishesFulfilled).toBe(1);
    });

    it('filters records by target year only', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '籤1', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'general',
          timestamp: new Date('2024-05-15').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '中平', title: '籤2', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'career',
          timestamp: new Date('2025-03-20').getTime(),
        },
        {
          id: '3',
          godName: '土地公',
          poem: { number: 3, level: '下下', title: '籤3', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'wealth',
          timestamp: new Date('2025-06-10').getTime(),
        },
        {
          id: '4',
          godName: '觀音菩薩',
          poem: { number: 4, level: '吉', title: '籤4', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'health',
          timestamp: new Date('2025-09-01').getTime(),
        },
      ]);
      mockGetWishes.mockResolvedValue([]);

      const result = await generateYearlyReview(2025);
      expect(result.insufficient).toBe(false);
      expect(result.totalDraws).toBe(3); // Only 2025 records
    });

    it('luckyMonth has valid month and ratio', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '籤1', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'general',
          timestamp: new Date('2025-02-15').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '下下', title: '籤2', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'career',
          timestamp: new Date('2025-02-20').getTime(),
        },
        {
          id: '3',
          godName: '土地公',
          poem: { number: 3, level: '下下', title: '籤3', poem: '', interpretation: '' },
          question: '測試',
          questionCategory: 'wealth',
          timestamp: new Date('2025-06-10').getTime(),
        },
      ]);
      mockGetWishes.mockResolvedValue([]);

      const result = await generateYearlyReview(2025);
      expect(result.luckyMonth).not.toBeNull();
      expect(result.luckyMonth!.month).toBeGreaterThanOrEqual(1);
      expect(result.luckyMonth!.month).toBeLessThanOrEqual(12);
      expect(result.luckyMonth!.ratio).toBeGreaterThanOrEqual(0);
      expect(result.luckyMonth!.ratio).toBeLessThanOrEqual(100);
    });
  });

  describe('getAvailableYears', () => {
    it('returns an array of numbers', async () => {
      mockGetHistory.mockResolvedValue([]);
      const years = await getAvailableYears();
      expect(Array.isArray(years)).toBe(true);
      expect(years.length).toBeGreaterThan(0);
    });

    it('includes current year even with no history', async () => {
      mockGetHistory.mockResolvedValue([]);
      const years = await getAvailableYears();
      const currentYear = new Date().getFullYear();
      expect(years).toContain(currentYear);
    });

    it('includes years from history records', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '', poem: '', interpretation: '' },
          question: '',
          questionCategory: 'general',
          timestamp: new Date('2023-05-15').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '中平', title: '', poem: '', interpretation: '' },
          question: '',
          questionCategory: 'general',
          timestamp: new Date('2024-08-20').getTime(),
        },
      ]);
      const years = await getAvailableYears();
      expect(years).toContain(2023);
      expect(years).toContain(2024);
    });

    it('returns years sorted descending', async () => {
      mockGetHistory.mockResolvedValue([
        {
          id: '1',
          godName: '媽祖',
          poem: { number: 1, level: '上上', title: '', poem: '', interpretation: '' },
          question: '',
          questionCategory: 'general',
          timestamp: new Date('2022-01-01').getTime(),
        },
        {
          id: '2',
          godName: '關聖帝君',
          poem: { number: 2, level: '中平', title: '', poem: '', interpretation: '' },
          question: '',
          questionCategory: 'general',
          timestamp: new Date('2024-06-15').getTime(),
        },
      ]);
      const years = await getAvailableYears();
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeGreaterThan(years[i + 1]);
      }
    });
  });
});
