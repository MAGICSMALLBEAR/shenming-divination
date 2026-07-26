// 風水羅盤 — 方位與卦象對應、吉凶解析、每日推薦方位
// 根據 heading (0-360度) 回傳對應的八卦、五行、吉凶、宜忌

export interface DirectionResult {
  /** 方位名稱（北、東北、東...） */
  direction: string;
  /** 方位角度 (heading) */
  heading: number;
  /** 八卦卦名 */
  bagua: string;
  /** 卦象符號 */
  baguaSymbol: string;
  /** 五行屬性 */
  element: string;
  /** 吉凶等級 */
  fortune: string;
  /** 吉凶類別（用於顯示底色） */
  fortuneType: 'great' | 'good' | 'neutral';
  /** 適宜事項 */
  suitable: string;
  /** 禁忌事項 */
  avoid: string;
  /** 方位描述 */
  description: string;
}

/** 每日推薦方位結果 */
export interface DailyDirection extends DirectionResult {
  reason: string;
}

/** 八方定義 */
const EIGHT_DIRECTIONS = [
  {
    name: '北',
    range: [337.5, 360, 0, 22.5] as number[],
    bagua: '坎',
    baguaSymbol: '☵',
    element: '水',
    fortune: '中吉',
    fortuneType: 'neutral' as const,
    suitable: '宜靜守',
    avoid: '忌躁進',
    description: '坎為水，象徵險陷，宜沉穩內斂，靜待時機。',
  },
  {
    name: '東北',
    range: [22.5, 67.5],
    bagua: '艮',
    baguaSymbol: '☶',
    element: '土',
    fortune: '吉',
    fortuneType: 'good' as const,
    suitable: '宜積累',
    avoid: '忌變動',
    description: '艮為山，象徵靜止，宜厚積薄發，穩健前行。',
  },
  {
    name: '東',
    range: [67.5, 112.5],
    bagua: '震',
    baguaSymbol: '☳',
    element: '木',
    fortune: '大吉',
    fortuneType: 'great' as const,
    suitable: '宜出發',
    avoid: '忌停滯',
    description: '震為雷，象徵行動，宜積極進取，把握時機。',
  },
  {
    name: '東南',
    range: [112.5, 157.5],
    bagua: '巽',
    baguaSymbol: '☴',
    element: '木',
    fortune: '吉',
    fortuneType: 'good' as const,
    suitable: '宜溝通',
    avoid: '忌固執',
    description: '巽為風，象徵柔順，宜靈活變通，善用溝通。',
  },
  {
    name: '南',
    range: [157.5, 202.5],
    bagua: '離',
    baguaSymbol: '☲',
    element: '火',
    fortune: '中平',
    fortuneType: 'neutral' as const,
    suitable: '宜明亮',
    avoid: '忌暗昧',
    description: '離為火，象徵光明，宜光明磊落，坦蕩行事。',
  },
  {
    name: '西南',
    range: [202.5, 247.5],
    bagua: '坤',
    baguaSymbol: '☷',
    element: '土',
    fortune: '大吉',
    fortuneType: 'great' as const,
    suitable: '宜包容',
    avoid: '忌自我',
    description: '坤為地，象徵柔順包容，宜厚德載物，以大度待人。',
  },
  {
    name: '西',
    range: [247.5, 292.5],
    bagua: '兌',
    baguaSymbol: '☱',
    element: '金',
    fortune: '吉',
    fortuneType: 'good' as const,
    suitable: '宜收穫',
    avoid: '忌貪心',
    description: '兌為澤，象徵喜悅，宜享受成果，知足常樂。',
  },
  {
    name: '西北',
    range: [292.5, 337.5],
    bagua: '乾',
    baguaSymbol: '☰',
    element: '金',
    fortune: '中吉',
    fortuneType: 'neutral' as const,
    suitable: '宜領導',
    avoid: '忌獨斷',
    description: '乾為天，象徵剛健，宜身先士卒，廣納眾議。',
  },
];

/**
 * 根據 heading 角度（0-360）取得對應方位資訊
 * 北為 0 度（或 360），順時針遞增
 */
