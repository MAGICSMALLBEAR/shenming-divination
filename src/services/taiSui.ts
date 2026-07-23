// 犯太歲計算 — 依出生年份判斷當年是否犯太歲（值/沖/刑/害/破）
// 太歲規則：以當年地支與本命地支比對

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const ZODIACS  = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const;
const EMOJIS   = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'] as const;

export type TaiSuiType = '值' | '沖' | '刑' | '害' | '破';

export interface TaiSuiOffense {
  type: TaiSuiType;
  label: string;
  severity: number;    // 1-5, 5 最重
  description: string;
  advice: string;
}

export interface TaiSuiResult {
  birthYear: number;
  birthZodiac: string;
  birthBranch: string;
  yearZodiac: string;
  yearBranch: string;
  offenses: TaiSuiOffense[];
  isSafe: boolean;
}

/** 計算某出生年相對目標年的犯太歲狀況 */
export function calculateTaiSui(birthYear: number, targetYear?: number): TaiSuiResult | null {
  if (birthYear < 1900 || birthYear > 2100) return null;

  const year = targetYear ?? new Date().getFullYear();
  const birthIdx = ((birthYear - 4) % 12 + 12) % 12;
  const yearIdx  = ((year - 4) % 12 + 12) % 12;

  const birthZodiac = ZODIACS[birthIdx];
  const yearZodiac  = ZODIACS[yearIdx];
  const birthBranch = BRANCHES[birthIdx];
  const yearBranch  = BRANCHES[yearIdx];

  const offenses: TaiSuiOffense[] = [];

  // 值太歲（同地支）
  if (birthIdx === yearIdx) {
    offenses.push({
      type: '值', label: '值太歲', severity: 5,
      description: `生肖屬${birthZodiac}者${year}年坐犯太歲，當年運勢起伏較大，凡事宜低調謹慎。`,
      advice: `建議年初至廟宇安太歲，行事多加小心，重大決定宜再三思量。`,
    });
  }

  // 沖太歲（地支六沖：子午/丑未/寅申/卯酉/辰戌/巳亥）
  const clashIndex = (yearIdx + 6) % 12;
  if (birthIdx === clashIndex) {
    offenses.push({
      type: '沖', label: '沖太歲', severity: 4,
      description: `生肖屬${birthZodiac}者${year}年正沖太歲，變動較大，易有遷移、轉職、感情變化等。`,
      advice: `適合以靜制動，避免衝動決定。可安奉太歲祈求平安。`,
    });
  }

  // 刑太歲
  const punishPairs: [number, number][] = [
    [0, 3],  // 子卯互刑
    [2, 5], [2, 8], [5, 8], // 寅巳申三刑
    [1, 6], [1, 8], [6, 8], // 丑戌未三刑
  ];
  // 自刑：辰/午/酉/亥
  const selfPunish = [4, 6, 9, 11];
  const isPunished =
    selfPunish.includes(birthIdx) && birthIdx === yearIdx ||
    punishPairs.some(([a, b]) =>
      (birthIdx === a && yearIdx === b) || (birthIdx === b && yearIdx === a)
    );
  if (isPunished) {
    offenses.push({
      type: '刑', label: '刑太歲', severity: 3,
      description: `生肖屬${birthZodiac}者${year}年犯刑太歲，易有口舌是非、小人困擾或合約糾紛。`,
      advice: `注意言行，避免捲入是非。文件合約多核對細節。`,
    });
  }

  // 害太歲（地支六害：子未/丑午/寅巳/卯辰/申亥/酉戌）
  const harmPairs: [number, number][] = [[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
  const isHarmed = harmPairs.some(([a, b]) =>
    (birthIdx === a && yearIdx === b) || (birthIdx === b && yearIdx === a)
  );
  if (isHarmed) {
    offenses.push({
      type: '害', label: '害太歲', severity: 2,
      description: `生肖屬${birthZodiac}者${year}年犯害太歲，易有暗中小人、背後是非或人際誤解。`,
      advice: `待人處事多留一分餘地，重要約定以書面為憑。`,
    });
  }

  // 破太歲（地支六破：子酉/寅亥/辰丑/午卯/申巳/戌未）
  const breakPairs: [number, number][] = [[0,9],[2,11],[4,1],[6,3],[8,5],[10,7]];
  const isBroken = breakPairs.some(([a, b]) =>
    (birthIdx === a && yearIdx === b) || (birthIdx === b && yearIdx === a)
  );
  if (isBroken) {
    offenses.push({
      type: '破', label: '破太歲', severity: 2,
      description: `生肖屬${birthZodiac}者${year}年犯破太歲，易有計劃受阻、合作破局或財物損失。`,
      advice: `凡事預留備案，不宜孤注一擲。`,
    });
  }

  return {
    birthYear,
    birthZodiac,
    birthBranch,
    yearZodiac,
    yearBranch,
    offenses: offenses.sort((a, b) => b.severity - a.severity),
    isSafe: offenses.length === 0,
  };
}

/** 取得當前年份資訊（for display） */
export function getCurrentYearInfo(year?: number) {
  const y = year ?? new Date().getFullYear();
  const idx = ((y - 4) % 12 + 12) % 12;
  const stemIdx = ((y - 4) % 10 + 10) % 10;
  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return {
    year: y,
    ganzhi: `${STEMS[stemIdx]}${BRANCHES[idx]}`,
    zodiac: ZODIACS[idx],
    emoji: EMOJIS[idx],
    branch: BRANCHES[idx],
  };
}
