// 神明資料 - 支援的神明與籤詩系統
import { leiyushiPoems } from './poems/leiyushi';
import { jiazi60Poems } from './poems/jiazi60';
import { zhugeShenShuPoems } from './poems/zhugeShenShu';

export interface God {
  id: number;
  name: string;
  title: string;          // 神號
  description: string;
  poemSystem: string;     // 籤詩系統
  totalPoems: number;
  image?: string;         // 神像圖片(可選)
  blessing: string;       // 祝福語
  category: 'war' | 'compassion' | 'sea' | 'health' | 'wealth' | 'general';
}

export const gods: God[] = [
  {
    id: 1,
    name: '關聖帝君',
    title: '關聖帝君',
    description: '三界伏魔大帝，忠義之神，掌管文武、財運與事業。信眾多為求事業發展、考試順利、財運亨通。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    blessing: '願帝君保佑你，忠義存心，正氣參天，事業順利。',
    category: 'war',
  },
  {
    id: 2,
    name: '觀世音菩薩',
    title: '觀世音菩薩',
    description: '大慈大悲救苦救難，聞聲救度。信眾祈求平安、健康、求子、化解災難。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    blessing: '願菩薩慈悲護佑，聞聲救苦，有求必應，平安吉祥。',
    category: 'compassion',
  },
  {
    id: 3,
    name: '媽祖',
    title: '天上聖母',
    description: '海上守護神，台灣最普遍的信仰。庇佑航海平安、家庭和樂、事業順遂。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    blessing: '願媽祖娘娘庇佑，風調雨順，闔家平安，一帆風順。',
    category: 'sea',
  },
  {
    id: 4,
    name: '王爺',
    title: '代天巡狩王爺',
    description: '代天巡狩，驅除瘟疫與災厄。台灣南部信仰興盛，以千歲、溫王爺等最著名。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    blessing: '願王爺千歲護佑，驅邪除瘟，保境安民，家宅平安。',
    category: 'general',
  },
  {
    id: 5,
    name: '保生大帝',
    title: '保生大帝',
    description: '醫藥之神，精通醫術。信眾祈求身體健康、疾病痊癒、藥方有效。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    blessing: '願大帝慈悲醫治，藥到病除，身心安康，福壽綿長。',
    category: 'health',
  },
  {
    id: 6,
    name: '福德正神',
    title: '福德正神',
    description: '土地之神，掌管一方水土。信眾祈求家宅平安、生意興隆、出入平安。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    blessing: '願土地公伯庇佑，家宅平安，財源廣進，出入順利。',
    category: 'wealth',
  },
  {
    id: 7,
    name: '註生娘娘',
    title: '註生娘娘',
    description: '掌管生育與兒童守護之神。信眾祈求懷孕順產、孩子健康平安長大。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    blessing: '願娘娘賜福送子，懷孕順產，孩兒健康，平安長大。',
    category: 'compassion',
  },
  {
    id: 8,
    name: '文昌帝君',
    title: '文昌帝君',
    description: '掌管文運與功名之神。學生與考生祈求考試順利、學業進步、金榜題名。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    blessing: '願帝君開啟智慧，文思泉湧，考試順利，金榜題名。',
    category: 'general',
  },
  {
    id: 9,
    name: '孔明神數',
    title: '諸葛武侯',
    description: '傳說諸葛孔明依易經創制，問卜者報一數字，依易卦64爻推算人生吉凶。',
    poemSystem: '諸葛神數',
    totalPoems: 64,
    blessing: '願智慧如諸葛，籌謀帷幄，決勝千里，謀事在人成事在天。',
    category: 'general',
  },
];

// 問事類別
export const questionCategories = [
  { id: 'career', name: '事業工作', icon: '💼' },
  { id: 'love', name: '感情姻緣', icon: '💕' },
  { id: 'wealth', name: '財運投資', icon: '💰' },
  { id: 'health', name: '健康身體', icon: '🏥' },
  { id: 'study', name: '學業考試', icon: '📚' },
  { id: 'family', name: '家庭家運', icon: '🏠' },
  { id: 'travel', name: '出行遷移', icon: '✈️' },
  { id: 'general', name: '綜合運勢', icon: '🌟' },
];

// 根據神明ID取得對應的籤詩
export function getPoemsByGod(godId: number) {
  const god = gods.find(g => g.id === godId);
  if (!god) return leiyushiPoems;

  if (god.poemSystem === '六十甲子籤') return jiazi60Poems;
  if (god.poemSystem === '諸葛神數') return zhugeShenShuPoems;
  return leiyushiPoems;
}
