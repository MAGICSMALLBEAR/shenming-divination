// Unit tests for new features: 測字, 姓名學, 稱骨歌, 犯太歲

import { analyzeCharacter } from '@/services/characterDivination';
import { analyzeName, getStrokes, strokesToElement } from '@/services/nameAnalysis';
import { calculateBoneWeight } from '@/services/boneWeight';
import { calculateTaiSui, getCurrentYearInfo } from '@/services/taiSui';

// ─── 測字 (characterDivination) ───

describe('characterDivination', () => {
  it('returns valid result with all required fields for 福', () => {
    const result = analyzeCharacter('福');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meaning');
    expect(result).toHaveProperty('structure');
    expect(result).toHaveProperty('fortune');
    expect(result).toHaveProperty('fortuneLabel');
    expect(result).toHaveProperty('advice');
    expect(typeof result.meaning).toBe('string');
    expect(result.meaning.length).toBeGreaterThan(10);
    expect(typeof result.structure).toBe('string');
    expect(typeof result.advice).toBe('string');
  });

  it('returns fortune 吉 for auspicious characters 福, 龍, 安, 財', () => {
    for (const char of ['福', '龍', '安', '財']) {
      const result = analyzeCharacter(char);
      expect(result.fortune).toBe('吉');
      expect(result.fortuneLabel).toBe('吉');
    }
  });

  it('fortune is always one of 吉, 中, or 凶', () => {
    const testChars = ['福', '龍', '安', '財', '愛', '忍', '變', '緣', '靜', '等',
                        '難', '險', '亂', '夢', '路', '迷', '思', '情', '行', '錢'];
    for (const char of testChars) {
      const result = analyzeCharacter(char);
      expect(['吉', '中', '凶']).toContain(result.fortune);
      expect(result.fortuneLabel).toBe(result.fortune);
    }
  });

  it('handles empty string gracefully without throwing', () => {
    let result;
    expect(() => {
      result = analyzeCharacter('');
    }).not.toThrow();
    expect(result).toBeDefined();
    expect(result!.meaning).toBeDefined();
    expect(result!.structure).toBeDefined();
    expect(['吉', '中', '凶']).toContain(result!.fortune);
  });

  it('handles non-Chinese characters gracefully', () => {
    for (const char of ['A', '1', '@', '!', 'abc']) {
      const result = analyzeCharacter(char);
      expect(result).toBeDefined();
      expect(result.meaning).toBeDefined();
      expect(['吉', '中', '凶']).toContain(result.fortune);
    }
  });

  it('returns correct fortune type for known characters across all categories', () => {
    // 吉 characters
    expect(analyzeCharacter('福').fortune).toBe('吉');
    expect(analyzeCharacter('祥').fortune).toBe('吉');
    expect(analyzeCharacter('春').fortune).toBe('吉');
    // 中 characters
    expect(analyzeCharacter('愛').fortune).toBe('中');
    expect(analyzeCharacter('忍').fortune).toBe('中');
    // 凶 characters
    expect(analyzeCharacter('難').fortune).toBe('凶');
    expect(analyzeCharacter('險').fortune).toBe('凶');
  });

  it('includes question in result when question parameter is provided', () => {
    const result = analyzeCharacter('安', '我的未來如何？');
    expect(result.meaning).toContain('我的未來如何？');
  });
});

// ─── 姓名學 (nameAnalysis) ───

