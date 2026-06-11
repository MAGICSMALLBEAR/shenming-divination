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

// ═══════════════════════════════════════════════════
// 2027 丁未年（陰火・土羊年）各生肖年運
// 三合：亥卯未（木局）→ 豬兔羊大吉
// 六合：午未合 → 馬吉
// 沖：丑未相沖 → 牛最需注意
// 刑：戌未相刑 → 狗注意
// 害：子未相害 → 鼠注意
// ═══════════════════════════════════════════════════
const YEAR_FORTUNE_2027: Record<string, Omit<YearFortune, 'year' | 'yearGanZhi' | 'yearZodiac' | 'yearWuxing'>> = {
  鼠: {
    overallScore: 2,
    overview: '丁未年子未相害，鼠年生人運勢偏弱，需謹慎行事，防小人暗算，凡事多思考。',
    career:  { score: 2, summary: '工作上容易遭遇阻礙，小人較多，守成為主，不宜大動作。' },
    wealth:  { score: 2, summary: '財務需保守，有破財機率，避免投資高風險項目。' },
    love:    { score: 3, summary: '感情需多溝通，避免誤解，已婚者注意家庭關係維繫。' },
    health:  { score: 3, summary: '腎臟泌尿系統需注意，多喝水，規律作息。' },
    family:  { score: 3, summary: '家庭關係尚穩，多陪伴家人可化解小人之氣。' },
    luckyMonths: [3, 7, 11],
    cautiousMonths: [2, 8],
    luckyColors: ['藍色', '黑色', '白色'],
    luckyNumbers: [1, 6, 8],
    advice: '今年宜低調行事，廣結善緣，避免衝突，靜待運勢回升。',
    blessing: '鼠年生人在丁未年，守正避害，默默積蓄實力，靜待2028年大運轉好。',
  },
  牛: {
    overallScore: 2,
    overview: '丁未年丑未相沖，為沖太歲之年，牛年生人事業感情財運均受衝擊，需積極化解。',
    career:  { score: 2, summary: '工作動盪，有換工作或職位調動風險，提前做好準備。' },
    wealth:  { score: 2, summary: '財運不穩，支出增加，投資保守，存款為主。' },
    love:    { score: 2, summary: '感情波折多，有分手或爭吵風險，需多包容溝通。' },
    health:  { score: 2, summary: '腸胃消化系統需注意，手術、意外需格外小心。' },
    family:  { score: 3, summary: '家庭需要多花時間維繫，長輩健康需關注。' },
    luckyMonths: [4, 8, 12],
    cautiousMonths: [3, 6, 9],
    luckyColors: ['黃色', '棕色', '紅色'],
    luckyNumbers: [2, 5, 9],
    advice: '今年建議在農曆年初安太歲、拜太歲，做好防護，謹慎行事。',
    blessing: '丑未相沖雖艱難，但逢化解貴人自來，沉著應對，終能轉危為安。',
  },
  虎: {
    overallScore: 3,
    overview: '丁未年對虎年生人運勢中平，寅亥相合有貴人助，但需注意健康與人際。',
    career:  { score: 3, summary: '有貴人提攜，但需主動把握，按部就班推進工作。' },
    wealth:  { score: 3, summary: '財運平穩，勤勞有收穫，投機類投資需謹慎。' },
    love:    { score: 4, summary: '桃花有機會，積極主動可有收穫，情侶感情穩定。' },
    health:  { score: 3, summary: '注意肝膽，春季多保養，避免過度疲勞。' },
    family:  { score: 3, summary: '家庭和諧，親子關係良好。' },
    luckyMonths: [2, 5, 11],
    cautiousMonths: [4, 7],
    luckyColors: ['綠色', '藍色', '金色'],
    luckyNumbers: [3, 6, 9],
    advice: '善用人際關係，貴人就在身旁，主動請教前輩，事半功倍。',
    blessing: '虎年生人在丁未年，寅亥合貴，穩步向前，人際是最大助力。',
  },
  兔: {
    overallScore: 5,
    overview: '丁未年亥卯未三合木局，兔年生人大吉之年！事業財運感情全面旺盛，是近幾年最好的一年。',
    career:  { score: 5, summary: '事業飛速，升遷機會大，有創業念頭可積極評估，貴人不斷。' },
    wealth:  { score: 5, summary: '財運極旺，正財偏財均有進帳，是投資理財的好時機。' },
    love:    { score: 5, summary: '感情甜蜜，單身者有極大機率遇到真命天子/天女，情侶可考慮婚事。' },
    health:  { score: 4, summary: '身體狀況佳，但勿過度操勞，適度休息維持巔峰狀態。' },
    family:  { score: 5, summary: '家庭喜事連連，有求子願望者今年機率大增。' },
    luckyMonths: [3, 6, 10, 12],
    cautiousMonths: [1],
    luckyColors: ['綠色', '青色', '金色'],
    luckyNumbers: [4, 8, 9],
    advice: '今年是難得的大運之年，大膽行動，主動出擊，把握每一個機會！',
    blessing: '兔年生人在丁未年，三合大吉，諸事皆宜，萬事如意，好運連連！',
  },
  龍: {
    overallScore: 3,
    overview: '丁未年辰未相破，龍年生人有小破損之象，凡事需謹慎收尾，避免功虧一簣。',
    career:  { score: 3, summary: '工作中容易有疏失，需仔細確認細節，避免因小失大。' },
    wealth:  { score: 3, summary: '財運普通，有小破財，避免衝動消費，穩健理財。' },
    love:    { score: 3, summary: '感情需耐心經營，避免一時衝動造成誤解。' },
    health:  { score: 3, summary: '注意腸胃與消化，飲食清淡，少吃刺激性食物。' },
    family:  { score: 4, summary: '家庭關係是今年的精神依靠，多陪伴家人。' },
    luckyMonths: [1, 5, 9],
    cautiousMonths: [3, 7],
    luckyColors: ['黃色', '金色', '橙色'],
    luckyNumbers: [2, 5, 7],
    advice: '今年凡事謹慎收尾，不要半途而廢，堅持到底必有成果。',
    blessing: '龍年生人在丁未年，守正勿急，細心謹慎，終能化解小破而得完整。',
  },
  蛇: {
    overallScore: 3,
    overview: '丁未年蛇年生人屬平穩之年，巳丁同類火相助，事業有小幸運，整體運勢中規中矩。',
    career:  { score: 3, summary: '工作平穩進行，有機會展現才能，但不會有劇烈變化。' },
    wealth:  { score: 3, summary: '財運一般，正財穩定，偏財機會有限，守成為主。' },
    love:    { score: 3, summary: '感情平穩，需要主動製造浪漫，避免平淡乏味。' },
    health:  { score: 4, summary: '健康狀況不錯，但心臟血壓需留意，適度運動。' },
    family:  { score: 3, summary: '家庭和睦，是穩定的一年。' },
    luckyMonths: [2, 6, 10],
    cautiousMonths: [5, 9],
    luckyColors: ['紅色', '橙色', '金色'],
    luckyNumbers: [1, 6, 9],
    advice: '今年適合學習新技能、進修，為未來打基礎，穩健前行。',
    blessing: '蛇年生人在丁未年，火旺輔助，穩中求進，積累實力，明年更旺。',
  },
  馬: {
    overallScore: 4,
    overview: '丁未年午未六合，馬年生人有貴人合作，事業感情均有進展，是中上之年。',
    career:  { score: 4, summary: '有合作機會，善用人脈，合夥事業有好成績。' },
    wealth:  { score: 4, summary: '財運佳，透過合作或人際關係帶來財富，偏財不錯。' },
    love:    { score: 4, summary: '感情有進展，六合之年適合論及婚嫁，情侶關係升溫。' },
    health:  { score: 3, summary: '心臟循環需注意，避免過度操勞，保持運動習慣。' },
    family:  { score: 4, summary: '家庭喜氣洋洋，有喜事降臨的可能。' },
    luckyMonths: [1, 5, 9, 11],
    cautiousMonths: [2, 8],
    luckyColors: ['紅色', '紫色', '金色'],
    luckyNumbers: [3, 7, 9],
    advice: '今年善用六合之力，主動合作，廣結善緣，好運隨之而來。',
    blessing: '馬年生人在丁未年，午未相合，貴人在側，合作共贏，事業情感雙豐收。',
  },
  羊: {
    overallScore: 3,
    overview: '丁未年為羊年本命年，犯太歲之年。本命年運勢起伏較大，需戴紅、安太歲化解。',
    career:  { score: 3, summary: '工作有變動，可能有轉換跑道機會，需謹慎評估。' },
    wealth:  { score: 2, summary: '財運不穩，有意外支出，避免大額投資，量力而為。' },
    love:    { score: 3, summary: '感情需要更多溝通，避免因本命年浮躁影響關係。' },
    health:  { score: 3, summary: '本命年需注意意外傷害，出門多加小心，定期健檢。' },
    family:  { score: 3, summary: '家人是本命年最大的支持，多依靠家庭力量。' },
    luckyMonths: [4, 8, 12],
    cautiousMonths: [1, 7, 10],
    luckyColors: ['紅色', '粉色', '金色'],
    luckyNumbers: [2, 4, 8],
    advice: '本命年必須安太歲、戴紅、拜太歲，以神明庇護化解沖犯。',
    blessing: '羊年生人本命年雖有波折，但神明眷顧，積善行德，終能平安度過。',
  },
  猴: {
    overallScore: 3,
    overview: '丁未年申未相鄰，猴年生人運勢中平，整體穩定但缺乏驚喜，按部就班有收穫。',
    career:  { score: 3, summary: '工作按部就班，無大突破但也無大問題，積累經驗為主。' },
    wealth:  { score: 3, summary: '財運一般，勤勞有所得，投機類不宜涉足。' },
    love:    { score: 3, summary: '感情平穩，單身者可主動交際擴大圈子。' },
    health:  { score: 4, summary: '健康狀況良好，是提升體能的好時機。' },
    family:  { score: 3, summary: '家庭和諧，無大波折。' },
    luckyMonths: [2, 6, 10],
    cautiousMonths: [4, 8],
    luckyColors: ['白色', '金色', '銀色'],
    luckyNumbers: [4, 7, 8],
    advice: '今年適合充實自己，學習投資、技能提升，為未來儲備能量。',
    blessing: '猴年生人在丁未年，沉穩積累，待時機成熟，一飛沖天。',
  },
  雞: {
    overallScore: 3,
    overview: '丁未年酉未相合，有合作機會，雞年生人事業有貴人緣，整體運勢中上。',
    career:  { score: 4, summary: '貴人緣佳，合作共事機會多，主動把握能有好成績。' },
    wealth:  { score: 3, summary: '合作財運佳，獨自投資一般，適合找信任的夥伴共同理財。' },
    love:    { score: 3, summary: '感情有機會，但需要主動付出，緣分需要努力維繫。' },
    health:  { score: 3, summary: '注意呼吸道保養，避免過勞，作息規律。' },
    family:  { score: 4, summary: '家庭關係融洽，兄弟姊妹關係好。' },
    luckyMonths: [3, 6, 11],
    cautiousMonths: [2, 9],
    luckyColors: ['白色', '金色', '黃色'],
    luckyNumbers: [5, 6, 8],
    advice: '今年善用人脈，合作是財富和機遇的來源，獨行不如眾行。',
    blessing: '雞年生人在丁未年，酉未相合，貴人助陣，事業財運均有良機。',
  },
  狗: {
    overallScore: 2,
    overview: '丁未年戌未相刑，狗年生人需特別小心，工作感情均有壓力，宜拜神化解。',
    career:  { score: 2, summary: '工作壓力大，上下關係緊張，謹言慎行，避免衝突。' },
    wealth:  { score: 2, summary: '財運受阻，有漏財之象，保守理財，避免借貸。' },
    love:    { score: 2, summary: '感情易生口角，需大量溝通包容，避免小事變大事。' },
    health:  { score: 3, summary: '脾胃需調養，情緒管理很重要，避免鬱悶。' },
    family:  { score: 3, summary: '家人是支持力量，多花時間陪伴家人。' },
    luckyMonths: [2, 5, 10],
    cautiousMonths: [3, 6, 9],
    luckyColors: ['黃色', '棕色', '橙色'],
    luckyNumbers: [3, 5, 8],
    advice: '今年宜多拜太歲，保持低調，謹言慎行，逢凶化吉。',
    blessing: '狗年生人在丁未年，戌未相刑雖有壓力，但神明庇護，積善必能化解。',
  },
  豬: {
    overallScore: 5,
    overview: '丁未年亥卯未三合木局，豬年生人大旺之年！與兔年同為最吉，全面開花，諸事皆宜。',
    career:  { score: 5, summary: '事業旺盛，貴人湧現，是創業或升遷的絕佳時機，勇敢出發！' },
    wealth:  { score: 5, summary: '財運大旺，偏財正財齊至，投資理財均有豐厚回報。' },
    love:    { score: 5, summary: '感情豐收，單身者桃花朵朵開，情侶戀情更進一步，已婚者感情甜蜜。' },
    health:  { score: 4, summary: '身體狀況極佳，精力充沛，但注意別因忙碌忽視休息。' },
    family:  { score: 5, summary: '家庭喜事連連，有求嗣、添丁之望者今年最佳。' },
    luckyMonths: [2, 5, 8, 11],
    cautiousMonths: [4],
    luckyColors: ['綠色', '青色', '紫色'],
    luckyNumbers: [4, 8, 12],
    advice: '今年是人生難得的大吉之年，把握每一個機會，全速前進，好運連連！',
    blessing: '豬年生人在丁未年，三合大局，好運滔滔，諸事皆宜，大展鴻圖！',
  },
};

