// 每日生肖運勢 — 依當日干支與生肖比對產生簡短運勢

const ZODIACS = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'] as const;
const EMOJIS  = ['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐑','🐵','🐔','🐶','🐷'] as const;

const FORTUNE_LEVELS = ['大吉','上吉','中吉','中平','中下','下下'] as const;
type FortuneLevel = typeof FORTUNE_LEVELS[number];

export interface ZodiacDailyFortune {
  zodiac: string;
  emoji: string;
  level: FortuneLevel;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  details: { overall: string; love: string; wealth: string; career: string; health: string };
}

/** 用日期和生肖產生 pseudo-random 但穩定的運勢（同一生肖同一天結果相同） */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const DIRECTIONS = ['北方','東北方','東方','東南方','南方','西南方','西方','西北方'];
const COLORS = ['金色','銀色','紅色','藍色','綠色','紫色','白色','橙色','青色','棕色','粉色','米色'];

const POSITIVE_POOLS: Record<string, string[]> = {
  overall: ['運勢平穩上升，適合整理規劃','貴人運強，主動出擊有收穫','諸事順遂，把握今日好時光','心情愉悅，適合與人交流','靈感湧現，創意想法值得記錄'],
  love:    ['感情升溫，適合表達心意','單身者有機會遇見有緣人','伴侶間多溝通可化解小摩擦','桃花運佳，社交場合有驚喜'],
  wealth:  ['財運穩定，適合長期規劃','有小偏財，但不宜大手筆投資','正財運佳，努力工作有回報','支出需節制，避免衝動消費'],
  career:  ['工作效率高，適合處理積壓事項','有升遷或表揚的機會','團隊合作順利，成果顯著','適合學習新技能或進修'],
  health:  ['精力充沛，適合運動','注意飲食均衡，多喝水','睡眠品質佳，精神飽滿','小心季節變化，注意保暖'],
};

const CAUTION_POOLS: Record<string, string[]> = {
  overall: ['低調行事為上，避免鋒芒太露','耐心等待時機，不宜貿然行動','注意人際關係，避免口舌之爭','情緒起伏較大，宜靜心沉澱'],
  love:    ['容易因小事爭執，多一分體諒','不宜急著表白或做重大決定','注意第三方介入的可能'],
  wealth:  ['財運低迷，避免大額支出','注意保管財物，防範遺失','不宜借貸或擔保'],
  career:  ['職場小人出沒，謹言慎行','計劃受阻，宜重新評估','不宜提出重大變動'],
  health:  ['容易疲倦，注意休息','小心腸胃不適，注意飲食衛生','舊疾可能復發，提前預防'],
};

function pickFromPool(rng: () => number, isGood: boolean, category: string): string {
  const pool = isGood ? POSITIVE_POOLS[category] : CAUTION_POOLS[category];
  return pool[Math.floor(rng() * pool.length)];
}

export function getZodiacDailyFortune(date?: Date): ZodiacDailyFortune[] {
  const d = date ?? new Date();
  const daySeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

  return ZODIACS.map((zodiac, i) => {
    const rng = seededRandom(daySeed * 13 + i * 7 + 3);
    const levelIdx = Math.floor(rng() * FORTUNE_LEVELS.length);
    const level = FORTUNE_LEVELS[levelIdx];
    const isGood = levelIdx <= 2; // 大吉/上吉/中吉 → good pools

    return {
      zodiac,
      emoji: EMOJIS[i],
      level,
      luckyColor: COLORS[Math.floor(rng() * COLORS.length)],
      luckyNumber: Math.floor(rng() * 9) + 1,
      luckyDirection: DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)],
      details: {
        overall: pickFromPool(rng, isGood, 'overall'),
        love:    pickFromPool(rng, isGood, 'love'),
        wealth:  pickFromPool(rng, isGood, 'wealth'),
        career:  pickFromPool(rng, isGood, 'career'),
        health:  pickFromPool(rng, isGood, 'health'),
      },
    };
  });
}

/** 取得特定生肖的今日運勢 */
export function getMyZodiacFortune(birthYear?: number, date?: Date): ZodiacDailyFortune | null {
  if (!birthYear || birthYear < 1900) return null;
  const idx = ((birthYear - 4) % 12 + 12) % 12;
  const fortunes = getZodiacDailyFortune(date);
  return fortunes[idx] ?? null;
}