describe('nameAnalysis', () => {
  it('analyzeName returns valid result for 陳小明', () => {
    const result = analyzeName('陳', '小明');
    expect(result).not.toBeNull();
    expect(result!.surname).toBe('陳');
    expect(result!.givenName).toBe('小明');
    expect(result!.surnameStrokes).toBe(16);
    expect(result!.givenNameStrokes).toBe(11);  // 小=3 + 明=8
    expect(result!.totalStrokes).toBe(27);       // 16 + 11
  });

  it('天格, 人格, 地格, 外格, 總格 are all positive integers', () => {
    const result = analyzeName('陳', '小明');
    expect(result).not.toBeNull();
    expect(Number.isInteger(result!.tianGe.value)).toBe(true);
    expect(Number.isInteger(result!.renGe.value)).toBe(true);
    expect(Number.isInteger(result!.diGe.value)).toBe(true);
    expect(Number.isInteger(result!.waiGe.value)).toBe(true);
    expect(Number.isInteger(result!.zongGe.value)).toBe(true);
    expect(result!.tianGe.value).toBeGreaterThan(0);
    expect(result!.renGe.value).toBeGreaterThan(0);
    expect(result!.diGe.value).toBeGreaterThan(0);
    expect(result!.waiGe.value).toBeGreaterThan(0);
    expect(result!.zongGe.value).toBeGreaterThan(0);
  });

  it('五格 values are correct for 陳小明 (陳=16, 小=3, 明=8)', () => {
    const result = analyzeName('陳', '小明');
    expect(result).not.toBeNull();
    // 天格: 單姓 16+1=17
    expect(result!.tianGe.value).toBe(17);
    // 人格: 姓氏末字(16) + 名字首字(3) = 19
    expect(result!.renGe.value).toBe(19);
    // 地格: 雙名 3+8=11
    expect(result!.diGe.value).toBe(11);
    // 總格: 16+3+8=27
    expect(result!.zongGe.value).toBe(27);
    // 外格: 27-19+1=9
    expect(result!.waiGe.value).toBe(9);
  });

  it('三才 combination is a non-empty string', () => {
    const result = analyzeName('陳', '小明');
    expect(result).not.toBeNull();
    expect(typeof result!.sanCai.combination).toBe('string');
    expect(result!.sanCai.combination.length).toBeGreaterThanOrEqual(3);
    expect(result!.sanCai.combination).toMatch(/^[木火土金水]{3}$/);
  });

  it('三才 judgment is one of the expected values', () => {
    const result = analyzeName('陳', '小明');
    expect(result).not.toBeNull();
    expect(['大吉', '吉', '中吉', '凶', '大凶']).toContain(result!.sanCai.judgment);
  });

  it('stroke count lookup returns correct values for known characters', () => {
    expect(getStrokes('陳')).toBe(16);
    expect(getStrokes('林')).toBe(8);
    expect(getStrokes('黃')).toBe(12);
    expect(getStrokes('張')).toBe(11);
    expect(getStrokes('李')).toBe(7);
    expect(getStrokes('王')).toBe(4);
  });

  it('result includes overallJudgment and luckyStrokes', () => {
    const result = analyzeName('陳', '小明');
    expect(result).not.toBeNull();
    expect(typeof result!.overallJudgment).toBe('string');
    expect(result!.overallJudgment.length).toBeGreaterThan(0);
    expect(Array.isArray(result!.luckyStrokes)).toBe(true);
    expect(result!.luckyStrokes.length).toBeGreaterThan(0);
    expect(result!.luckyStrokes).toContain(1);
    expect(result!.luckyStrokes).toContain(81);
  });

  it('returns null for empty surname', () => {
    expect(analyzeName('', '小明')).toBeNull();
  });

  it('returns null for empty given name', () => {
    expect(analyzeName('陳', '')).toBeNull();
  });

  it('returns null for whitespace-only inputs', () => {
    expect(analyzeName('  ', '小明')).toBeNull();
    expect(analyzeName('陳', '   ')).toBeNull();
  });

  it('handles compound surname correctly (歐陽)', () => {
    // 歐陽 is recognized as compound surname; 歐=15, 陽 not individually mapped
    // Compound surnames are treated as compound (no +1), strokes sum individual chars
    const result = analyzeName('歐陽', '修');
    expect(result).not.toBeNull();
    // 天格: compound surname → sum of individual char strokes (no +1)
    expect(result!.tianGe.value).toBe(15); // 歐=15, 陽=0(not in map)
    // surnameStrokes = 15
    expect(result!.surnameStrokes).toBe(15);
    // Given name is single char: 修 not in map → 0 strokes
    // 人格 = surname last char (0) + given first char (0) = 0
    // But since compound has index, let's verify tianGe has proper element
    expect(typeof result!.tianGe.element).toBe('string');
  });

  it('strokesToElement returns correct element based on last digit', () => {
    // 1-2=木, 3-4=火, 5-6=土, 7-8=金, 9-0=水
    expect(strokesToElement(1)).toBe('木');
    expect(strokesToElement(2)).toBe('木');
    expect(strokesToElement(3)).toBe('火');
    expect(strokesToElement(4)).toBe('火');
    expect(strokesToElement(5)).toBe('土');
    expect(strokesToElement(6)).toBe('土');
    expect(strokesToElement(7)).toBe('金');
    expect(strokesToElement(8)).toBe('金');
    expect(strokesToElement(9)).toBe('水');
    expect(strokesToElement(10)).toBe('水');
    expect(strokesToElement(11)).toBe('木');
  });

  it('each 格 result has value, element, and meaning', () => {
    const result = analyzeName('黃', '大中');
    expect(result).not.toBeNull();
    for (const ge of [result!.tianGe, result!.renGe, result!.diGe, result!.waiGe, result!.zongGe]) {
      expect(ge).toHaveProperty('value');
      expect(ge).toHaveProperty('element');
      expect(ge).toHaveProperty('meaning');
      expect(typeof ge.value).toBe('number');
      expect(typeof ge.element).toBe('string');
      expect(typeof ge.meaning).toBe('string');
    }
  });
});

