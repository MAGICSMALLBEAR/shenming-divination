// 每日運勢服務 — 依日期確定性生成，同天結果固定
// 支援依生肖/五行個人化調整

import type { BaziInfo } from './bazi';

// ─── 靜態資料 ──────────────────────────────────────────────────
const DIRECTIONS = ['東', '南', '西', '北', '東南', '東北', '西南', '西北'];
const LUCKY_COLORS = [
  { name: '朱紅', hex: '#C0392B' }, { name: '琉璃藍', hex: '#2980B9' },
  { name: '翡翠綠', hex: '#27AE60' }, { name: '金黃', hex: '#F39C12' },
  { name: '紫羅蘭', hex: '#8E44AD' }, { name: '白玉', hex: '#BDC3C7' },
  { name: '棗紅', hex: '#922B21' }, { name: '青碧', hex: '#1ABC9C' },
];
const AUSPICIOUS_HOURS = [
  '子時(23-1)', '丑時(1-3)', '寅時(3-5)', '卯時(5-7)',
  '辰時(7-9)', '巳時(9-11)', '午時(11-13)', '未時(13-15)',
  '申時(15-17)', '酉時(17-19)', '戌時(19-21)', '亥時(21-23)',
];
const AVOID_HOURS = [
  '子時', '丑時', '寅時', '卯時', '辰時', '巳時',
  '午時', '未時', '申時', '酉時', '戌時', '亥時',
];

// 五行循環（以日期推算今日五行）
const WUXING_CYCLE = ['木', '火', '土', '金', '水'] as const;
type Wuxing = typeof WUXING_CYCLE[number];

// 相生：key 生 value
const GENERATES: Record<Wuxing, Wuxing> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};
// 相克：key 克 value
const CONTROLS: Record<Wuxing, Wuxing> = {
  木: '土', 火: '金', 土: '水', 水: '火', 金: '木',
};

// 每個五行對哪些分數有優勢（相生時加強的面向）
const WUXING_AFFINITY: Record<Wuxing, Array<keyof ScoreSet>> = {
  木: ['career', 'study'],
  火: ['love', 'career'],
  土: ['health', 'wealth'],
  金: ['wealth', 'study'],
  水: ['love', 'health'],
};

// 生肖特定每日建議
const ZODIAC_TIPS: Record<string, { good: string; mid: string; bad: string }> = {
  鼠: { good: '屬鼠者今日貴人運旺，主動出擊事半功倍。', mid: '屬鼠者宜靈活應變，不拘泥於舊法。', bad: '屬鼠者今日宜低調，避免與人正面衝突。' },
  牛: { good: '屬牛者今日財運亨通，努力必有豐收。', mid: '屬牛者按部就班，穩紮穩打最有利。', bad: '屬牛者宜忍耐，切勿急躁做決定。' },
  虎: { good: '屬虎者今日氣勢如虹，領導力出眾。', mid: '屬虎者收斂鋒芒，觀察時機再行動。', bad: '屬虎者今日易衝動，三思而後行。' },
  兔: { good: '屬兔者今日人緣極佳，合作談判有利。', mid: '屬兔者以柔克剛，和氣生財。', bad: '屬兔者小心口舌是非，少說多做。' },
  龍: { good: '屬龍者今日龍氣旺盛，事業運達頂峰。', mid: '屬龍者守住既有成果，徐圖進展。', bad: '屬龍者今日宜謙遜，避免獨斷獨行。' },
  蛇: { good: '屬蛇者今日智慧大開，謀略無往不利。', mid: '屬蛇者以智取勝，不宜正面硬拼。', bad: '屬蛇者今日多疑易誤事，信任身邊的人。' },
  馬: { good: '屬馬者今日奔騰四方，行動力最強。', mid: '屬馬者保持動力，但別忘了休息。', bad: '屬馬者今日緩行，躁進反而誤事。' },
  羊: { good: '屬羊者今日溫潤得人緣，貴人相助。', mid: '屬羊者以誠感人，凡事真誠以對。', bad: '屬羊者今日敏感，勿鑽牛角尖。' },
  猴: { good: '屬猴者今日才思敏捷，創意解決問題。', mid: '屬猴者靈活但勿浮躁，深思熟慮。', bad: '屬猴者今日易分心，專注最重要的事。' },
  雞: { good: '屬雞者今日條理分明，效率最高。', mid: '屬雞者按計畫行事，勿貪多求快。', bad: '屬雞者今日宜放下完美主義，量力而為。' },
  狗: { good: '屬狗者今日忠誠受信任，合作大吉。', mid: '屬狗者守望相助，有付出才有收穫。', bad: '屬狗者今日多慮，放寬心才能看清方向。' },
  豬: { good: '屬豬者今日福氣充盈，財運自然而來。', mid: '屬豬者知足常樂，量入為出。', bad: '屬豬者今日宜節制，避免過度消費或縱慾。' },
};

// ─── 介面 ──────────────────────────────────────────────────────
interface ScoreSet {
  wealth: number;
  career: number;
  love: number;
  health: number;
  study: number;
}

export interface DailyFortune {
  date: string;
  scores: ScoreSet;
  overall: number;         // 1-5
  luckyColor: { name: string; hex: string };
  luckyDirection: string;
  luckyNumber: number;
  auspiciousHour: string;
  avoidHour: string;
  advice: string;
  wuxingToday: Wuxing;
  // 個人化欄位（有生辰時才有值）
  zodiac?: string;
  zodiacEmoji?: string;
  userWuxing?: Wuxing;
  wuxingRelation?: '今日生我' | '我生今日' | '今日克我' | '我克今日' | '同行' | '無關';
  isPersonalized: boolean;
}

