// 流年/流月運勢服務
// 2026年為丙午年（火馬年），依據十二生肖與流年天干地支推算

import type { BaziInfo } from './bazi';

export interface YearFortune {
  year: number;
  yearGanZhi: string;     // 丙午
  yearZodiac: string;     // 馬
  yearWuxing: string;     // 火
  overallScore: number;   // 1-5
  overview: string;       // 年度總評
  career: { score: number; summary: string };
  wealth:  { score: number; summary: string };
  love:    { score: number; summary: string };
  health:  { score: number; summary: string };
  family:  { score: number; summary: string };
  luckyMonths: number[];  // 吉月（1-12）
  cautiousMonths: number[]; // 需注意的月
  luckyColors: string[];
  luckyNumbers: number[];
  advice: string;
  blessing: string;
}

export interface MonthFortune {
  year: number;
  month: number;
  monthGanZhi: string;
  overallScore: number;
  overview: string;
  career:  { score: number; tip: string };
  wealth:  { score: number; tip: string };
  love:    { score: number; tip: string };
  health:  { score: number; tip: string };
  auspiciousDays: number[];  // 吉日（1-31中的幾天）
  advice: string;
}

// 2026丙午年各生肖年運資料
const YEAR_FORTUNE_2026: Record<string, Omit<YearFortune, 'year' | 'yearGanZhi' | 'yearZodiac' | 'yearWuxing'>> = {
  鼠: {
    overallScore: 3,
    overview: '丙午年對鼠年生人屬中平之年。火馬年與水鼠相剋，需謹慎行事，但只要保持低調穩健，事業仍可穩步推進。',
    career:  { score: 3, summary: '工作穩定但缺乏突破，適合鞏固現有成果，不宜貿然跳槽或創業。' },
    wealth:  { score: 2, summary: '財運一般，有偏財但也有破財風險，投資需謹慎，遠離高風險項目。' },
    love:    { score: 3, summary: '感情平穩，單身者有機會透過朋友介紹遇到合適對象。' },
    health:  { score: 3, summary: '注意腎臟與循環系統，多補充水分，避免過度疲勞。' },
    family:  { score: 4, summary: '家庭關係融洽，是陪伴家人的好年份。' },
    luckyMonths: [2, 6, 11],
    cautiousMonths: [5, 8],
    luckyColors: ['藍色', '黑色', '金色'],
    luckyNumbers: [1, 6, 8],
    advice: '今年適合深耕，不宜激進。守住現有，默默累積實力，明年自有收穫。',
    blessing: '鼠年生人在丙午年，穩中有進，守正待時，積累終有成果。',
  },
  牛: {
    overallScore: 4,
    overview: '丙午年對牛年生人整體運勢不錯。火年帶旺事業，財運有進，但需注意健康。',
    career:  { score: 4, summary: '事業有貴人相助，有機會升遷或接到重要項目，把握機會積極表現。' },
    wealth:  { score: 4, summary: '財運旺盛，正財穩定，偏財也有機會，適合穩健投資。' },
    love:    { score: 3, summary: '感情需要主動經營，有小摩擦但整體穩定，已婚者感情甜蜜。' },
    health:  { score: 3, summary: '腸胃需要注意，飲食要規律，避免熬夜。' },
    family:  { score: 4, summary: '家庭和諧，長輩身體值得關注。' },
    luckyMonths: [3, 7, 10],
    cautiousMonths: [6, 9],
    luckyColors: ['黃色', '棕色', '金色'],
    luckyNumbers: [2, 5, 8],
    advice: '今年是衝刺的好時機，事業上要主動出擊，健康方面不可忽視。',
    blessing: '牛年生人今年勤耕必有收穫，貴人自來，事業財運雙豐收。',
  },
  虎: {
    overallScore: 4,
    overview: '丙午年虎年生人與馬有三合局，加上火年生旺，是整體運勢最好的生肖之一。',
    career:  { score: 5, summary: '事業運旺盛，有突破性機會，適合大膽嘗試新方向、新項目。' },
    wealth:  { score: 4, summary: '財運極佳，正財偏財均有進帳，投資理財可積極一些。' },
    love:    { score: 4, summary: '桃花旺盛，單身者有很大機率遇到心儀對象，情侶感情升溫。' },
    health:  { score: 3, summary: '運動過多容易受傷，注意骨骼與關節保護。' },
    family:  { score: 4, summary: '家庭關係活躍，適合帶家人出遊。' },
    luckyMonths: [2, 6, 10],
    cautiousMonths: [4, 7],
    luckyColors: ['橙色', '紅色', '金色'],
    luckyNumbers: [3, 6, 9],
    advice: '今年是你的好年，要把握機會主動出擊，但也要避免過於衝動，謹防小人。',
    blessing: '虎年生人逢火馬年三合，風雷之勢，一飛沖天，大展宏圖。',
  },
  兔: {
    overallScore: 3,
    overview: '丙午年兔年生人中平之年，需謹慎應對各種變化，重在穩守。',
    career:  { score: 3, summary: '工作有小波折，同事關係需要維護，避免與上司起衝突。' },
    wealth:  { score: 3, summary: '財運平平，收支基本平衡，不適合大筆投資。' },
    love:    { score: 4, summary: '感情運不錯，已有伴侶者關係甜蜜，單身者有緣分但需主動。' },
    health:  { score: 3, summary: '注意肝臟與眼睛，保持規律作息。' },
    family:  { score: 3, summary: '家庭事務較多，需要耐心處理。' },
    luckyMonths: [1, 5, 9],
    cautiousMonths: [3, 10],
    luckyColors: ['綠色', '粉紅', '白色'],
    luckyNumbers: [4, 8, 12],
    advice: '今年要保持謙遜，默默耕耘，避免高調，感情方面可主動出擊。',
    blessing: '兔年生人穩中求進，心誠則靈，柔能克剛，自有好緣到來。',
  },
  龍: {
    overallScore: 4,
    overview: '丙午年龍年生人運勢回升，去年的低潮過後，今年各方面都有明顯改善。',
    career:  { score: 4, summary: '職場運強，適合推進重要計畫，展現個人能力的好時機。' },
    wealth:  { score: 4, summary: '財運復甦，有機會獲得加薪或額外收入，投資可以適度。' },
    love:    { score: 3, summary: '感情需要更多溝通，避免因忙於事業而忽略另一半。' },
    health:  { score: 4, summary: '整體健康狀況良好，但要注意心臟與血壓。' },
    family:  { score: 3, summary: '家庭需要花時間維繫，親子關係值得用心。' },
    luckyMonths: [4, 8, 11],
    cautiousMonths: [2, 6],
    luckyColors: ['金色', '銀色', '紫色'],
    luckyNumbers: [1, 5, 9],
    advice: '今年是翻身的好年，把握機會積極行動，感情和家庭也要同步照顧。',
    blessing: '龍年生人在丙午年，如龍化雨，翻雲覆雨，東山再起，威震四方。',
  },
  蛇: {
    overallScore: 3,
    overview: '丙午年蛇年生人與亥相沖（年份沖），需要特別謹慎，避免衝動行事。',
    career:  { score: 3, summary: '工作有變動跡象，可能面臨調職或轉換，保持冷靜謹慎應對。' },
    wealth:  { score: 2, summary: '財務需要謹慎管理，有破財風險，避免借錢給他人。' },
    love:    { score: 3, summary: '感情需要更多包容，避免爭吵。單身者姻緣需等待時機。' },
    health:  { score: 3, summary: '心臟與血壓需留意，避免壓力過大。' },
    family:  { score: 3, summary: '家庭有小紛爭，需要保持耐心溝通。' },
    luckyMonths: [1, 5, 9],
    cautiousMonths: [4, 8, 12],
    luckyColors: ['黃色', '咖啡色', '紅色'],
    luckyNumbers: [2, 6, 10],
    advice: '今年宜守不宜攻，凡事三思而後行，多拜拜祈求平安，轉化衝剋之氣。',
    blessing: '蛇年生人逢沖年，以靜制動，以柔克剛，守正持中，化危為安。',
  },
  馬: {
    overallScore: 5,
    overview: '2026丙午年是馬年生人的本命年！本命年雙重加持，運勢全面爆發，是人生重要轉折年。',
    career:  { score: 5, summary: '本命年事業運強旺，有重大突破機會，適合創業或承擔重要職責。' },
    wealth:  { score: 5, summary: '財運鼎盛，正財偏財均旺，是累積財富的好年份，可積極投資。' },
    love:    { score: 4, summary: '桃花旺盛，感情運極佳，單身者有機遇，情侶可考慮定終身。' },
    health:  { score: 4, summary: '精力充沛，但注意不要過度消耗，適當休息以持續佳績。' },
    family:  { score: 4, summary: '家庭喜事可能連連，家人關係融洽熱鬧。' },
    luckyMonths: [2, 6, 7, 10],
    cautiousMonths: [11],
    luckyColors: ['紅色', '橙色', '金色'],
    luckyNumbers: [3, 7, 9],
    advice: '本命年是你的大年，要大膽追夢，積極行動。記得佩戴本命年吉祥物，趨吉避凶。',
    blessing: '馬年本命年，天時地利人和，縱橫四海，無往不利，大展雄圖！',
  },
  羊: {
    overallScore: 3,
    overview: '丙午年羊年生人整體中平，需要平心靜氣，默默累積，不宜大起大落。',
    career:  { score: 3, summary: '工作穩定，但缺乏明顯進展，適合精進技能，為未來做準備。' },
    wealth:  { score: 3, summary: '財運平穩，量入為出，不適合大規模投資或冒險。' },
    love:    { score: 4, summary: '感情運良好，已有伴侶感情甜蜜，單身者緣分自然到來。' },
    health:  { score: 3, summary: '消化系統需要保養，飲食規律，避免暴飲暴食。' },
    family:  { score: 4, summary: '家庭氛圍溫暖，是享受家庭時光的一年。' },
    luckyMonths: [3, 7, 11],
    cautiousMonths: [1, 8],
    luckyColors: ['綠色', '紅色', '紫色'],
    luckyNumbers: [3, 4, 9],
    advice: '今年要學會享受平靜，不要羨慕別人的風光，踏實過日子，感情上要主動表達。',
    blessing: '羊年生人溫柔厚道，今年靜水流深，平安是福，好緣自來。',
  },
  猴: {
    overallScore: 4,
    overview: '丙午年猴年生人與馬有六合，加上猴靈活的本性，今年諸事有望突破。',
    career:  { score: 4, summary: '事業靈活應變，有貴人提攜，適合開創新局，靈活把握機會。' },
    wealth:  { score: 4, summary: '偏財運旺，可以嘗試多元收入，但避免投機性賭博。' },
    love:    { score: 4, summary: '感情活躍，魅力十足，但要避免花心，專一才能修成正果。' },
    health:  { score: 4, summary: '整體健康，注意四肢關節，避免過度運動造成傷害。' },
    family:  { score: 3, summary: '家庭需要穩定，避免因外出機會多而疏忽家人。' },
    luckyMonths: [2, 5, 9],
    cautiousMonths: [7, 11],
    luckyColors: ['金色', '銀色', '白色'],
    luckyNumbers: [4, 8, 12],
    advice: '今年靈活機智是你的優勢，把握偏財機會，但感情要專一，家庭要穩固。',
    blessing: '猴年生人聰慧靈動，丙午年貴人相助，左右逢源，機緣不斷。',
  },
  雞: {
    overallScore: 3,
    overview: '丙午年雞年生人整體運勢中等，與午火有合，但也有小沖，需謹慎中求進。',
    career:  { score: 3, summary: '工作認真但競爭激烈，需要加倍努力才能脫穎而出。' },
    wealth:  { score: 3, summary: '財運平穩，正財可期，偏財需謹慎，避免投機。' },
    love:    { score: 3, summary: '感情需要主動維護，避免因個性強硬造成摩擦。' },
    health:  { score: 4, summary: '健康狀況較好，適合開始規律運動計畫。' },
    family:  { score: 4, summary: '家庭支持是你的後盾，多與家人溝通。' },
    luckyMonths: [1, 5, 9],
    cautiousMonths: [3, 6],
    luckyColors: ['金色', '棕色', '白色'],
    luckyNumbers: [5, 8, 9],
    advice: '今年腳踏實地是關鍵，不要好高騖遠，一步一腳印必能達成目標。',
    blessing: '雞年生人勤懇踏實，今年穩中有升，光芒終會被看見。',
  },
  狗: {
    overallScore: 3,
    overview: '丙午年狗年生人需要注意三刑之氣，處事要圓融，避免與人結怨。',
    career:  { score: 3, summary: '職場需要低調，避免與同事或上司產生摩擦，做好本分最重要。' },
    wealth:  { score: 3, summary: '財運平平，量入為出，謹慎借貸，避免財務糾紛。' },
    love:    { score: 3, summary: '感情有波動，需要更多耐心，避免因小事鬧翻。' },
    health:  { score: 3, summary: '腸胃與皮膚需要保養，注意飲食衛生。' },
    family:  { score: 3, summary: '家庭關係需要用心維繫，多陪伴家人。' },
    luckyMonths: [2, 6, 10],
    cautiousMonths: [4, 7, 10],
    luckyColors: ['黃色', '棕色', '紅色'],
    luckyNumbers: [3, 5, 9],
    advice: '今年要多拜拜祈求平安，化解衝剋之氣，處事謙遜低調，廣結善緣。',
    blessing: '狗年生人忠誠正直，今年逢多事之秋，守正心安，福報終至。',
  },
  豬: {
    overallScore: 4,
    overview: '丙午年豬年生人整體運勢良好，火年帶動財運，有機會在事業和財富上有所突破。',
    career:  { score: 4, summary: '職場有貴人，工作進展順利，適合提出新計畫或爭取晉升機會。' },
    wealth:  { score: 4, summary: '財運旺盛，有機會獲得意外之財，投資理財可以積極操作。' },
    love:    { score: 4, summary: '感情甜蜜，已有伴侶者感情深化，單身者桃花旺，把握機緣。' },
    health:  { score: 3, summary: '注意呼吸系統，天氣變化時做好防護，適當鍛鍊。' },
    family:  { score: 4, summary: '家庭喜慶，可能有添丁進口的喜訊。' },
    luckyMonths: [3, 7, 11],
    cautiousMonths: [5, 9],
    luckyColors: ['藍色', '黑色', '金色'],
    luckyNumbers: [2, 6, 8],
    advice: '今年是發展的好年，積極出擊，把握每個機會，同時也要維護好家庭關係。',
    blessing: '豬年生人誠實樂觀，丙午年如沐春風，財源廣進，家業興旺。',
  },
};