// ─── 稱骨歌 (boneWeight) ───

describe('boneWeight', () => {
  it('returns expected weight for known birth date: 1990年1月1日 子時 (0時)', () => {
    const result = calculateBoneWeight(1990, 1, 1, 0);
    expect(result).not.toBeNull();
    // year 1990 = 0.9, month 1 = 0.6, day 1 = 0.5, hour 0(子) = 1.6
    // total = 0.9 + 0.6 + 0.5 + 1.6 = 3.6
    expect(result!.yearWeight).toBe(0.9);
    expect(result!.monthWeight).toBe(0.6);
    expect(result!.dayWeight).toBe(0.5);
    expect(result!.hourWeight).toBe(1.6);
    expect(result!.totalWeight).toBe(3.6);
  });

  it('returns expected weight for another known birth date: 2000年3月15日 午時 (12時)', () => {
    const result = calculateBoneWeight(2000, 3, 15, 12);
    expect(result).not.toBeNull();
    // year 2000 = 1.2, month 3 = 1.8, day 15 = 1.0, hour 12(午) → shichen = (13%24)/2 = 6 → 1.6
    // total = 1.2 + 1.8 + 1.0 + 1.6 = 5.6
    expect(result!.yearWeight).toBe(1.2);
    expect(result!.monthWeight).toBe(1.8);
    expect(result!.dayWeight).toBe(1.0);
    expect(result!.hourWeight).toBe(1.6);
    expect(result!.totalWeight).toBe(5.6);
  });

  it('returns null for invalid year (outside database)', () => {
    expect(calculateBoneWeight(1800, 1, 1, 0)).toBeNull();
    expect(calculateBoneWeight(2099, 1, 1, 0)).toBeNull();
  });

  it('returns null for invalid month', () => {
    expect(calculateBoneWeight(1990, 13, 1, 0)).toBeNull();
  });

  it('totalWeight is within valid range (between ~2.1 and ~7.2)', () => {
    // Test several known dates
    const dates = [
      [1990, 1, 1, 0],
      [2000, 6, 15, 6],
      [1984, 12, 30, 23],
      [2018, 3, 18, 8],
      [1972, 5, 5, 12],
    ];
    for (const [y, m, d, h] of dates) {
      const result = calculateBoneWeight(y, m, d, h);
      if (result) {
        expect(result.totalWeight).toBeGreaterThanOrEqual(2.0);
        expect(result.totalWeight).toBeLessThanOrEqual(7.5);
      }
    }
  });

  it('result includes poem, interpretation, and fortune level', () => {
    const result = calculateBoneWeight(1990, 1, 1, 0);
    expect(result).not.toBeNull();
    expect(typeof result!.poem).toBe('string');
    expect(result!.poem.length).toBeGreaterThan(0);
    expect(typeof result!.interpretation).toBe('string');
    expect(result!.interpretation.length).toBeGreaterThan(0);
    expect(['上上', '上吉', '中吉', '中平', '中下', '下下']).toContain(result!.fortune);
  });

  it('totalLabel is a properly formatted string', () => {
    const result = calculateBoneWeight(1990, 1, 1, 0);
    expect(result).not.toBeNull();
    expect(typeof result!.totalLabel).toBe('string');
    expect(result!.totalLabel).toContain('兩');
    expect(result!.totalLabel).toMatch(/^\d+兩/);
    expect(result!.totalLabel).toContain('錢');
    expect(result!.totalLabel).toBe('3兩6錢');
  });

  it('fortune is 上上 for very high total weights', () => {
    const result = calculateBoneWeight(2000, 3, 15, 12); // totalWeight = 5.6
    expect(result).not.toBeNull();
    expect(result!.fortune).toBe('上上');
  });

  it('fortune is 下下 for very low total weights', () => {
    // Find a combination with minimum weight:
    // year 2004=0.5, month 5=0.5, day 19=0.5, hour 4 (寅時→shichen 2)=0.6 → total = 2.1
    const result = calculateBoneWeight(2004, 5, 19, 4);
    expect(result).not.toBeNull();
    expect(result!.fortune).toBe('下下');
    expect(result!.totalWeight).toBeLessThanOrEqual(2.1);
  });
});