// ─── 工具函式 ──────────────────────────────────────────────────
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

function baseScore(category: string): number {
  return (hash(`${dateKey()}-${category}`) % 5) + 1;
}

function pick<T>(arr: readonly T[], category: string): T {
  return arr[hash(`${dateKey()}-${category}`) % arr.length];
}

function todayWuxing(): Wuxing {
  const d = new Date();
  // 以 2000-01-01 為基準（甲子日，木），每天循環
  const ref = new Date(2000, 0, 1);
  const daysDiff = Math.floor((d.getTime() - ref.getTime()) / 86400000);
  return WUXING_CYCLE[((daysDiff % 5) + 5) % 5];
}

function getRelation(userWuxing: Wuxing, dayWuxing: Wuxing): DailyFortune['wuxingRelation'] {
  if (dayWuxing === userWuxing) return '同行';
  if (GENERATES[dayWuxing] === userWuxing) return '今日生我';
  if (GENERATES[userWuxing] === dayWuxing) return '我生今日';
  if (CONTROLS[dayWuxing] === userWuxing) return '今日克我';
  if (CONTROLS[userWuxing] === dayWuxing) return '我克今日';
  return '無關';
}

function clamp(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)));
}

// 依五行關係微調分數
function adjustScores(base: ScoreSet, relation: DailyFortune['wuxingRelation'], userWuxing: Wuxing): ScoreSet {
  const s = { ...base };
  const affinity = WUXING_AFFINITY[userWuxing];

  switch (relation) {
    case '今日生我':
      // 今日五行生助我 → 所有面向 +1
      (Object.keys(s) as Array<keyof ScoreSet>).forEach(k => { s[k] = clamp(s[k] + 1); });
      break;
    case '今日克我':
      // 今日五行克制我 → 我的優勢面向 -1
      affinity.forEach(k => { s[k] = clamp(s[k] - 1); });
      break;
    case '我生今日':
      // 我耗氣生今日 → 財運/健康微降
      s.wealth = clamp(s.wealth - 1);
      s.health = clamp(s.health - 1);
      break;
    case '我克今日':
      // 我克今日 → 略有鋒芒，但易招忌 → 愛情/合作面向 -1
      s.love = clamp(s.love - 1);
      break;
    case '同行':
      // 同五行 → 平穩，無大波動
      break;
  }
  return s;
}

const GENERIC_ADVICES = {
  good: ['諸事皆宜，可大膽行動，貴人自來。', '今日天時地利，謀事可成，宜把握良機。', '福星高照，凡事順遂，宜廣結善緣。'],
  mid:  ['宜守中道，不急不躁，平穩中求進。', '謀事前多思量，行事穩健方能致勝。', '今日平穩，宜積蓄力量，等待時機。'],
  bad:  ['今日諸事宜緩，靜守為上，避免衝動。', '小心謹慎，遇阻勿強行，靜待轉機。', '宜多行善事、廣積福德，助運化解。'],
};

// ─── 主函式 ────────────────────────────────────────────────────

export function getDailyFortune(bazi?: BaziInfo | null): DailyFortune {
  const dk = dateKey();
  const wxToday = todayWuxing();

  // 基礎分數（日期決定，所有人相同）
  let scores: ScoreSet = {
    wealth: baseScore('wealth'),
    career: baseScore('career'),
    love:   baseScore('love'),
    health: baseScore('health'),
    study:  baseScore('study'),
  };

  let relation: DailyFortune['wuxingRelation'] | undefined;
  let zodiacTipKey: 'good' | 'mid' | 'bad' = 'mid';

  // 個人化調整
  if (bazi) {
    const userWuxing = bazi.wuxing as Wuxing;
    relation = getRelation(userWuxing, wxToday);
    scores = adjustScores(scores, relation, userWuxing);
  }

  const overall = clamp(Math.round((scores.wealth + scores.career + scores.love + scores.health + scores.study) / 5));
  zodiacTipKey = overall >= 4 ? 'good' : overall >= 3 ? 'mid' : 'bad';

  // 建議文：有生肖用個人化，否則用通用
  let advice: string;
  if (bazi && ZODIAC_TIPS[bazi.zodiac]) {
    advice = ZODIAC_TIPS[bazi.zodiac][zodiacTipKey];
  } else {
    advice = pick(GENERIC_ADVICES[zodiacTipKey], 'advice');
  }

  return {
    date: dk,
    scores,
    overall,
    luckyColor: pick(LUCKY_COLORS, 'color'),
    luckyDirection: pick(DIRECTIONS, 'direction'),
    luckyNumber: (hash(`${dk}-number`) % 9) + 1,
    auspiciousHour: pick(AUSPICIOUS_HOURS, 'auspicious'),
    avoidHour: pick(AVOID_HOURS, 'avoid'),
    advice,
    wuxingToday: wxToday,
    zodiac: bazi?.zodiac,
    zodiacEmoji: bazi?.zodiacEmoji,
    userWuxing: bazi?.wuxing as Wuxing | undefined,
    wuxingRelation: relation,
    isPersonalized: !!bazi,
  };
}
