// 神明資料 - 支援的神明與籤詩系統
import type { ImageSourcePropType } from 'react-native';
import { leiyushiPoems } from './poems/leiyushi';
import { jiazi60Poems } from './poems/jiazi60';
import { zhugeShenShuPoems } from './poems/zhugeShenShu';
import { guanyinLingQianPoems } from './poems/guanyinLingQian';
import { ershibaxiuPoems } from './poems/ershibaxiu';
import {
  baoshengHealthPoems,
  jigongLingQianPoems,
  santaiziBreakthroughPoems,
  yuelaoMarriagePoems,
} from './poems/godSpecific';

export interface God {
  id: number;
  name: string;
  title: string;          // 神號
  description: string;
  poemSystem: string;     // 籤詩系統
  totalPoems: number;
  image: ImageSourcePropType;
  blessing: string;       // 祝福語
  tagline: string;        // 視覺標語
  primaryColor: string;
  accentColor: string;
  auraColor: string;
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
    image: require('@/assets/images/gods/guanshengdijun.png'),
    blessing: '願帝君保佑你，忠義存心，正氣參天，事業順利。',
    tagline: '忠義正氣，護業鎮心',
    primaryColor: '#C0392B',
    accentColor: '#E0B04A',
    auraColor: '#F1C27D',
    category: 'war',
  },
  {
    id: 2,
    name: '觀世音菩薩',
    title: '觀世音菩薩',
    description: '大慈大悲救苦救難，聞聲救度。信眾祈求平安、健康、求子、化解災難。',
    poemSystem: '觀音靈籤',
    totalPoems: 100,
    image: require('@/assets/images/gods/guanyin.png'),
    blessing: '願菩薩慈悲護佑，聞聲救苦，有求必應，平安吉祥。',
    tagline: '慈光普照，聞聲救苦',
    primaryColor: '#D36BA1',
    accentColor: '#F5D37A',
    auraColor: '#F7D8E9',
    category: 'compassion',
  },
  {
    id: 3,
    name: '媽祖',
    title: '天上聖母',
    description: '海上守護神，台灣最普遍的信仰。庇佑航海平安、家庭和樂、事業順遂。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    image: require('@/assets/images/gods/mazu.png'),
    blessing: '願媽祖娘娘庇佑，風調雨順，闔家平安，一帆風順。',
    tagline: '聖母護航，闔境平安',
    primaryColor: '#1A69B5',
    accentColor: '#F2C15D',
    auraColor: '#9BD3F5',
    category: 'sea',
  },
  {
    id: 4,
    name: '王爺',
    title: '代天巡狩王爺',
    description: '代天巡狩，驅除瘟疫與災厄。台灣南部信仰興盛，以千歲、溫王爺等最著名。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    image: require('@/assets/images/gods/wangye.png'),
    blessing: '願王爺千歲護佑，驅邪除瘟，保境安民，家宅平安。',
    tagline: '代天巡狩，護境除穢',
    primaryColor: '#7D2B36',
    accentColor: '#D8A74E',
    auraColor: '#D9B38C',
    category: 'general',
  },
  {
    id: 5,
    name: '保生大帝',
    title: '保生大帝',
    description: '醫藥之神，精通醫術。信眾祈求身體健康、疾病痊癒、藥方有效。',
    poemSystem: '保生健康籤（雷雨師）',
    totalPoems: 100,
    image: require('@/assets/images/gods/baoshengdadi.png'),
    blessing: '願大帝慈悲醫治，藥到病除，身心安康，福壽綿長。',
    tagline: '慈心濟世，保生安康',
    primaryColor: '#2E7D32',
    accentColor: '#E7C15B',
    auraColor: '#A3D9A5',
    category: 'health',
  },
  {
    id: 6,
    name: '福德正神',
    title: '福德正神',
    description: '土地之神，掌管一方水土。信眾祈求家宅平安、生意興隆、出入平安。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    image: require('@/assets/images/gods/fudezhengshen.png'),
    blessing: '願土地公伯庇佑，家宅平安，財源廣進，出入順利。',
    tagline: '厚德載福，招財安宅',
    primaryColor: '#C08B2C',
    accentColor: '#F3D47C',
    auraColor: '#E6C68E',
    category: 'wealth',
  },
  {
    id: 7,
    name: '註生娘娘',
    title: '註生娘娘',
    description: '掌管生育與兒童守護之神。信眾祈求懷孕順產、孩子健康平安長大。',
    poemSystem: '六十甲子籤',
    totalPoems: 60,
    image: require('@/assets/images/gods/zhushengniangniang.png'),
    blessing: '願娘娘賜福送子，懷孕順產，孩兒健康，平安長大。',
    tagline: '送子賜福，安產護幼',
    primaryColor: '#C85C7D',
    accentColor: '#F3C56A',
    auraColor: '#F2C9D7',
    category: 'compassion',
  },
  {
    id: 8,
    name: '文昌帝君',
    title: '文昌帝君',
    description: '掌管文運與功名之神。學生與考生祈求考試順利、學業進步、金榜題名。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    image: require('@/assets/images/gods/wenchangdijun.png'),
    blessing: '願帝君開啟智慧，文思泉湧，考試順利，金榜題名。',
    tagline: '文運昌隆，啟智登科',
    primaryColor: '#4169B1',
    accentColor: '#F2C76B',
    auraColor: '#B8C9F0',
    category: 'general',
  },
  {
    id: 9,
    name: '孔明神數',
    title: '諸葛武侯',
    description: '傳說諸葛孔明依易經創制，問卜者報一數字，依易卦64爻推算人生吉凶。',
    poemSystem: '諸葛神數',
    totalPoems: 64,
    image: require('@/assets/images/gods/zhugewuhou.png'),
    blessing: '願智慧如諸葛，籌謀帷幄，決勝千里，謀事在人成事在天。',
    tagline: '智略通玄，洞察天機',
    primaryColor: '#547A63',
    accentColor: '#D8B76A',
    auraColor: '#B7D3C2',
    category: 'general',
  },
  {
    id: 10,
    name: '玄天上帝',
    title: '北極玄天上帝',
    description: '鎮守北方天門，腳踏龜蛇、手持七星伏魔劍。道號真武大帝，主掌斬妖除魔、消災解厄、鎮宅平安。信眾祈求事業穩固、小人退散、家運昌隆。',
    poemSystem: '二十八宿靈籤',
    totalPoems: 28,
    image: require('@/assets/images/gods/generated/cards/xuantianshangdi-card.png'),
    blessing: '願上帝公七星護佑，龜蛇鎮煞，妖邪退散，家宅平安，事業穩固如山。',
    tagline: '腳踏龜蛇，鎮煞伏魔',
    primaryColor: '#2C1B4D',
    accentColor: '#C9A84C',
    auraColor: '#4A3080',
    category: 'war',
  },
  {
    id: 11,
    name: '濟公活佛',
    title: '濟公活佛',
    description: '南宋高僧道濟禪師，形象破帽破扇破鞋，不受戒律拘束。以顛狂不羈之姿行走人間，專解疑難雜症，以幽默智慧化解煩憂。信眾求突破困境、化險為夷、心開意解。',
    poemSystem: '濟公活佛籤（雷雨師）',
    totalPoems: 100,
    image: require('@/assets/images/gods/generated/cards/jigonghuofo-card.png'),
    blessing: '願濟公師父慈悲點化，嬉笑怒罵皆智慧，煩惱執著都放下，一切隨緣自在。',
    tagline: '顛狂濟世，破迷開悟',
    primaryColor: '#6B3A2A',
    accentColor: '#F0C75E',
    auraColor: '#C4956A',
    category: 'general',
  },
  {
    id: 12,
    name: '三太子',
    title: '中壇元帥',
    description: '托塔天王李靖第三子哪吒三太子，手持乾坤圈、火尖槍，腳踏風火輪。少年英雄，剛猛直率，活潑熱情。信眾祈求事業衝刺、創意靈感、突破難關、身體健康。',
    poemSystem: '三太子衝關籤（六十甲子）',
    totalPoems: 60,
    image: require('@/assets/images/gods/generated/cards/santaizi-card.png'),
    blessing: '願三太子風火神威加持，勇猛精進不退縮，突破眼前的關卡，看見新的風景。',
    tagline: '風火少年，衝破難關',
    primaryColor: '#D93025',
    accentColor: '#F4A261',
    auraColor: '#F28B82',
    category: 'war',
  },
  {
    id: 13,
    name: '月下老人',
    title: '月下老人',
    description: '手持天下姻緣簿與紅絲線，專司人間男女婚姻。傳說月下老人以紅線繫住有緣男女的腳，千里姻緣一線牽。信眾祈求良緣、感情和合、婚姻美滿。',
    poemSystem: '月老姻緣籤（六十甲子）',
    totalPoems: 60,
    image: require('@/assets/images/gods/generated/cards/yuexialaoren-card.png'),
    blessing: '願月老慈悲牽紅線，良緣早成，心意相通，有情人終成眷屬。',
    tagline: '紅線牽緣，良人可期',
    primaryColor: '#C95B73',
    accentColor: '#F7C5CC',
    auraColor: '#FADADD',
    category: 'compassion',
  },
  {
    id: 14,
    name: '城隍爺',
    title: '城隍爺',
    description: '陰間司法神，掌理地方陰陽兩界事務，明察秋毫、賞善罰惡。職司保境安民、懲奸除惡。信眾祈求官司順利、是非分明、冤屈昭雪、消災解厄。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    image: require('@/assets/images/gods/generated/cards/chenghuangye-card.png'),
    blessing: '願城隍爺明鏡高懸，善有善報，冤屈得雪，是非分明，正義伸張。',
    tagline: '明鏡高懸，善惡分明',
    primaryColor: '#1A1A2E',
    accentColor: '#C9A84C',
    auraColor: '#2D2D44',
    category: 'war',
  },
  {
    id: 15,
    name: '呂洞賓',
    title: '孚佑帝君',
    description: '八仙中最著名的一位，道教全真派祖師，號純陽子。文武雙全，精通劍術、醫術與丹道。信眾祈求考試功名、身體健康、化解感情糾葛。',
    poemSystem: '雷雨師百首',
    totalPoems: 100,
    image: require('@/assets/images/gods/generated/cards/lvdongbin-card.png'),
    blessing: '願孚佑帝君純陽正氣加持，智慧清明，劍斬煩惱，功成名就，身心康泰。',
    tagline: '一劍斬煩惱，妙筆點功名',
    primaryColor: '#2D5F7C',
    accentColor: '#E8D5B0',
    auraColor: '#6BAAC4',
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
  if (god.poemSystem === '保生健康籤（雷雨師）') return baoshengHealthPoems;
  if (god.poemSystem === '濟公活佛籤（雷雨師）') return jigongLingQianPoems;
  if (god.poemSystem === '三太子衝關籤（六十甲子）') return santaiziBreakthroughPoems;
  if (god.poemSystem === '月老姻緣籤（六十甲子）') return yuelaoMarriagePoems;
  if (god.poemSystem === '諸葛神數') return zhugeShenShuPoems;
  if (god.poemSystem === '觀音靈籤') return guanyinLingQianPoems;
  if (god.poemSystem === '二十八宿靈籤') return ershibaxiuPoems;
  return leiyushiPoems;
}
