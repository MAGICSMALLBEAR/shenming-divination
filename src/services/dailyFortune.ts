// 每日運勢服務 — 依日期確定性生成，同天結果固定
// 融合五行、農曆月份給予更有文化感的數值

const DIRECTIONS = ['東', '南', '西', '北', '東南', '東北', '西南', '西北'];
const LUCKY_COLORS = [
  { name: '朱紅', hex: '#C0392B' }, { name: '琉璃藍', hex: '#2980B9' },
  { name: '翡翠綠', hex: '#27AE60' }, { name: '金黃', hex: '#F39C12' },
  { name: '紫羅蘭', hex: '#8E44AD' }, { name: '白玉', hex: '#BDC3C7' },
  { name: '棗紅', hex: '#922B21' }, { name: '青碧', hex: '#1ABC9C' },
];
const AUSPICIOUS_HOURS = ['子時(23-1)', '丑時(1-3)', '寅時(3-5)', '卯時(5-7)', '辰時(7-9)', '巳時(9-11)', '午時(11-13)', '未時(13-15)', '申時(15-17)', '酉時(17-19)', '戌時(19-21)', '亥時(21-23)'];
const AVOID_HOURS = ['子時', '丑時', '寅時', '卯時', '辰時', '巳時', '午時', '未時', '申時', '酉時', '戌時', '亥時'];

export interface DailyFortune {
  date: string;
  scores: {
    wealth: number;   // 1-5
    career: number;
    love: number;
    health: number;
    study: number;
  };
  overall: number;    // 1-5
  luckyColor: { name: string; hex: string };
  luckyDirection: string;
  luckyNumber: number;
  auspiciousHour: string;
  avoidHour: string;
  advice: string;
  wuxingToday: string;
}

// 日期 + 類別 → 穩定亂數
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function dateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function score(category: string): number {
  return (hash(`${dateKey()}-${category}`) % 5) + 1;
}

function pick<T>(arr: T[], category: string): T {
  return arr[hash(`${dateKey()}-${category}`) % arr.length];
}

const WUXING_CYCLE = ['木', '火', '土', '金', '水'];
const ADVICES: Record<string, string[]> = {
  good: [
    '諸事皆宜，可大膽行動，貴人自來。',
    '今日天時地利，謀事可成，宜把握良機。',
    '福星高照，凡事順遂，宜廣結善緣。',
  ],
  mid: [
    '宜守中道，不急不躁，平穩中求進。',
    '謀事前多思量，行事穩健方能致勝。',
    '今日平穩，宜積蓄力量，等待時機。',
  ],
  bad: [
    '今日諸事宜緩，靜守為上，避免衝動。',
    '小心謹慎，遇阻勿強行，靜待轉機。',
    '宜多行善事、廣積福德，助運化解。',
  ],
};

export function getDailyFortune(): DailyFortune {
  const dk = dateKey();
  const wealth  = score('wealth');
  const career  = score('career');
  const love    = score('love');
  const health  = score('health');
  const study   = score('study');
  const overall = Math.round((wealth + career + love + health + study) / 5);

  const advicePool = overall >= 4 ? ADVICES.good : overall >= 3 ? ADVICES.mid : ADVICES.bad;

  const d = new Date();
  const wuxingToday = WUXING_CYCLE[(d.getFullYear() + d.getMonth() + d.getDate()) % 5];

  return {
    date: dk,
    scores: { wealth, career, love, health, study },
    overall,
    luckyColor: pick(LUCKY_COLORS, 'color'),
    luckyDirection: pick(DIRECTIONS, 'direction'),
    luckyNumber: (hash(`${dk}-number`) % 9) + 1,
    auspiciousHour: pick(AUSPICIOUS_HOURS, 'auspicious'),
    avoidHour: pick(AVOID_HOURS, 'avoid'),
    advice: pick(advicePool, 'advice'),
    wuxingToday,
  };
}
