// 袁天罡稱骨算命 — 依出生年月日時計算骨重並對應歌訣

export interface BoneWeightResult {
  yearWeight: number;
  monthWeight: number;
  dayWeight: number;
  hourWeight: number;
  totalWeight: number;      // 單位：兩（含錢，如 4.2 = 四兩二錢）
  totalLabel: string;        // e.g. "四兩二錢"
  poem: string;              // 對應歌訣
  interpretation: string;    // 白話解釋
  fortune: '上上' | '上吉' | '中吉' | '中平' | '中下' | '下下';
}

/** 出生年骨重表（依農曆年分，以甲子年起算） */
const YEAR_WEIGHT: Record<number, number> = {
  // 甲子～癸酉 (1984-1993)
  1984: 1.2, 1985: 0.9, 1986: 1.6, 1987: 1.5, 1988: 0.8, 1989: 0.8,
  1990: 0.9, 1991: 1.2, 1992: 0.9, 1993: 0.8,
  // 甲戌～癸未 (1994-2003)
  1994: 1.5, 1995: 0.9, 1996: 1.6, 1997: 0.8, 1998: 0.8, 1999: 1.8,
  2000: 1.2, 2001: 1.6, 2002: 1.5, 2003: 0.7,
  // 甲申～癸巳 (2004-2013)
  2004: 0.5, 2005: 1.5, 2006: 1.6, 2007: 1.5, 2008: 0.8, 2009: 0.7,
  2010: 0.9, 2011: 1.2, 2012: 1.0, 2013: 0.7,
  // 甲午～癸卯 (2014-2023)
  2014: 1.5, 2015: 1.5, 2016: 0.8, 2017: 0.8, 2018: 1.9, 2019: 0.9,
  2020: 1.5, 2021: 1.2, 2022: 1.0, 2023: 0.7,
  // 甲辰～ (2024-)
  2024: 1.2, 2025: 0.7, 2026: 1.3, 2027: 0.6, 2028: 1.6, 2029: 0.8,
  // 涵蓋更早年份
  1974: 1.2, 1975: 0.8, 1976: 0.8, 1977: 1.6, 1978: 1.9, 1979: 0.6,
  1980: 0.8, 1981: 1.6, 1982: 1.0, 1983: 0.7,
  1964: 0.8, 1965: 1.5, 1966: 1.3, 1967: 0.7, 1968: 1.6, 1969: 0.8,
  1970: 0.9, 1971: 1.7, 1972: 0.5, 1973: 0.7,
  1954: 1.5, 1955: 0.6, 1956: 0.5, 1957: 1.4, 1958: 1.4, 1959: 0.9,
  1960: 0.7, 1961: 0.7, 1962: 0.9, 1963: 1.2,
};

/** 出生月骨重表（農曆月份，單位：錢 → 兩） */
const MONTH_WEIGHT: Record<number, number> = {
  1: 0.6, 2: 0.7, 3: 1.8, 4: 0.9, 5: 0.5, 6: 1.6,
  7: 0.9, 8: 1.5, 9: 1.8, 10: 0.8, 11: 0.9, 12: 0.5,
};

/** 出生日骨重表（農曆日，單位：錢 → 兩） */
const DAY_WEIGHT: Record<number, number> = {
  1: 0.5, 2: 0.7, 3: 0.5, 4: 1.5, 5: 1.6, 6: 1.5, 7: 0.8, 8: 1.6,
  9: 0.8, 10: 1.6, 11: 0.9, 12: 1.7, 13: 0.8, 14: 1.7, 15: 1.0,
  16: 0.8, 17: 0.9, 18: 1.8, 19: 0.5, 20: 1.5, 21: 1.0, 22: 0.9,
  23: 0.8, 24: 0.9, 25: 1.5, 26: 1.8, 27: 0.7, 28: 0.8, 29: 1.6, 30: 0.6,
};

/** 出生時辰骨重表（古代時辰，單位：錢 → 兩） */
const HOUR_WEIGHT: Record<number, number> = {
  // 子 23-01, 丑 01-03, 寅 03-05, 卯 05-07, 辰 07-09, 巳 09-11
  // 午 11-13, 未 13-15, 申 15-17, 酉 17-19, 戌 19-21, 亥 21-23
  0: 1.6, 1: 1.0, 2: 0.6, 3: 0.7, 4: 1.0, 5: 0.9,
  6: 1.6, 7: 1.0, 8: 0.8, 9: 0.8, 10: 0.9, 11: 0.6,
};

