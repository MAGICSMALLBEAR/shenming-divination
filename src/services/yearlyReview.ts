import { getHistory, type DivinationRecord } from '@/services/storage';
import { getWishes, type Wish } from '@/services/wishTracker';

export interface YearlyReview {
  year: number;
  totalDraws: number;
  favoriteGod: { name: string; count: number } | null;
  favoriteQuestionCategory: { id: string; name: string; count: number } | null;
  levelDistribution: { level: string; count: number }[];
  verifiedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  monthlyDraws: number[];
  longestStreak: number;
  topPoem: { number: number; level: string; count: number } | null;
  luckyMonth: { month: number; ratio: number } | null;
  totalWishes: number;
  wishesFulfilled: number;
  wordCloud: { word: string; count: number }[];
  insufficient: boolean;
  message?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  career: '事業工作',
  love: '感情姻緣',
  wealth: '財運投資',
  health: '健康身體',
  study: '學業考試',
  family: '家庭家運',
  travel: '出行遷移',
  general: '綜合運勢',
};

const CHINESE_STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
  '一個', '上', '也', '很', '到', '說', '要', '去', '你', '會', '著',
  '沒有', '看', '好', '自己', '這', '他', '她', '它', '們', '那', '些',
  '什麼', '怎麼', '如何', '為什麼', '可以', '還是', '因為', '所以',
  '但是', '如果', '雖然', '而且', '或者', '應該', '可能', '已經',
  '這個', '那個', '哪個', '知道', '覺得', '想', '能', '會', '讓',
  '請問', '想問', '問', '嗎', '呢', '吧', '啊', '哦', '嗯', '希望',
  '想要', '需要', '現在', '之後', '之前', '之後', '以後', '目前',
  '幫忙', '指點', '指教', '請教', '請示', '指示', '關於', '是否',
  '應該', '能夠', '可不可以', '會不會',
]);