const MONTH_GANZHI_2027 = [
  '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午',
  '癸未', '甲申', '乙酉', '丙戌', '丁亥', '戊子',
];

function getMonthAdjustment2027(zodiac: string, monthIndex: number): number {
  const clashMap: Record<string, number[]> = {
    鼠: [1, 7],   牛: [0, 6],   虎: [3, 9],   兔: [2, 8],
    龍: [5, 11],  蛇: [4, 10],  馬: [1, 7],   羊: [0, 6],
    猴: [3, 9],   雞: [2, 8],   狗: [5, 11],  豬: [4, 10],
  };
  const clashes = clashMap[zodiac] ?? [];
  if (clashes.includes(monthIndex)) return -1;
  if (monthIndex === 6) return 1; // 癸未月，木旺助吉
  return 0;
}

export function getYearFortune2027(bazi: BaziInfo): YearFortune {
  const base = YEAR_FORTUNE_2027[bazi.zodiac] ?? YEAR_FORTUNE_2027['羊'];
  return { year: 2027, yearGanZhi: '丁未', yearZodiac: '羊', yearWuxing: '土', ...base };
}

export function getMonthFortune2027(bazi: BaziInfo, month: number): MonthFortune {
  const monthIndex = month - 1;
  const adj = getMonthAdjustment2027(bazi.zodiac, monthIndex);
  const yearData = YEAR_FORTUNE_2027[bazi.zodiac];
  const base = Math.max(1, Math.min(5, (yearData?.overallScore ?? 3) + adj));
  const isLucky = yearData?.luckyMonths.includes(month) ?? false;
  const isCautious = yearData?.cautiousMonths.includes(month) ?? false;
  const label = isLucky ? '吉' : isCautious ? '凶' : '平';
  const overviews: Record<string, string> = {
    吉: '本月是今年的吉月，運勢佳，可以積極推進重要事項，把握良機。',
    凶: '本月需要謹慎行事，避免衝動決策，守成為主，靜待時機。',
    平: '本月運勢平穩，按部就班做事，不宜冒進，也不必過於保守。',
  };
  const auspiciousDays = [2, 8, 14, 20, 26].map(d => d + (monthIndex % 4)).filter(d => d <= 28);
  return {
    year: 2027, month,
    monthGanZhi: MONTH_GANZHI_2027[monthIndex] ?? '',
    overallScore: base,
    overview: overviews[label],
    career:  { score: Math.max(1, base + (isLucky ? 1 : 0)), tip: isLucky ? '本月事業有貴人，適合主動出擊。' : '本月宜穩守，聚焦核心工作。' },
    wealth:  { score: Math.max(1, base + (isLucky ? 1 : -1)), tip: isLucky ? '本月財運旺，可適度投資。' : '本月財務謹慎，保守理財。' },
    love:    { score: Math.max(1, base), tip: isLucky ? '感情有進展，主動表達心意。' : '感情需要耐心，避免爭執。' },
    health:  { score: Math.max(1, base + (isCautious ? -1 : 0)), tip: isCautious ? '本月身體較弱，注意休養。' : '保持規律作息，運動有益。' },
    auspiciousDays,
    advice: isLucky ? `${month}月是你的吉月，主動出擊，把握機會！`
      : isCautious ? `${month}月需謹慎，凡事三思，多拜拜求平安。`
      : `${month}月平穩運行，腳踏實地，穩健前進。`,
  };
}

export function getFullYearMonthFortunes2027(bazi: BaziInfo): MonthFortune[] {
  return Array.from({ length: 12 }, (_, i) => getMonthFortune2027(bazi, i + 1));
}

// 統一入口：依年份取得年運
export function getYearFortuneByYear(bazi: BaziInfo, year: number): YearFortune {
  if (year === 2027) return getYearFortune2027(bazi);
  return getYearFortune(bazi); // 預設 2026
}
