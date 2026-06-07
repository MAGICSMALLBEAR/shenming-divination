import type { BaziInfo } from './bazi';

const DIRECTIONS = ['東', '東南', '南', '西南', '西', '西北', '北', '東北'] as const;
const LUCKY_COLORS = [
  { name: '硃砂紅', hex: '#C0392B' },
  { name: '靛青藍', hex: '#2980B9' },
  { name: '松柏綠', hex: '#27AE60' },
  { name: '金杏黃', hex: '#F39C12' },
  { name: '雲霧紫', hex: '#8E44AD' },
  { name: '月白銀', hex: '#BDC3C7' },
  { name: '琥珀棕', hex: '#922B21' },
  { name: '湖水青', hex: '#1ABC9C' },
] as const;
const AUSPICIOUS_HOURS = [
  '子時 (23-1)',
  '丑時 (1-3)',
  '寅時 (3-5)',
  '卯時 (5-7)',
  '辰時 (7-9)',
  '巳時 (9-11)',
  '午時 (11-13)',
  '未時 (13-15)',
  '申時 (15-17)',
  '酉時 (17-19)',
  '戌時 (19-21)',
  '亥時 (21-23)',
] as const;
const AVOID_HOURS = [
  '子時',
  '丑時',
  '寅時',
  '卯時',
  '辰時',
  '巳時',
  '午時',
  '未時',
  '申時',
  '酉時',
  '戌時',
  '亥時',
] as const;

const WUXING_CYCLE = ['木', '火', '土', '金', '水'] as const;
type Wuxing = (typeof WUXING_CYCLE)[number];

const GENERATES: Record<Wuxing, Wuxing> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROLS: Record<Wuxing, Wuxing> = {
  木: '土',
  火: '金',
  土: '水',
  金: '木',
  水: '火',
};

const WUXING_AFFINITY: Record<Wuxing, (keyof ScoreSet)[]> = {
  木: ['career', 'study'],
  火: ['love', 'career'],
  土: ['health', 'wealth'],
  金: ['wealth', 'study'],
  水: ['love', 'health'],
};

const ZODIAC_TIPS: Record<string, { good: string; mid: string; bad: string }> = {
  鼠: {
    good: '今天適合把握明確機會，先動一步會比猶豫更有收穫。',
    mid: '今天宜穩中求進，別急著把所有事情一次做完。',
    bad: '今天情緒容易受影響，先穩住節奏再做重要決定。',
  },
  牛: {
    good: '今天適合踏實推進，累積會比投機來得更順。',
    mid: '今天可以慢慢整理計畫，把最重要的一步先做好。',
    bad: '今天不宜硬撐，先照顧身心與手上的基本盤。',
  },
  虎: {
    good: '今天氣勢不錯，適合主動爭取與清楚表態。',
    mid: '今天宜收斂鋒芒，用穩定節奏換取信任。',
    bad: '今天容易衝過頭，先想清楚後果再出手。',
  },
  兔: {
    good: '今天適合修補關係與調整節奏，柔和反而更有力量。',
    mid: '今天宜先觀察局面，再選擇最舒服的方式前進。',
    bad: '今天不宜勉強自己迎合外界，先把心安頓好。',
  },
  龍: {
    good: '今天有帶頭與整合的優勢，適合推進重要安排。',
    mid: '今天宜先聚焦一件核心事情，不要分散火力。',
    bad: '今天別急著證明自己，先把基礎補穩更重要。',
  },
  蛇: {
    good: '今天直覺敏銳，適合處理需要判斷力的問題。',
    mid: '今天宜多留一手，先觀察再定案。',
    bad: '今天容易想太多，先處理眼前最具體的一步。',
  },
  馬: {
    good: '今天行動力強，適合把握短期窗口。',
    mid: '今天宜邊做邊修正，不必一次到位。',
    bad: '今天節奏容易亂，先排優先順序再往前。',
  },
  羊: {
    good: '今天適合溫柔但堅定地推進關係與合作。',
    mid: '今天宜照顧自己的感受，再去處理外部壓力。',
    bad: '今天不要過度迎合，先界定自己的底線。',
  },
  猴: {
    good: '今天靈活度高，適合談判、溝通與轉換策略。',
    mid: '今天宜先整理資訊，不要太快下結論。',
    bad: '今天容易分心，先把最重要的一件事做完。',
  },
  雞: {
    good: '今天適合把細節收好，成果會比平常更穩。',
    mid: '今天宜先確認規則與時機，再投入心力。',
    bad: '今天不要太苛求自己，先求穩再求漂亮。',
  },
  狗: {
    good: '今天適合守住承諾與價值，會有值得信任的回應。',
    mid: '今天宜先確認自己的立場，再決定怎麼配合別人。',
    bad: '今天容易把責任攬太多，先留一些空間給自己。',
  },
  豬: {
    good: '今天適合放寬心，用平和方式會更順利。',
    mid: '今天宜慢一點，多確認感受與方向。',
    bad: '今天不宜逃避現實，從最簡單的一步開始就好。',
  },
};

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
  overall: number;
  luckyColor: { name: string; hex: string };
  luckyDirection: string;
  luckyNumber: number;
  auspiciousHour: string;
  avoidHour: string;
  advice: string;
  wuxingToday: Wuxing;
  zodiac?: string;
  zodiacEmoji?: string;
  userWuxing?: Wuxing;
  wuxingRelation?: '今日生我' | '我生今日' | '今日克我' | '我克今日' | '同行' | '平衡';
  isPersonalized: boolean;
}

