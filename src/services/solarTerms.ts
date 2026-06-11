// 二十四節氣服務 — 依當前日期返回節氣名稱與占卜指引
export interface SolarTerm {
  name: string;
  element: string;     // 五行屬性
  guidance: string;    // 求籤解籤小叮嚀
  auspicious: string;  // 宜
  avoid: string;       // 忌
}

// 2026 年二十四節氣（月/日）
const SOLAR_TERMS_2026: Array<{ month: number; day: number; term: SolarTerm }> = [
  { month: 1,  day: 5,  term: { name: '小寒', element: '水', guidance: '寒氣凝聚，心誠則靈，宜靜心默禱', auspicious: '祈福、謀事', avoid: '輕率決策' } },
  { month: 1,  day: 20, term: { name: '大寒', element: '水', guidance: '嚴冬末節，蓄勢待發，籤意主謹慎', auspicious: '儲蓄、靜守', avoid: '冒進、爭競' } },
  { month: 2,  day: 4,  term: { name: '立春', element: '木', guidance: '萬象更新，求籤問事生機蓬勃', auspicious: '開業、求財、感情', avoid: '怠惰拖延' } },
  { month: 2,  day: 19, term: { name: '雨水', element: '木', guidance: '雨潤萬物，事業感情均宜滋養', auspicious: '播種計畫', avoid: '急於求成' } },
  { month: 3,  day: 6,  term: { name: '驚蟄', element: '木', guidance: '萬物驚醒，行動力強，好時機', auspicious: '求職、合作', avoid: '墨守成規' } },
  { month: 3,  day: 21, term: { name: '春分', element: '木', guidance: '陰陽平衡，諸事均衡考量', auspicious: '溝通協調', avoid: '偏執一方' } },
  { month: 4,  day: 5,  term: { name: '清明', element: '木', guidance: '慎終追遠，求籤宜懷敬畏之心', auspicious: '祭祖、感恩', avoid: '輕浮嬉鬧' } },
  { month: 4,  day: 20, term: { name: '穀雨', element: '土', guidance: '雨生百谷，努力耕耘必有收穫', auspicious: '學習、投資', avoid: '懶散虛度' } },
  { month: 5,  day: 6,  term: { name: '立夏', element: '火', guidance: '陽氣漸盛，行動力旺，勇於嘗試', auspicious: '求職、戀愛', avoid: '衝動行事' } },
  { month: 5,  day: 21, term: { name: '小滿', element: '火', guidance: '穀物漸滿，知足常樂為上', auspicious: '守成、感恩', avoid: '貪心不足' } },
  { month: 6,  day: 6,  term: { name: '芒種', element: '火', guidance: '播種有芒，辛勤方得回報', auspicious: '開創、奮鬥', avoid: '依賴他人' } },
  { month: 6,  day: 21, term: { name: '夏至', element: '火', guidance: '陽氣至極，盛極而衰，宜收斂', auspicious: '審視自我', avoid: '過度擴張' } },
  { month: 7,  day: 7,  term: { name: '小暑', element: '火', guidance: '暑氣漸盛，心靜自然涼，求籤宜平心靜氣', auspicious: '修心養性', avoid: '急躁易怒' } },
  { month: 7,  day: 23, term: { name: '大暑', element: '土', guidance: '炎炎盛夏，萬事不宜急進', auspicious: '養生休息', avoid: '勉強行事' } },
  { month: 8,  day: 7,  term: { name: '立秋', element: '金', guidance: '秋意初現，收穫季節，問事宜穩', auspicious: '收成、整理', avoid: '輕易放棄' } },
  { month: 8,  day: 23, term: { name: '處暑', element: '金', guidance: '暑氣漸消，諸事漸入佳境', auspicious: '轉機把握', avoid: '猶豫不決' } },
  { month: 9,  day: 8,  term: { name: '白露', element: '金', guidance: '露白秋涼，感情求籤宜真誠', auspicious: '誠懇溝通', avoid: '心存算計' } },
  { month: 9,  day: 23, term: { name: '秋分', element: '金', guidance: '陰陽再均，平衡取中為吉', auspicious: '折衷協商', avoid: '走極端' } },
  { month: 10, day: 8,  term: { name: '寒露', element: '金', guidance: '寒意漸深，求財問事宜保守', auspicious: '存款守業', avoid: '冒險投機' } },
  { month: 10, day: 23, term: { name: '霜降', element: '土', guidance: '霜降萬物，謹慎為要', auspicious: '謀定後動', avoid: '草率行事' } },
  { month: 11, day: 7,  term: { name: '立冬', element: '水', guidance: '冬藏之時，蓄積能量靜待時機', auspicious: '規劃未來', avoid: '貿然出擊' } },
  { month: 11, day: 22, term: { name: '小雪', element: '水', guidance: '初雪輕落，籤意偏向靜守', auspicious: '沉澱反思', avoid: '衝動決定' } },
  { month: 12, day: 7,  term: { name: '大雪', element: '水', guidance: '雪深地凍，艱難中見韌性', auspicious: '堅持本心', avoid: '半途而廢' } },
  { month: 12, day: 22, term: { name: '冬至', element: '水', guidance: '陰極陽生，最黑暗後即是轉機', auspicious: '祈求轉運', avoid: '悲觀失志' } },
];

export function getCurrentSolarTerm(date = new Date()): SolarTerm {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // 找出當前或最近剛過的節氣
  let current = SOLAR_TERMS_2026[SOLAR_TERMS_2026.length - 1].term;
  for (let i = SOLAR_TERMS_2026.length - 1; i >= 0; i--) {
    const t = SOLAR_TERMS_2026[i];
    if (m > t.month || (m === t.month && d >= t.day)) {
      current = t.term;
      break;
    }
  }
  return current;
}

export function getNextSolarTerm(date = new Date()): { term: SolarTerm; daysUntil: number } | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  for (const t of SOLAR_TERMS_2026) {
    if (t.month > m || (t.month === m && t.day > d)) {
      const termDate = new Date(2026, t.month - 1, t.day);
      const daysUntil = Math.ceil((termDate.getTime() - date.getTime()) / 86400000);
      return { term: t.term, daysUntil };
    }
  }
  return null;
}
