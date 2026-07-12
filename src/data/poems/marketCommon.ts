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

export const zhaogongming60Poems = buildMarketPoems({
  idOffset: 8000,
  count: 60,
  label: '五路財神六十籤',
  ganzhiPrefix: '玄壇',
  focusKey: 'wealth',
  focusLabel: '五路招財',
  titleSeed: '玄壇聚財・',
  storySeed: '本系統以趙公明護商、守信、聚財與風險節制的信仰語境整理，為 App 專屬白話籤系；',
  motifs: ['玄壇開路', '五路財臨', '黑虎守庫', '金鞭定局', '寶庫生光', '商道有信', '利市來朝', '財星入戶'],
  actions: ['先守信用再求財', '盤清現金流再擴張', '正財可取偏財宜慎', '合作條件務必寫清', '先止漏再談開源', '有利也要留風險餘地'],
});

export const huye36Poems = buildMarketPoems({
  idOffset: 8100,
  count: 36,
  label: '虎爺護境三十六籤',
  ganzhiPrefix: '虎將',
  focusKey: 'general',
  focusLabel: '護境招財',
  titleSeed: '虎將巡境・',
  storySeed: '本系統以虎爺守廟、護童、驅邪與民間招財信仰為語境整理，為 App 專屬白話籤系；',
  motifs: ['金虎巡門', '虎鈴輕響', '山君守庫', '虎威鎮煞', '童身得護', '虎步生風', '門庭清吉', '錢母有緣'],
  actions: ['先顧安全再求進展', '小心口舌與急躁', '守住家門與孩子平安', '正當求財不走捷徑', '察覺不對就先退開', '把環境整理乾淨再行動'],
});

export const jiutian49Poems = buildMarketPoems({
  idOffset: 8200,
  count: 49,
  label: '玄女兵法四十九籤',
  ganzhiPrefix: '玄女',
  focusKey: 'career',
  focusLabel: '策略布局',
  titleSeed: '玄女授策・',
  storySeed: '本系統以九天玄女智慧、兵法、護佑與女性力量的信仰語境整理，為 App 專屬策略型白話籤系；',
  motifs: ['九天垂象', '玄女授策', '星圖展卷', '鳳旗定向', '寶劍藏鋒', '雲陣開門', '月臺觀勢', '天書有序'],
  actions: ['先看全局再動一步', '藏鋒蓄勢等待時機', '分清主次再配置資源', '情報不足不宜硬攻', '以柔制剛保留後手', '選對盟友勝過單打獨鬥'],
});

export const taisui60Poems = buildMarketPoems({
  idOffset: 8300,
  count: 60,
  label: '甲子太歲六十籤',
  ganzhiPrefix: '太歲',
  focusKey: 'general',
  focusLabel: '流年安定',
  titleSeed: '太歲鎮年・',
  storySeed: '本系統以六十甲子、值年守護與流年自省為語境整理，為 App 專屬年度指引，並非代替正式安太歲科儀；',
  motifs: ['歲星臨位', '甲子循環', '星君鎮年', '斗柄回春', '元辰得護', '流年有序', '歲序更新', '星曜漸明'],
  actions: ['先修正能控制的風險', '年度大事宜留緩衝', '守規律比求速成重要', '出行財務都要多一層準備', '遇沖突先退讓一步', '以行善與責任累積福德'],
});
export const linshui36Poems = buildMarketPoems({
  idOffset: 8400,
  count: 36,
  label: '臨水夫人護幼三十六籤',
  ganzhiPrefix: '臨水',
  focusKey: 'health',
  focusLabel: '婦幼守護',
  titleSeed: '臨水護生・',
  storySeed: '本系統以臨水夫人陳靖姑護佑婦女、孕產、孩童與家庭照護的信仰語境整理，為 App 專屬白話籤系；',
  motifs: ['臨水護生', '紅燈照宅', '鳳冠垂佑', '清流安胎', '慈劍護門', '花蕊得護', '母子平安', '香火暖家'],
  actions: ['身體不適應及早就醫', '照護責任要共同分擔', '先安頓身心再做決定', '家庭期待需要說清楚', '保護孩子也要照顧自己', '遇到風險務必尋求專業協助'],
});

export const yimin40Poems = buildMarketPoems({
  idOffset: 8500,
  count: 40,
  label: '義民忠義四十籤',
  ganzhiPrefix: '義民',
  focusKey: 'career',
  focusLabel: '忠義守土',
  titleSeed: '義民守望・',
  storySeed: '本系統以臺灣客家義民信仰中的忠義、守土、團結與公共責任為語境整理，為 App 專屬白話籤系；',
  motifs: ['義旗守望', '忠魂護土', '庄頭同心', '藍衫聚力', '家園得守', '眾志成城', '公義有聲', '祖訓長明'],
  actions: ['先顧共同利益再爭個人得失', '責任分工務必公平', '團結比單打獨鬥更有力', '守住原則但避免意氣', '重大決定要讓眾人知情', '以長期家園為考量'],
});

export const confucius64Poems = buildMarketPoems({
  idOffset: 8600,
  count: 64,
  label: '至聖修學六十四籤',
  ganzhiPrefix: '至聖',
  focusKey: 'study',
  focusLabel: '修學立德',
  titleSeed: '至聖教誨・',
  storySeed: '本系統以孔子修學、立德、禮義與因材施教的思想語境整理，為 App 專屬教育型白話籤系；',
  motifs: ['杏壇春風', '詩書啟卷', '禮門漸開', '君子慎獨', '溫故知新', '有教無類', '學而時習', '仁心立志'],
  actions: ['先建立每日可持續的學習', '不懂就問並反覆練習', '品德與能力要一起成長', '選擇適合自己的方法', '先修正基礎再追求速度', '以誠信完成每一份責任'],
});

export const medicineBuddha48Poems = buildMarketPoems({
  idOffset: 8700,
  count: 48,
  label: '藥師琉璃四十八籤',
  ganzhiPrefix: '藥師',
  focusKey: 'health',
  focusLabel: '琉璃安身',
  titleSeed: '藥師願光・',
  storySeed: '本系統以藥師佛十二大願、身心安定、正念照護與求醫智慧為語境整理，為 App 專屬白話籤系；',
  motifs: ['琉璃光明', '藥樹舒葉', '淨水入盂', '蓮座安穩', '願光照身', '晨鐘定心', '善藥得時', '慈光護念'],
  actions: ['健康問題應尋求專業診療', '規律作息是復原根基', '先安定焦慮再安排照護', '遵從合理醫囑不迷信偏方', '照顧身體也照顧情緒', '需要協助時主動求助'],
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
  zhaogongming60Poems,
  huye36Poems,
  jiutian49Poems,
  taisui60Poems,
  linshui36Poems,
  yimin40Poems,
  confucius64Poems,
  medicineBuddha48Poems,
} as const;