function segmentChineseWords(text: string): string[] {
  // Simple Chinese word segmentation: extract bigrams and filter stop words
  // Also keep individual meaningful characters in combination
  const cleaned = text.replace(/[，。！？、；：「」『』（）《》【】\s\d\w\p{P}]/gu, '');
  const words: string[] = [];

  // Extract bigrams
  for (let i = 0; i < cleaned.length - 1; i++) {
    const bigram = cleaned.slice(i, i + 2);
    if (!CHINESE_STOP_WORDS.has(bigram) && bigram.length === 2) {
      words.push(bigram);
    }
  }

  return words;
}

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getLongestStreak(records: DivinationRecord[]): number {
  if (records.length === 0) return 0;

  const uniqueDays = [...new Set(records.map((record) => getDateKey(record.timestamp)))].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const [prevYear, prevMonth, prevDate] = uniqueDays[index - 1].split('-').map(Number);
    const [year, month, date] = uniqueDays[index].split('-').map(Number);
    const previous = new Date(prevYear, prevMonth, prevDate);
    const currentDate = new Date(year, month, date);
    const diff = Math.round((currentDate.getTime() - previous.getTime()) / 86400000);

    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export async function generateYearlyReview(year?: number): Promise<YearlyReview> {
  const targetYear = year ?? new Date().getFullYear();
  const history = await getHistory();
  const yearRecords = history.filter(
    (record) => new Date(record.timestamp).getFullYear() === targetYear
  );

  if (yearRecords.length < 3) {
    return {
      year: targetYear,
      totalDraws: yearRecords.length,
      favoriteGod: null,
      favoriteQuestionCategory: null,
      levelDistribution: [],
      verifiedCount: 0,
      matchedCount: 0,
      unmatchedCount: 0,
      monthlyDraws: new Array(12).fill(0),
      longestStreak: 0,
      topPoem: null,
      luckyMonth: null,
      totalWishes: 0,
      wishesFulfilled: 0,
      wordCloud: [],
      insufficient: true,
      message: '今年求籤記錄不足（至少需要 3 筆），多抽幾支籤再回來看年度回顧吧！',
    };
  }

  // God frequency
  const godCounts: Record<string, number> = {};
  // Category frequency
  const categoryCounts: Record<string, number> = {};
  // Poem frequency
  const poemCounts: Record<number, { count: number; level: string }> = {};
  // Level distribution
  const levelCounts: Record<string, number> = {};
  // Monthly draws
  const monthlyDraws = new Array(12).fill(0);
  // Monthly "fortune" ratio (lucky / total)
  const monthlyLuckyCounts = new Array(12).fill(0);
  const monthlyTotalCounts = new Array(12).fill(0);
  // Verification stats
  let verifiedCount = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;
  // Word frequency
  const wordCounts: Record<string, number> = {};

  for (const record of yearRecords) {
    // God counts
    godCounts[record.godName] = (godCounts[record.godName] ?? 0) + 1;

    // Category counts
    categoryCounts[record.questionCategory] = (categoryCounts[record.questionCategory] ?? 0) + 1;

    // Poem counts
    if (!poemCounts[record.poem.number]) {
      poemCounts[record.poem.number] = { count: 0, level: record.poem.level };
    }
    poemCounts[record.poem.number].count += 1;

    // Level distribution
    levelCounts[record.poem.level] = (levelCounts[record.poem.level] ?? 0) + 1;

    // Monthly draws
    const month = new Date(record.timestamp).getMonth(); // 0-11
    monthlyDraws[month] += 1;
    monthlyTotalCounts[month] += 1;
    if (record.poem.level.includes('上') || record.poem.level.includes('吉')) {
      monthlyLuckyCounts[month] += 1;
    }

    // Verification
    if (record.verificationStatus === 'matched') {
      matchedCount += 1;
      verifiedCount += 1;
    } else if (record.verificationStatus === 'unmatched') {
      unmatchedCount += 1;
      verifiedCount += 1;
    }

    // Word extraction from question
    if (record.question) {
      const words = segmentChineseWords(record.question);
      for (const word of words) {
        wordCounts[word] = (wordCounts[word] ?? 0) + 1;
      }
    }
  }

  // Top god
  const topGodEntry = Object.entries(godCounts).sort((a, b) => b[1] - a[1])[0];
  const favoriteGod = topGodEntry
    ? { name: topGodEntry[0], count: topGodEntry[1] }
    : null;

  // Top category
  const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const favoriteQuestionCategory = topCategoryEntry
    ? {
        id: topCategoryEntry[0],
        name: CATEGORY_NAMES[topCategoryEntry[0]] ?? topCategoryEntry[0],
        count: topCategoryEntry[1],
      }
    : null;

  // Level distribution
  const levelDistribution = Object.entries(levelCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([level, count]) => ({ level, count }));

  // Top poem
  const topPoemEntry = Object.entries(poemCounts).sort((a, b) => b[1].count - a[1].count)[0];
  const topPoem = topPoemEntry
    ? {
        number: Number(topPoemEntry[0]),
        level: topPoemEntry[1].level,
        count: topPoemEntry[1].count,
      }
    : null;

  // Lucky month (highest ratio of lucky draws)
  let luckyMonth: { month: number; ratio: number } | null = null;
  let bestRatio = 0;
  for (let m = 0; m < 12; m++) {
    if (monthlyTotalCounts[m] > 0) {
      const ratio = monthlyLuckyCounts[m] / monthlyTotalCounts[m];
      if (ratio > bestRatio) {
        bestRatio = ratio;
        luckyMonth = { month: m + 1, ratio: Math.round(ratio * 100) };
      }
    }
  }

  // Longest streak
  const longestStreak = getLongestStreak(yearRecords);

  // Wishes
  const allWishes = await getWishes();
  const yearWishes = allWishes.filter(
    (w) => new Date(w.createdAt).getFullYear() === targetYear
  );
  const fulfilledWishes = yearWishes.filter((w) => w.fulfilled).length;

  // Word cloud (top 20)
  const wordCloud = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  return {
    year: targetYear,
    totalDraws: yearRecords.length,
    favoriteGod,
    favoriteQuestionCategory,
    levelDistribution,
    verifiedCount,
    matchedCount,
    unmatchedCount,
    monthlyDraws,
    longestStreak,
    topPoem,
    luckyMonth,
    totalWishes: yearWishes.length,
    wishesFulfilled: fulfilledWishes,
    wordCloud,
    insufficient: false,
  };
}

/** Get available years from history (for year selector) */
export async function getAvailableYears(): Promise<number[]> {
  const history = await getHistory();
  const years = new Set<number>();
  for (const record of history) {
    years.add(new Date(record.timestamp).getFullYear());
  }
  const currentYear = new Date().getFullYear();
  years.add(currentYear);
  return [...years].sort((a, b) => b - a);
}
