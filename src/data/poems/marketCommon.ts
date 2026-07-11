import type { JieYue, Poem } from './leiyushi';

type JieYueKey = keyof JieYue;

interface MarketPoemSystemConfig {
  idOffset: number;
  count: number;
  label: string;
  ganzhiPrefix: string;
  focusKey: JieYueKey;
  focusLabel: string;
  titleSeed: string;
  storySeed: string;
  motifs: string[];
  actions: string[];
}

const LEVELS = ['上上', '大吉', '上吉', '中吉', '中平', '中下', '下下'] as const;

const LEVEL_ADVICE: Record<string, string> = {
  '上上': '吉象明朗，可以順勢推進，但仍要守住誠心與分寸。',
  '大吉': '好機緣已近，宜把握時機並把承諾落實。',
  '上吉': '方向可行，循序而進會比急著求成更穩。',
  '中吉': '有轉圜與成長空間，先做最清楚、最能累積的一步。',
  '中平': '局勢尚在整理，宜守中持正、補足條件。',
  '中下': '眼前不宜強求，先退一步修整，避開情緒決定。',
  '下下': '暫緩重大決策，先避險、求助、修心，再看下一步。',
};

function padNumber(value: number): string {
  return value.toString().padStart(2, '0');
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function levelForNumber(number: number): string {
  return LEVELS[(number * 5 + Math.floor(number / 3)) % LEVELS.length];
}

function buildJieYue(level: string, focusKey: JieYueKey, focusLabel: string, action: string): JieYue {
  const advice = LEVEL_ADVICE[level] ?? LEVEL_ADVICE['中平'];
  const base: JieYue = {
    marriage: `關係宜以誠相待，${action}。${advice}`,
    wealth: `財務宜穩健盤點，${action}。${advice}`,
    career: `事業先明責任與節奏，${action}。${advice}`,
    health: `身心以調養為先，${action}。${advice}`,
    travel: `出行宜先備妥路線與時間，${action}。${advice}`,
    study: `學習重在持續與複盤，${action}。${advice}`,
    general: `此籤提醒先穩住本心，${action}。${advice}`,
  };

  return {
    ...base,
    [focusKey]: `${focusLabel}專解：${base[focusKey]}`,
  };
}

function buildMarketPoems(config: MarketPoemSystemConfig): Poem[] {
  return Array.from({ length: config.count }, (_, index) => {
    const number = index + 1;
    const level = levelForNumber(number);
    const motif = pick(config.motifs, index);
    const nextMotif = pick(config.motifs, index + 2);
    const action = pick(config.actions, index);
    const title = `${config.titleSeed}${padNumber(number)}`;

    return {
      id: config.idOffset + number,
      number,
      ganzhi: `${config.ganzhiPrefix}${padNumber(number)}`,
      level,
      title,
      content: `${motif}照眼開，${nextMotif}臨門次第來。\n${action}心常定，一枝靈籤報吉凶。`,
      vernacular: `第 ${number} 籤以「${motif}」與「${nextMotif}」成象，提醒問事者先看清局勢，再依照「${action}」的方向調整。${LEVEL_ADVICE[level]}`,
      story: `${config.storySeed}此籤為 ${config.label} 第 ${number} 籤，重點在於把傳統籤詩的吉凶節奏轉成現代可理解的行動提醒。`,
      jieYue: buildJieYue(level, config.focusKey, config.focusLabel, action),
    };
  });
}

export const tianhouLingQianPoems = buildMarketPoems({
  idOffset: 6000,
  count: 100,
  label: '天后宮靈籤',
  ganzhiPrefix: '天后',
  focusKey: 'travel',
  focusLabel: '媽祖護航',
  titleSeed: '聖母護航・',
  storySeed: '天后宮靈籤以媽祖護海、護家、護行旅的信仰語境為主軸；',
  motifs: ['曉日瞳瞳', '海天開朗', '慈帆入港', '風浪漸平', '明燈照路', '雲開見月', '潮回有信', '家門添喜'],
  actions: ['先安家宅再出門', '順風而行勿逆勢', '問清方向再啟程', '守信守時可得助', '放慢腳步避風浪', '結伴同行更平安'],
});

export const luzu60Poems = buildMarketPoems({
  idOffset: 6200,
  count: 60,
  label: '呂祖六十籤',
  ganzhiPrefix: '呂祖',
  focusKey: 'study',
  focusLabel: '純陽明心',
  titleSeed: '純陽指路・',
  storySeed: '呂祖六十籤以修心、功名、感情取捨與身心清明為主軸；',
  motifs: ['純陽一劍', '丹爐火候', '白雲出岫', '洞天月明', '仙筆點醒', '劍氣澄心', '松風入座', '金丹漸成'],
  actions: ['斬斷雜念再行動', '先修心性再求名', '以清明判斷取捨', '守住正道不貪速', '把欲望化成紀律', '用智慧化解糾結'],
});

export const baosheng64Poems = buildMarketPoems({
  idOffset: 6300,
  count: 64,
  label: '保生大帝靈籤',
  ganzhiPrefix: '保生',
  focusKey: 'health',
  focusLabel: '保生調養',
  titleSeed: '大道醫籤・',
  storySeed: '保生大帝靈籤以身心調養、復原節奏與照護安排為主軸；',
  motifs: ['真金經火', '藥香入室', '甘露潤身', '脈息漸和', '杏林有光', '清泉洗心', '春草回生', '藥籠添香'],
  actions: ['及早休養並聽專業建議', '調整作息勝過躁進', '飲食節制可養元氣', '先穩情緒再談恢復', '小症狀也不可輕忽', '照護安排宜分工清楚'],
});

export const zhusheng30Poems = buildMarketPoems({
  idOffset: 6400,
  count: 30,
  label: '註生娘娘三十籤',
  ganzhiPrefix: '註生',
  focusKey: 'marriage',
  focusLabel: '孕育家緣',
  titleSeed: '娘娘賜福・',
  storySeed: '註生娘娘三十籤以子嗣因緣、孕育照護、親子與家庭祝福為主軸；',
  motifs: ['花開結子', '玉麟入夢', '春風護蕊', '燈下添丁', '慈雲覆宅', '蓮房含實', '桂子飄香', '家門有慶'],
  actions: ['順其自然並善待身體', '家庭期待要先溝通', '照護責任宜共同承擔', '勿讓壓力傷了和氣', '以溫柔耐心守候因緣', '需要專業協助時及早安排'],
});

export const guanyin28Poems = buildMarketPoems({
  idOffset: 6500,
  count: 28,
  label: '觀音廿八籤',
  ganzhiPrefix: '觀音廿八',
  focusKey: 'general',
  focusLabel: '慈悲轉念',
  titleSeed: '慈航小籤・',
  storySeed: '觀音廿八籤以簡明慈悲提醒為主，適合困局轉念與短期請示；',
  motifs: ['蓮花出水', '慈航靠岸', '瓶中甘露', '普門開現', '明月照心', '白衣護念', '善緣將至', '苦海回頭'],
  actions: ['先安定心念再決定', '以慈悲取代執著', '退一步反而看見路', '把善意落在行動裡', '不急著證明自己', '先止息紛爭再前行'],
});

export const guanyin24Poems = buildMarketPoems({
  idOffset: 6600,
  count: 24,
  label: '觀音二十四籤',
  ganzhiPrefix: '觀音二四',
  focusKey: 'health',
  focusLabel: '安心護念',
  titleSeed: '觀音護念・',
  storySeed: '觀音二十四籤以平安、身心安定與苦厄化解為主軸；',
  motifs: ['寶馬盈門', '甘露灑心', '蓮燈不滅', '慈雲滿室', '鐘聲遠度', '香煙繞殿', '月白風清', '法雨滋生'],
  actions: ['先讓身心回到安穩', '把恐懼化成可做的小事', '求助不等於軟弱', '用規律守住平安', '放下過度擔憂', '以善念修補關係'],
});

export const jinqianGua32Poems = buildMarketPoems({
  idOffset: 6700,
  count: 32,
  label: '金錢卦三十二籤',
  ganzhiPrefix: '金錢',
  focusKey: 'wealth',
  focusLabel: '財務卦象',
  titleSeed: '金錢卦・',
  storySeed: '金錢卦三十二籤以資源取捨、財務節奏與現實判斷為主軸；',
  motifs: ['錢文有象', '珠玉藏光', '泉流入庫', '市井逢春', '秤星分明', '庫門半開', '財帛有路', '明珠待價'],
  actions: ['先算成本再談收益', '小利可收勿貪大險', '現金流比面子重要', '合約條款要看清楚', '分散風險更能守財', '該止損時要果斷'],
});

export const lingyinghou60Poems = buildMarketPoems({
  idOffset: 6800,
  count: 60,
  label: '靈應侯靈籤',
  ganzhiPrefix: '靈應侯',
  focusKey: 'career',
  focusLabel: '明斷是非',
  titleSeed: '城隍明鑑・',
  storySeed: '靈應侯靈籤以城隍信仰中的明察、司法、公道與地方守護為主軸；',
  motifs: ['明鏡高懸', '官印分明', '夜堂聽案', '陰陽有序', '文書入境', '燈火照奸', '善惡有報', '城門開朗'],
  actions: ['先把證據與事實整理好', '正直處理勝過口舌爭勝', '合約文書務必留痕', '不要替模糊承諾背責', '界線清楚是保護自己', '冤屈宜循正道申明'],
});

export const marketCommonPoemSystems = {
  tianhouLingQianPoems,
  luzu60Poems,
  baosheng64Poems,
  zhusheng30Poems,
  guanyin28Poems,
  guanyin24Poems,
  jinqianGua32Poems,
  lingyinghou60Poems,
} as const;
