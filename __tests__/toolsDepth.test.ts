/**
 * 單元測試：週邊命理與互動小工具深度升級
 * 涵蓋紫微斗數排盤引擎、易經六爻動爻變卦推演、塔羅多牌陣正逆位、廟宇香火熱度與社群靈驗心得
 */
import {
  calculateZiweiChart,
  STEMS,
  BRANCHES,
  PALACE_NAMES,
} from '../src/services/ziweiEngine';
import {
  tossCoins,
  findHexagramByLines,
  castIChing,
} from '../src/data/ichingAdv';
import {
  TAROT_SPREADS,
  drawTarotSpread,
  REVERSED_INTERPRETATIONS,
} from '../src/data/tarotSpreads';
import {
  calculateIncenseHeat,
  getCuratedReviews,
  CURATED_TEMPLE_REVIEWS,
} from '../src/data/templeCommunity';

describe('紫微斗數排盤引擎 (ziweiEngine)', () => {
  test('應能成功排盤並產生十二宮位與基本盤面結構', () => {
    // 測試：1990年(庚午) 農曆 5月 15日 辰時 (hourBranchIndex = 4)
    const chart = calculateZiweiChart(1990, 5, 15, 4);

    expect(chart.lunarYear).toBe(1990);
    expect(chart.lunarMonth).toBe(5);
    expect(chart.lunarDay).toBe(15);
    expect(chart.stem).toBe('庚');
    expect(chart.branch).toBe('午');
    expect(chart.ganZhi).toBe('庚午');

    // 命宮與身宮應為有效十二地支
    expect(BRANCHES).toContain(chart.mingBranch);
    expect(BRANCHES).toContain(chart.shenBranch);

    // 五行局應為五局之一
    expect(['水二局', '木三局', '金四局', '土五局', '火六局']).toContain(chart.bureau.name);

    // 十二宮完整性驗證
    expect(chart.palaces).toHaveLength(12);
    chart.palaces.forEach((palace, i) => {
      expect(palace.index).toBe(i);
      expect(PALACE_NAMES).toContain(palace.name);
      expect(BRANCHES).toContain(palace.branch);
      expect(STEMS).toContain(palace.stem);
      expect(typeof palace.summary).toBe('string');
      expect(typeof palace.advice).toBe('string');
    });

    // 命宮主星與生年四化驗證
    expect(chart.fourTransformations).toHaveProperty('lu');
    expect(chart.fourTransformations).toHaveProperty('quan');
    expect(chart.fourTransformations).toHaveProperty('ke');
    expect(chart.fourTransformations).toHaveProperty('ji');

    // 庚年生人四化：太陽化祿、武曲化權、太陰化科、天同化忌
    expect(chart.fourTransformations.lu.star).toBe('太陽');
    expect(chart.fourTransformations.quan.star).toBe('武曲');
    expect(chart.fourTransformations.ke.star).toBe('太陰');
    expect(chart.fourTransformations.ji.star).toBe('天同');

    // 一生格局大綱總覽應包含關鍵指引
    expect(chart.overview.destinyPattern).toContain(chart.bureau.name);
    expect(chart.overview.lifeTheme).toContain('庚午');
    expect(chart.overview.careerGuidance).toBeTruthy();
    expect(chart.overview.wealthGuidance).toBeTruthy();
  });

  test('甲年與乙年生人四化應符合傳統紫微訣法', () => {
    // 甲年：廉貞化祿、破軍化權、武曲化科、太陽化忌
    const jiaChart = calculateZiweiChart(1984, 1, 1, 0); // 甲子年
    expect(jiaChart.stem).toBe('甲');
    expect(jiaChart.fourTransformations.lu.star).toBe('廉貞');
    expect(jiaChart.fourTransformations.quan.star).toBe('破軍');
    expect(jiaChart.fourTransformations.ke.star).toBe('武曲');
    expect(jiaChart.fourTransformations.ji.star).toBe('太陽');

    // 乙年：天機化祿、天梁化權、紫微化科、太陰化忌
    const yiChart = calculateZiweiChart(1985, 6, 18, 6); // 乙丑年
    expect(yiChart.stem).toBe('乙');
    expect(yiChart.fourTransformations.lu.star).toBe('天機');
    expect(yiChart.fourTransformations.quan.star).toBe('天梁');
    expect(yiChart.fourTransformations.ke.star).toBe('紫微');
    expect(yiChart.fourTransformations.ji.star).toBe('太陰');
  });

  test('十四主星與輔煞星應均勻落入盤中', () => {
    const chart = calculateZiweiChart(1995, 8, 20, 2);
    const allMainStars = chart.palaces.flatMap((p) => p.mainStars.map((s) => s.name));
    // 14 顆主星必須全部出現
    const requiredStars = [
      '紫微', '天機', '太陽', '武曲', '天同', '廉貞',
      '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
    ];
    requiredStars.forEach((star) => {
      expect(allMainStars).toContain(star);
    });
  });
});