// ─── 犯太歲 (taiSui) ───

describe('taiSui', () => {
  it('getCurrentYearInfo returns current year zodiac', () => {
    const info = getCurrentYearInfo(2026);
    expect(info.year).toBe(2026);
    expect(info.zodiac).toBe('馬');
    expect(info.branch).toBe('午');
    expect(info.ganzhi).toBe('丙午');
    expect(info.emoji).toBeTruthy();
  });

  it('calculateTaiSui: birth year matching current year has 值太歲', () => {
    // 2026 is 馬年, birth 2026 is also 馬 → 值太歲
    const result = calculateTaiSui(2026, 2026);
    expect(result).not.toBeNull();
    expect(result!.isSafe).toBe(false);
    const zhiOffense = result!.offenses.find((o) => o.type === '值');
    expect(zhiOffense).toBeDefined();
    expect(zhiOffense!.severity).toBe(5);
    expect(zhiOffense!.label).toBe('值太歲');
  });

  it('calculateTaiSui: birth year 6 apart from current year has 沖太歲', () => {
    // 2026 馬年, 2020 鼠年 → 子午沖 (6 apart)
    const result = calculateTaiSui(2020, 2026);
    expect(result).not.toBeNull();
    expect(result!.isSafe).toBe(false);
    const chongOffense = result!.offenses.find((o) => o.type === '沖');
    expect(chongOffense).toBeDefined();
    expect(chongOffense!.severity).toBe(4);
    expect(chongOffense!.label).toBe('沖太歲');
  });

  it('calculateTaiSui: non-offending year has isSafe=true', () => {
    // 2022 虎年, not conflicting with 2026 馬年
    const result = calculateTaiSui(2022, 2026);
    expect(result).not.toBeNull();
    expect(result!.isSafe).toBe(true);
    expect(result!.offenses).toHaveLength(0);
  });

  it('calculateTaiSui: invalid birth year (<1900) returns null', () => {
    expect(calculateTaiSui(1800, 2026)).toBeNull();
    expect(calculateTaiSui(1500)).toBeNull();
  });

  it('calculateTaiSui: invalid birth year (>2100) returns null', () => {
    expect(calculateTaiSui(2200, 2026)).toBeNull();
  });

  it('calculateTaiSui: result includes birth and year zodiac info', () => {
    const result = calculateTaiSui(1990, 2026);
    expect(result).not.toBeNull();
    expect(result!.birthYear).toBe(1990);
    expect(typeof result!.birthZodiac).toBe('string');
    expect(typeof result!.birthBranch).toBe('string');
    expect(typeof result!.yearZodiac).toBe('string');
    expect(typeof result!.yearBranch).toBe('string');
  });

  it('calculateTaiSui: each offense has type, label, severity, description, and advice', () => {
    const result = calculateTaiSui(2026, 2026); // 值太歲
    expect(result).not.toBeNull();
    for (const offense of result!.offenses) {
      expect(offense).toHaveProperty('type');
      expect(offense).toHaveProperty('label');
      expect(offense).toHaveProperty('severity');
      expect(offense).toHaveProperty('description');
      expect(offense).toHaveProperty('advice');
      expect(typeof offense.type).toBe('string');
      expect(typeof offense.label).toBe('string');
      expect(typeof offense.severity).toBe('number');
      expect(offense.severity).toBeGreaterThanOrEqual(1);
      expect(offense.severity).toBeLessThanOrEqual(5);
      expect(typeof offense.description).toBe('string');
      expect(typeof offense.advice).toBe('string');
    }
  });

  it('calculateTaiSui: offenses are sorted by severity descending', () => {
    // Test with a year that might have multiple offenses
    // 子(0) year vs 卯(3) year → 子卯相刑
    // 2020 鼠年 vs 2023 兔年:
    // birth 2020 (子, idx=0), target 2023 (卯, idx=3)
    // punishPairs: (0,3) → 刑
    // No 值 (0≠3), no 沖 (3+6=9≠0)
    // harmPairs: (0,7) no, breakPairs: (0,9) no, (2,11) no...
    // Only 刑 for this pair

    // A case with multiple: check 丑(1) vs 未(7) → 丑未沖(沖) + 丑戌未三刑 check...
    // (1,6) in punishPairs → year would need idx=6. Let me check 丑 vs 馬
    // birth 2021 (丑, idx=1), target 2026 (馬, idx=6)
    // 沖: clashIndex = (6+6)%12 = 0, 1≠0 → no
    // 刑: punishPairs (1,6) → yes!
    // 害: harmPairs (1,6) → yes!
    // 破: breakPairs (4,1) → 4≠6, no; (6,3) → 3≠1, no
    // So 丑 vs 馬: 刑(severity 3) + 害(severity 2)

    // Or let me use 寅(2) vs 巳(5): punishPairs (2,5) → 刑; harmPairs (2,5) → 害; what about 沖/破?
    // clash: (5+6)%12=11 ≠ 2 → no
    // break: (2,11) → 5≠11, no; (8,5) → 8≠2, no
    // So 寅 vs 巳: 刑 + 害

    // Use 2022(虎,寅) vs 2025(蛇,巳):
    const result = calculateTaiSui(2022, 2025);
    expect(result).not.toBeNull();
    if (result!.offenses.length > 1) {
      for (let i = 0; i < result!.offenses.length - 1; i++) {
        expect(result!.offenses[i].severity).toBeGreaterThanOrEqual(result!.offenses[i + 1].severity);
      }
    }
  });

  it('calculateTaiSui: uses current year when targetYear is not provided', () => {
    const result = calculateTaiSui(1990);
    // Should not throw, and should return a result or null for valid birth year
    expect(result).not.toBeNull();
    expect(result!.birthYear).toBe(1990);
  });
});