function hash(seed: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = (value * 0x01000193) >>> 0;
  }
  return value;
}

function dateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function baseScore(category: string): number {
  return (hash(`${dateKey()}-${category}`) % 5) + 1;
}

function pick<T>(list: readonly T[], category: string): T {
  return list[hash(`${dateKey()}-${category}`) % list.length];
}

function todayWuxing(): Wuxing {
  const today = new Date();
  const reference = new Date(2000, 0, 1);
  const diff = Math.floor((today.getTime() - reference.getTime()) / 86400000);
  return WUXING_CYCLE[((diff % 5) + 5) % 5];
}

function clamp(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function getRelation(
  userWuxing: Wuxing,
  dayWuxing: Wuxing
): DailyFortune['wuxingRelation'] {
  if (dayWuxing === userWuxing) return '同行';
  if (GENERATES[dayWuxing] === userWuxing) return '今日生我';
  if (GENERATES[userWuxing] === dayWuxing) return '我生今日';
  if (CONTROLS[dayWuxing] === userWuxing) return '今日克我';
  if (CONTROLS[userWuxing] === dayWuxing) return '我克今日';
  return '平衡';
}

function adjustScores(
  base: ScoreSet,
  relation: DailyFortune['wuxingRelation'],
  userWuxing: Wuxing
): ScoreSet {
  const next = { ...base };
  const affinity = WUXING_AFFINITY[userWuxing];

  switch (relation) {
    case '今日生我':
      (Object.keys(next) as (keyof ScoreSet)[]).forEach((key) => {
        next[key] = clamp(next[key] + 1);
      });
      break;
    case '今日克我':
      affinity.forEach((key) => {
        next[key] = clamp(next[key] - 1);
      });
      break;
    case '我生今日':
      next.wealth = clamp(next.wealth - 1);
      next.health = clamp(next.health - 1);
      break;
    case '我克今日':
      next.love = clamp(next.love - 1);
      break;
    default:
      break;
  }

  return next;
}

const GENERIC_ADVICES = {
  good: [
    '今天適合主動安排一件重要的事，越明確越容易順起來。',
    '今天可以順勢往前推，但記得用穩定步伐取代躁進。',
    '今天的整體氣場偏順，把想做的事落成行動最有幫助。',
  ],
  mid: [
    '今天宜穩住節奏，先做好一件事，再談下一步。',
    '今天適合觀察與微調，不必急著把所有答案一次找完。',
    '今天保持彈性會比硬碰硬更有收穫。',
  ],
  bad: [
    '今天先求穩，再求快，重要決定建議多看一輪。',
    '今天情緒和外界影響都比較明顯，先照顧內在狀態。',
    '今天不必勉強突破，先把手邊能穩住的事情處理好。',
  ],
};

export function getDailyFortune(bazi?: BaziInfo | null): DailyFortune {
  const todayElement = todayWuxing();

  let scores: ScoreSet = {
    wealth: baseScore('wealth'),
    career: baseScore('career'),
    love: baseScore('love'),
    health: baseScore('health'),
    study: baseScore('study'),
  };

  let relation: DailyFortune['wuxingRelation'] | undefined;

  if (bazi) {
    const userWuxing = bazi.wuxing as Wuxing;
    relation = getRelation(userWuxing, todayElement);
    scores = adjustScores(scores, relation, userWuxing);
  }

  const overall = clamp(
    Math.round(
      (scores.wealth + scores.career + scores.love + scores.health + scores.study) / 5
    )
  );
  const tipKey = overall >= 4 ? 'good' : overall >= 3 ? 'mid' : 'bad';

  const advice =
    bazi && ZODIAC_TIPS[bazi.zodiac]
      ? ZODIAC_TIPS[bazi.zodiac][tipKey]
      : pick(GENERIC_ADVICES[tipKey], 'advice');

  return {
    date: dateKey(),
    scores,
    overall,
    luckyColor: pick(LUCKY_COLORS, 'color'),
    luckyDirection: pick(DIRECTIONS, 'direction'),
    luckyNumber: (hash(`${dateKey()}-number`) % 9) + 1,
    auspiciousHour: pick(AUSPICIOUS_HOURS, 'auspicious'),
    avoidHour: pick(AVOID_HOURS, 'avoid'),
    advice,
    wuxingToday: todayElement,
    zodiac: bazi?.zodiac,
    zodiacEmoji: bazi?.zodiacEmoji,
    userWuxing: bazi?.wuxing as Wuxing | undefined,
    wuxingRelation: relation,
    isPersonalized: Boolean(bazi),
  };
}