// 2026年每月天干地支（丙午年）
const MONTH_GANZHI_2026: string[] = [
  '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥',
];

// 各月運勢調整值（根據月支與生肖關係）
function getMonthAdjustment(zodiac: string, monthIndex: number): number {
  const branch = MONTH_GANZHI_2026[monthIndex]?.[1];
  const clashMap: Record<string, string> = {
    子: '午', 丑: '未', 寅: '申', 卯: '酉',
    辰: '戌', 巳: '亥', 午: '子', 未: '丑',
    申: '寅', 酉: '卯', 戌: '辰', 亥: '巳',
  };
  const zodiacBranch: Record<string, string> = {
    鼠: '子', 牛: '丑', 虎: '寅', 兔: '卯', 龍: '辰', 蛇: '巳',
    馬: '午', 羊: '未', 猴: '申', 雞: '酉', 狗: '戌', 豬: '亥',
  };
  const zb = zodiacBranch[zodiac];
  if (!zb || !branch) return 0;
  if (clashMap[zb] === branch) return -1;
  if (zb === branch) return 1;
  return 0;
}

// 取得年度運勢
export function getYearFortune(bazi: BaziInfo): YearFortune {
  const baseData = YEAR_FORTUNE_2026[bazi.zodiac] ?? YEAR_FORTUNE_2026['馬'];
  return {
    year: 2026,
    yearGanZhi: '丙午',
    yearZodiac: '馬',
    yearWuxing: '火',
    ...baseData,
  };
}

