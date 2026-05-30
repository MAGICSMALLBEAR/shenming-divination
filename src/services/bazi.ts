// 生辰八字核心計算（簡化版 — 年柱為主）
// 以出生年份推算生肖、天干地支、五行、守護神明

const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;
const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const;
const ZODIAC_ANIMALS = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'] as const;
const ZODIAC_EMOJI =   ['🐭','🐮','🐯','🐰','🐉','🐍','🐴','🐑','🐵','🐔','🐶','🐷'] as const;

const WUXING_BY_STEM: Record<string, string> = {
  甲:'木', 乙:'木', 丙:'火', 丁:'火',
  戊:'土', 己:'土', 庚:'金', 辛:'金',
  壬:'水', 癸:'水',
};

const WUXING_COLOR: Record<string, string> = {
  木: '#2D8653', 火: '#C0392B', 土: '#A0522D',
  金: '#DAA520', 水: '#1A5276',
};

// 每個生肖對應的守護神明 godId
const ZODIAC_PATRON_GOD: Record<string, number> = {
  鼠: 2, // 觀世音菩薩（千手觀音）
  牛: 5, // 保生大帝
  虎: 2, // 觀世音菩薩
  兔: 3, // 媽祖
  龍: 1, // 關聖帝君
  蛇: 2, // 觀世音菩薩
  馬: 1, // 關聖帝君
  羊: 3, // 媽祖
  猴: 8, // 文昌帝君
  雞: 8, // 文昌帝君
  狗: 4, // 王爺
  豬: 6, // 福德正神
};

// 生肖相合 / 相沖（簡化）
const ZODIAC_COMPATIBLE: Record<string, string[]> = {
  鼠: ['龍','猴'], 牛: ['蛇','雞'], 虎: ['馬','狗'], 兔: ['羊','豬'],
  龍: ['鼠','猴'], 蛇: ['牛','雞'], 馬: ['虎','狗'], 羊: ['兔','豬'],
  猴: ['鼠','龍'], 雞: ['牛','蛇'], 狗: ['虎','馬'], 豬: ['兔','羊'],
};
const ZODIAC_CLASH: Record<string, string> = {
  鼠:'馬', 牛:'羊', 虎:'猴', 兔:'雞', 龍:'狗', 蛇:'豬',
  馬:'鼠', 羊:'牛', 猴:'虎', 雞:'兔', 狗:'龍', 豬:'蛇',
};

export interface BaziInfo {
  birthYear: number;
  zodiac: string;
  zodiacEmoji: string;
  ganZhi: string;         // e.g. 甲子
  stem: string;           // 天干
  branch: string;         // 地支
  wuxing: string;         // 五行
  wuxingColor: string;
  patronGodId: number;    // 守護神明 id
  compatible: string[];   // 相合生肖
  clash: string;          // 相沖生肖
  isCurrentYear: boolean; // 本命年
}

export function calcBazi(birthYear: number): BaziInfo {
  const offset = birthYear - 4;
  const stemIdx = ((offset % 10) + 10) % 10;
  const branchIdx = ((offset % 12) + 12) % 12;
  const zodiacIdx = branchIdx;

  const stem = HEAVENLY_STEMS[stemIdx];
  const branch = EARTHLY_BRANCHES[branchIdx];
  const zodiac = ZODIAC_ANIMALS[zodiacIdx];

  const currentYear = new Date().getFullYear();
  const currentBranchIdx = ((currentYear - 4) % 12 + 12) % 12;
  const isCurrentYear = currentBranchIdx === branchIdx;

  return {
    birthYear,
    zodiac,
    zodiacEmoji: ZODIAC_EMOJI[zodiacIdx],
    ganZhi: stem + branch,
    stem,
    branch,
    wuxing: WUXING_BY_STEM[stem] ?? '土',
    wuxingColor: WUXING_COLOR[WUXING_BY_STEM[stem] ?? '土'],
    patronGodId: ZODIAC_PATRON_GOD[zodiac] ?? 2,
    compatible: ZODIAC_COMPATIBLE[zodiac] ?? [],
    clash: ZODIAC_CLASH[zodiac] ?? '',
    isCurrentYear,
  };
}

// 從設定字串解析出生年（支援民國 or 西元）
export function parseBirthYear(raw: string): number | null {
  if (!raw) return null;
  // 民國 NNN 年
  const rocMatch = raw.match(/民國[　\s]*(\d{2,3})/);
  if (rocMatch) return parseInt(rocMatch[1]) + 1911;
  // 純數字 or 西元
  const numMatch = raw.match(/(\d{4})/);
  if (numMatch) {
    const y = parseInt(numMatch[1]);
    if (y >= 1900 && y <= 2100) return y;
  }
  // 民國兩位數（不含「民國」字樣）e.g. "85年"
  const shortMatch = raw.match(/^[　\s]*(\d{2,3})[年\s]/);
  if (shortMatch) {
    const y = parseInt(shortMatch[1]);
    if (y < 200) return y + 1911;
  }
  return null;
}

export { ZODIAC_ANIMALS, ZODIAC_PATRON_GOD };