describe('易經六爻動爻與變卦演算法 (ichingAdv)', () => {
  test('tossCoins 單次模擬結果應在 6 到 9 之間', () => {
    for (let i = 0; i < 20; i++) {
      const toss = tossCoins();
      expect([6, 7, 8, 9]).toContain(toss.value);
      expect(toss.coins).toHaveLength(3);
      toss.coins.forEach((c) => {
        expect([2, 3]).toContain(c);
      });
      expect(toss.coins[0] + toss.coins[1] + toss.coins[2]).toBe(toss.value);
    }
  });

  test('findHexagramByLines 應正確查找六十四卦', () => {
    // 全陽 (乾為天: 第 1 卦)
    const qian = findHexagramByLines([true, true, true, true, true, true]);
    expect(qian.number).toBe(1);
    expect(qian.name).toBe('乾');

    // 全陰 (坤為地: 第 2 卦)
    const kun = findHexagramByLines([false, false, false, false, false, false]);
    expect(kun.number).toBe(2);
    expect(kun.name).toBe('坤');
  });

  test('castIChing 起卦應產出六爻、本卦與變卦斷事推演', () => {
    const result = castIChing();
    expect(result.lines).toHaveLength(6);
    expect(result.primaryHexagram).toBeDefined();
    expect(typeof result.overallVerdict).toBe('string');
    expect(result.overallVerdict.length).toBeGreaterThan(10);

    // 檢查初爻到上爻位置名稱
    expect(result.lines[0].positionName).toBe('初爻');
    expect(result.lines[5].positionName).toBe('上爻');

    // 動爻變化一致性：如果有動爻，變卦必須存在
    if (result.movingLineIndices.length > 0) {
      expect(result.changedHexagram).not.toBeNull();
      expect(result.movingLineSummary).toContain('動爻發動');
    } else {
      expect(result.changedHexagram).toBeNull();
      expect(result.movingLineSummary).toContain('無動爻');
    }
  });
});

describe('塔羅多牌陣與正逆位系統 (tarotSpreads)', () => {
  test('三種牌陣配置應齊全且位置數量對應正確', () => {
    expect(TAROT_SPREADS.single.cardCount).toBe(1);
    expect(TAROT_SPREADS.single.positions).toHaveLength(1);

    expect(TAROT_SPREADS['three-time'].cardCount).toBe(3);
    expect(TAROT_SPREADS['three-time'].positions).toHaveLength(3);

    expect(TAROT_SPREADS['holy-triangle'].cardCount).toBe(3);
    expect(TAROT_SPREADS['holy-triangle'].positions).toHaveLength(3);
  });

  test('drawTarotSpread 單張抽牌應回傳 1 張牌且附帶正逆位與行動指引', () => {
    const drawn = drawTarotSpread('single');
    expect(drawn).toHaveLength(1);
    const item = drawn[0];
    expect(item.card).toBeDefined();
    expect(typeof item.isReversed).toBe('boolean');
    expect(item.position.name).toBe('當下核心啟發');
    expect(item.interpretation.length).toBeGreaterThan(0);
    expect(item.actionGuidance.length).toBeGreaterThan(0);
  });

  test('drawTarotSpread 三牌陣抽牌不應有重複卡牌', () => {
    const drawn = drawTarotSpread('three-time');
    expect(drawn).toHaveLength(3);
    const cardNumbers = drawn.map((d) => d.card.number);
    const uniqueNumbers = new Set(cardNumbers);
    expect(uniqueNumbers.size).toBe(3);

    expect(drawn[0].position.name).toBe('過去因由');
    expect(drawn[1].position.name).toBe('當前處境');
    expect(drawn[2].position.name).toBe('未來趨勢');
  });

  test('REVERSED_INTERPRETATIONS 應包含全部 22 張大阿爾克那之逆位解義', () => {
    for (let i = 0; i <= 21; i++) {
      expect(REVERSED_INTERPRETATIONS[i]).toBeDefined();
      expect(REVERSED_INTERPRETATIONS[i].reversedMeaning).toBeTruthy();
      expect(REVERSED_INTERPRETATIONS[i].reversedAdvice).toBeTruthy();
    }
  });
});

describe('廟宇即時香火與靈驗社群 (templeCommunity)', () => {
  test('calculateIncenseHeat 應傳回正確的香火熱度等級與避峰建議', () => {
    const info = calculateIncenseHeat('xingtiangong_taipei');
    expect(['blazing', 'bustling', 'serene']).toContain(info.level);
    expect(info.crowdIndex).toBeGreaterThanOrEqual(0);
    expect(info.crowdIndex).toBeLessThanOrEqual(100);
    expect(info.flameIcon).toBeTruthy();
    expect(info.heatLabel).toBeTruthy();
    expect(info.recommendedHours).toBeTruthy();
  });

  test('大廟在不同時段之人流熱度計算符合規律', () => {
    // 平日尖峰時段 11 點 vs 清晨時段 5 點
    const peakInfo = calculateIncenseHeat('longshan_taipei', 11, 2);
    const morningInfo = calculateIncenseHeat('longshan_taipei', 5, 2);

    expect(peakInfo.crowdIndex).toBeGreaterThan(morningInfo.crowdIndex);
  });

  test('getCuratedReviews 應能查詢台灣代表性廟宇之靈驗事蹟', () => {
    const xtgReviews = getCuratedReviews('xingtiangong_taipei');
    expect(xtgReviews.length).toBeGreaterThanOrEqual(1);
    expect(xtgReviews[0].author).toContain('信士');
    expect(xtgReviews[0].tag).toBeTruthy();
    expect(xtgReviews[0].likes).toBeGreaterThan(0);
    expect(xtgReviews[0].text).toBeTruthy();

    const lsReviews = getCuratedReviews('longshan_taipei');
    expect(lsReviews.length).toBeGreaterThanOrEqual(1);

    // 未知廟宇應回傳通用心得備用庫，確保 UI 不空白
    const unknownReviews = getCuratedReviews('unknown_temple_xyz');
    expect(unknownReviews.length).toBeGreaterThanOrEqual(1);
    expect(unknownReviews[0].templeId).toBe('generic');
  });

  test('CURATED_TEMPLE_REVIEWS 靈驗心得資料結構完整', () => {
    Object.entries(CURATED_TEMPLE_REVIEWS).forEach(([templeId, list]) => {
      expect(typeof templeId).toBe('string');
      list.forEach((review) => {
        expect(review.id).toBeTruthy();
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.author).toBeTruthy();
        expect(review.tag).toBeTruthy();
        expect(review.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });
});
