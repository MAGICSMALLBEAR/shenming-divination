const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const;
const ZODIAC_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'] as const;

const WUXING_BY_STEM: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

const WUXING_COLOR: Record<string, string> = {
  木: '#2D8653',
  火: '#C0392B',
  土: '#A0522D',
  金: '#DAA520',
  水: '#1A5276',
};

export const ZODIAC_PATRON_GOD: Record<string, number> = {
  鼠: 2,
  牛: 5,
  虎: 2,
  兔: 3,
  龍: 1,
  蛇: 2,
  馬: 1,
  羊: 3,
  猴: 8,
  雞: 8,
  狗: 4,
  豬: 6,
};

const ZODIAC_COMPATIBLE: Record<string, string[]> = {
  鼠: ['龍', '猴'],
  牛: ['蛇', '雞'],
  虎: ['馬', '狗'],
  兔: ['羊', '豬'],
  龍: ['鼠', '猴'],
  蛇: ['牛', '雞'],
  馬: ['虎', '狗'],
  羊: ['兔', '豬'],
  猴: ['鼠', '龍'],
  雞: ['牛', '蛇'],
  狗: ['虎', '馬'],
  豬: ['兔', '羊'],
};

const ZODIAC_CLASH: Record<string, string> = {
  鼠: '馬',
  牛: '羊',
  虎: '猴',
  兔: '雞',
  龍: '狗',
  蛇: '豬',
  馬: '鼠',
  羊: '牛',
  猴: '虎',
  雞: '兔',
  狗: '龍',
  豬: '蛇',
};

export interface BaziInfo {
  birthYear: number;
  zodiac: string;
  zodiacEmoji: string;
  ganZhi: string;
  stem: string;
  branch: string;
  wuxing: string;
  wuxingColor: string;
  patronGodId: number;
  compatible: string[];
  clash: string;
  isCurrentYear: boolean;
}

export function calcBazi(birthYear: number): BaziInfo {
  const offset = birthYear - 4;
  const stemIndex = ((offset % 10) + 10) % 10;
  const branchIndex = ((offset % 12) + 12) % 12;
  const zodiacIndex = branchIndex;

  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  const zodiac = ZODIAC_ANIMALS[zodiacIndex];
  const currentYear = new Date().getFullYear();
  const currentBranchIndex = ((currentYear - 4) % 12 + 12) % 12;

  return {
    birthYear,
    zodiac,
    zodiacEmoji: ZODIAC_EMOJI[zodiacIndex],
    ganZhi: `${stem}${branch}`,
    stem,
    branch,
    wuxing: WUXING_BY_STEM[stem] ?? '木',
    wuxingColor: WUXING_COLOR[WUXING_BY_STEM[stem] ?? '木'],
    patronGodId: ZODIAC_PATRON_GOD[zodiac] ?? 2,
    compatible: ZODIAC_COMPATIBLE[zodiac] ?? [],
    clash: ZODIAC_CLASH[zodiac] ?? '',
    isCurrentYear: currentBranchIndex === branchIndex,
  };
}

export function parseBirthYear(raw: string): number | null {
  if (!raw) return null;

  const rocMatch = raw.match(/民國\s*(\d{2,3})/);
  if (rocMatch) return Number(rocMatch[1]) + 1911;

  const yearMatch = raw.match(/(\d{4})/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    if (year >= 1900 && year <= 2100) return year;
  }

  const shortMatch = raw.match(/^(\d{2,3})\s*年?$/);
  if (shortMatch) {
    const year = Number(shortMatch[1]);
    if (year < 200) return year + 1911;
  }

  return null;
}

export { ZODIAC_ANIMALS };