/** 將小時轉為時辰索引 (0=子, 1=丑, ... 11=亥) */
function hourToShichen(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

function weightToLabel(total: number): string {
  const liang = Math.floor(total);
  const qian = Math.round((total - liang) * 10);
  if (qian === 0) return `${liang}兩`;
  return `${liang}兩${qian}錢`;
}

/** 稱骨歌訣對照表 */
function getSong(totalWeight: number): { poem: string; interpretation: string; fortune: BoneWeightResult['fortune'] } {
  const t = totalWeight;
  if (t <= 2.1) return { poem: '短命非業謂大凶，平生災難事重重。凶禍頻臨陷逆境，終世困苦事難成。', interpretation: '此命終身困苦，災難重重，宜多積德修身。', fortune: '下下' };
  if (t <= 2.5) return { poem: '此命推來事不同，為人能幹異凡庸。中年還有逍遙福，不比前時運未通。', interpretation: '先苦後甘之命，中年漸入佳境，宜耐心耕耘。', fortune: '中平' };
  if (t <= 2.9) return { poem: '初年運蹇事難謀，漸有財源如水流。到得中年衣食旺，那時名利一齊收。', interpretation: '早年困頓，中年後財運漸佳，名利雙收。', fortune: '中吉' };
  if (t <= 3.2) return { poem: '為人多才又多能，出外求謀事可成。有人敬重多安穩，到處自然有名聲。', interpretation: '多才之人，外出發展有利，受人敬重。', fortune: '中吉' };
  if (t <= 3.5) return { poem: '早年做事事難成，百計徒勞枉費心。半世自如流水去，後來運到得黃金。', interpretation: '早年徒勞，後半生運勢轉好，終有所成。', fortune: '中平' };
  if (t <= 3.8) return { poem: '平生命運似何如，財祿由來不必圖。自有貴人相助力，家門和順福常居。', interpretation: '一生平順，貴人相助，家庭和睦有福。', fortune: '上吉' };
  if (t <= 4.2) return { poem: '此命推來事不同，一身骨肉最清高。早入黌門姓名標，待看年將三十六。藍袍脫去換紅袍。', interpretation: '清高之命，早年即有文名，中年事業更上層樓。', fortune: '上吉' };
  if (t <= 4.5) return { poem: '為人心性最聰明，作事軒昂近貴人。衣祿一生天註定，不須勞碌是豐亨。', interpretation: '聰明伶俐，天生富貴，不需過度勞碌即能豐衣足食。', fortune: '上上' };
  if (t <= 4.8) return { poem: '萬事由天莫苦求，須知福祿賴人修。當年財帛難如意，晚景欣然便不憂。', interpretation: '早年財運平平，晚年享福，凡事不宜強求。', fortune: '中吉' };
  if (t <= 5.2) return { poem: '此命推來敬重雙親，有福有祿。氣質高昂，少年勤學有功名。忠實待人，中運發達，晚景安穩。', interpretation: '敬重長輩，少年有成，中年發達，晚年安穩的福命。', fortune: '上上' };
  if (t <= 5.5) return { poem: '此命生成與眾殊，紫袍玉帶耀門閭。榮華富貴誰能及，萬事皆成福有餘。', interpretation: '大富大貴之命，萬事有成，福氣綿長。', fortune: '上上' };
  if (t <= 6.0) return { poem: '一世亨通事事能，不勞心智自安然。宗族光輝添福祿，家門喜氣集千般。', interpretation: '一生亨通，事事順遂，家門興旺福祿雙全。', fortune: '上上' };
  return { poem: '此格推來禮義通，一生福祿用無窮。甜酸苦辣皆嘗過，滾滾財源穩且豐。', interpretation: '禮義通達，一生福祿無窮，先苦後甜財源滾滾。', fortune: '上吉' };
}

export function calculateBoneWeight(
  birthYear: number,
  birthMonth: number,   // 農曆月 1-12
  birthDay: number,     // 農曆日 1-30
  birthHour: number,    // 0-23
): BoneWeightResult | null {
  const yw = YEAR_WEIGHT[birthYear];
  if (yw === undefined) return null;

  const mw = MONTH_WEIGHT[birthMonth];
  const dw = DAY_WEIGHT[birthDay];
  const shichen = hourToShichen(birthHour);
  const hw = HOUR_WEIGHT[shichen];

  if (mw === undefined || dw === undefined || hw === undefined) return null;

  const total = yw + mw + dw + hw;
  const totalRounded = Math.round(total * 10) / 10;
  const song = getSong(totalRounded);

  return {
    yearWeight: yw,
    monthWeight: mw,
    dayWeight: dw,
    hourWeight: hw,
    totalWeight: totalRounded,
    totalLabel: weightToLabel(totalRounded),
    poem: song.poem,
    interpretation: song.interpretation,
    fortune: song.fortune,
  };
}