// 取得月度運勢
export function getMonthFortune(bazi: BaziInfo, month: number): MonthFortune {
  const monthIndex = month - 1;
  const adjustment = getMonthAdjustment(bazi.zodiac, monthIndex);
  const yearData = YEAR_FORTUNE_2026[bazi.zodiac];
  const baseScore = yearData?.overallScore ?? 3;
  const monthScore = Math.max(1, Math.min(5, baseScore + adjustment));

  const isLucky = yearData?.luckyMonths.includes(month) ?? false;
  const isCautious = yearData?.cautiousMonths.includes(month) ?? false;

  const overviews: Record<string, string> = {
    吉: `本月是今年的吉月，運勢佳，可以積極推進重要事項，把握良機。`,
    凶: `本月需要謹慎行事，避免衝動決策，守成為主，靜待時機。`,
    平: `本月運勢平穩，按部就班做事，不宜冒進，也不必過於保守。`,
  };

  const label = isLucky ? '吉' : isCautious ? '凶' : '平';

  // 吉日（依月份固定幾天為吉）
  const auspiciousDays = [1, 6, 11, 16, 21, 26].map(d => d + (monthIndex % 5));

  return {
    year: 2026,
    month,
    monthGanZhi: MONTH_GANZHI_2026[monthIndex] ?? '',
    overallScore: monthScore,
    overview: overviews[label],
    career:  { score: Math.max(1, monthScore + (isLucky ? 1 : 0)), tip: isLucky ? '本月事業有貴人，適合主動出擊。' : '本月宜穩守，專注把現有工作做好。' },
    wealth:  { score: Math.max(1, monthScore + (isLucky ? 1 : -1)), tip: isLucky ? '本月財運旺，可適度投資。' : '本月財務謹慎，避免衝動消費。' },
    love:    { score: Math.max(1, monthScore), tip: isLucky ? '感情有進展，主動表達心意。' : '感情需要耐心溝通，避免爭執。' },
    health:  { score: Math.max(1, monthScore + (isCautious ? -1 : 0)), tip: isCautious ? '本月身體較弱，注意休養。' : '保持規律作息，運動有助提振。' },
    auspiciousDays: auspiciousDays.filter(d => d <= 28),
    advice: isLucky
      ? `${month}月是你的吉月，主動出擊，把握機會！`
      : isCautious
        ? `${month}月需謹慎，凡事三思而後行，多拜拜求平安。`
        : `${month}月平穩運行，腳踏實地，穩健前進。`,
  };
}

// 取得全年12個月運勢
export function getFullYearMonthFortunes(bazi: BaziInfo): MonthFortune[] {
  return Array.from({ length: 12 }, (_, i) => getMonthFortune(bazi, i + 1));
}