export function getDirection(heading: number): DirectionResult {
  // 正規化角度到 0-360
  let h = heading % 360;
  if (h < 0) h += 360;

  // 找對應方位（北的範圍跨 0 度，需特殊處理）
  for (const dir of EIGHT_DIRECTIONS) {
    if (dir.range.length === 4) {
      // 跨 0 度的方位（北）：337.5-360 或 0-22.5
      if (h >= dir.range[0] || h < dir.range[3]) {
        return {
          direction: dir.name,
          heading: h,
          bagua: dir.bagua,
          baguaSymbol: dir.baguaSymbol,
          element: dir.element,
          fortune: dir.fortune,
          fortuneType: dir.fortuneType,
          suitable: dir.suitable,
          avoid: dir.avoid,
          description: dir.description,
        };
      }
    } else {
      // 一般方位
      if (h >= dir.range[0] && h < dir.range[1]) {
        return {
          direction: dir.name,
          heading: h,
          bagua: dir.bagua,
          baguaSymbol: dir.baguaSymbol,
          element: dir.element,
          fortune: dir.fortune,
          fortuneType: dir.fortuneType,
          suitable: dir.suitable,
          avoid: dir.avoid,
          description: dir.description,
        };
      }
    }
  }

  // fallback（不應抵達）
  const d = EIGHT_DIRECTIONS[0];
  return {
    direction: d.name,
    heading: h,
    bagua: d.bagua,
    baguaSymbol: d.baguaSymbol,
    element: d.element,
    fortune: d.fortune,
    fortuneType: d.fortuneType,
    suitable: d.suitable,
    avoid: d.avoid,
    description: d.description,
  };
}

/**
 * 每日財位／推薦方位：依日期計算
 * 使用農曆概念簡化：以該年第一天起算的天數模 8 決定方位
 */
export function getDailyDirection(date?: Date): DailyDirection {
  const d = date ?? new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 使用天數與年分組合，產生每日輪轉的推薦方位
  const index = (dayOfYear + d.getFullYear()) % 8;
  const dir = EIGHT_DIRECTIONS[index];

  const reasons = [
    `今日歲星臨${dir.name}方，旺氣匯聚，面向此方位行事可得天時之助。`,
    `本日${dir.element}氣當令，${dir.name}方正得時運，宜多加運用。`,
    `${dir.bagua}卦今日值位，${dir.name}方有貴人氣，適合朝此方向布局。`,
    `今日${dir.element}行運暢旺，${dir.name}方為財氣入口，利於求財納福。`,
    `天星吉曜今聚${dir.name}方，${dir.bagua}卦應時而旺，宜朝此方祈福。`,
    `本日時辰與${dir.name}方相合，${dir.element}氣流通，諸事順遂。`,
    `今日${dir.bagua}卦當值，${dir.name}方${dir.element}氣飽滿，為本日吉方。`,
    `歲運今至${dir.name}方，${dir.element}氣生旺，面向此方可助運勢提升。`,
  ];

  return {
    ...getDirection(index * 45), // 取該方位中心角度
    reason: reasons[index % reasons.length],
  };
}

/** 取得所有八方位列表（用於羅盤標記） */
export function getAllDirections(): DirectionResult[] {
  return EIGHT_DIRECTIONS.map((d, i) => {
    const midAngle = d.range.length === 4 ? 0 : (d.range[0] + d.range[1]) / 2;
    return {
      direction: d.name,
      heading: midAngle,
      bagua: d.bagua,
      baguaSymbol: d.baguaSymbol,
      element: d.element,
      fortune: d.fortune,
      fortuneType: d.fortuneType,
      suitable: d.suitable,
      avoid: d.avoid,
      description: d.description,
    };
  });
}

/** 八卦符號對應表 */
export const BAGUA_SYMBOLS: Record<string, string> = {
  '坎': '☵',
  '艮': '☶',
  '震': '☳',
  '巽': '☴',
  '離': '☲',
  '坤': '☷',
  '兌': '☱',
  '乾': '☰',
};
