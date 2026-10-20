import type { JieYue, Poem } from './leiyushi';
import { leiyushiPoems } from './leiyushi';
import { jiazi60Poems } from './jiazi60';
import { guanyinLingQianPoems } from './guanyinLingQian';

type JieYueKey = keyof JieYue;

interface GodSpecificConfig {
  idOffset: number;
  label: string;
  baseSystem: string;
  focusKey: JieYueKey;
  focusLabel: string;
  titlePrefix: string;
  storyPrefix: string;
  generalPrefix: string;
  levelAdvice: Record<string, string>;
}

const DEFAULT_LEVEL_ADVICE: Record<string, string> = {
  '上上': '可順勢推進，但仍要把心念放正。',
  '大吉': '吉象已現，宜把握時機、穩穩落實。',
  '上吉': '方向可行，貴在循序而進。',
  '中吉': '有轉圜與成長空間，先做最清楚的一步。',
  '中平': '不急於求成，先把條件與節奏整理好。',
  '中下': '眼前不宜強求，先退一步修整。',
  '下下': '暫緩重大決定，先避開風險與情緒衝動。',
};

function adviceForLevel(config: GodSpecificConfig, level: string): string {
  return config.levelAdvice[level] ?? DEFAULT_LEVEL_ADVICE[level] ?? DEFAULT_LEVEL_ADVICE['中平'];
}

function buildFocusedJieYue(poem: Poem, config: GodSpecificConfig): JieYue {
  const advice = adviceForLevel(config, poem.level);
  const originalFocus = poem.jieYue[config.focusKey];

  return {
    ...poem.jieYue,
    [config.focusKey]: `${config.focusLabel}專解：${originalFocus}。${advice}`,
    ...(config.focusKey !== 'general' && {
      general: `${config.generalPrefix}：${poem.jieYue.general}。${advice}`,
    }),
  };
}

function buildGodSpecificPoems(basePoems: Poem[], config: GodSpecificConfig): Poem[] {
  return basePoems.map((poem) => ({
    ...poem,
    id: config.idOffset + poem.number,
    title: `${config.titlePrefix}${poem.title}`,
    story: `${config.storyPrefix}${poem.story}`,
    jieYue: buildFocusedJieYue(poem, config),
  }));
}

const baoshengConfig: GodSpecificConfig = {
  idOffset: 5000,
  label: '保生健康籤',
  baseSystem: '雷雨師百首',
  focusKey: 'health',
  focusLabel: '身心調養',
  titlePrefix: '保生醫籤・',
  storyPrefix: '保生大帝籤解以身心調養、疾病復原與生活節律為主軸；此籤承接雷雨師百首原意，轉作健康請示的白話指引。 ',
  generalPrefix: '保生大帝提醒',
  levelAdvice: {
    ...DEFAULT_LEVEL_ADVICE,
    '下下': '宜及早休養、求醫諮詢，重大身體訊號不可拖延。',
    '中平': '先調作息與飲食，按部就班比急求速效更穩。',
  },
};

const jigongConfig: GodSpecificConfig = {
  idOffset: 5100,
  label: '濟公活佛籤',
  baseSystem: '雷雨師百首',
  focusKey: 'general',
  focusLabel: '破迷開悟',
  titlePrefix: '濟公點化・',
  storyPrefix: '濟公活佛籤解以破執、轉念與看穿困局為主軸；此籤承接雷雨師百首原意，轉作疑難雜症與心結請示的白話指引。 ',
  generalPrefix: '濟公師父點化',
  levelAdvice: {
    ...DEFAULT_LEVEL_ADVICE,
    '大吉': '看似順利時更要自在不貪，順手做一件善事會更穩。',
    '下下': '先別硬拗，換個角度看，往往路就開了。',
  },
};

const santaiziConfig: GodSpecificConfig = {
  idOffset: 5200,
  label: '三太子衝關籤',
  baseSystem: '六十甲子籤',
  focusKey: 'career',
  focusLabel: '行動突破',
  titlePrefix: '太子衝關・',
  storyPrefix: '三太子籤解以行動力、突破卡關與少年神勇為主軸；此籤承接六十甲子原意，轉作衝刺、創意與難關突破的白話指引。 ',
  generalPrefix: '三太子提醒',
  levelAdvice: {
    ...DEFAULT_LEVEL_ADVICE,
    '上上': '可以衝，但先定目標與界線，力量才不會散掉。',
    '下下': '火氣太旺反傷自己，先煞車、重整隊形再出發。',
  },
};

const fudezhengshenConfig: GodSpecificConfig = {
  idOffset: 5400,
  label: '土地公厚德籤',
  baseSystem: '六十甲子籤',
  focusKey: 'wealth',
  focusLabel: '厚德招財',
  titlePrefix: '土地厚德・',
  storyPrefix: '福德正神籤解以家宅平安、生意興隆與出入順利為主軸；此籤承接六十甲子原意，轉作財務與家宅請示的白話指引。 ',
  generalPrefix: '福德正神提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const sanguanConfig: GodSpecificConfig = {
  idOffset: 5450,
  label: '三官賜福籤',
  baseSystem: '六十甲子籤',
  focusKey: 'general',
  focusLabel: '賜福赦罪',
  titlePrefix: '三官賜福・',
  storyPrefix: '三官大帝籤解以天官賜福、地官赦罪、水官解厄為主軸；此籤承接六十甲子原意，轉作年運與消災請示的白話指引。 ',
  generalPrefix: '三官大帝提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const zhaogongmingConfig: GodSpecificConfig = {
  idOffset: 5700,
  label: '五路聚財籤',
  baseSystem: '雷雨師百首',
  focusKey: 'wealth',
  focusLabel: '五路聚財',
  titlePrefix: '玄壇聚財・',
  storyPrefix: '玄壇元帥趙公明籤解以正財、信用與現金流節制為主軸；此籤承接雷雨師百首原意，轉作生意與財務請示的白話指引。 ',
  generalPrefix: '玄壇元帥提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const huyeConfig: GodSpecificConfig = {
  idOffset: 5800,
  label: '虎威護境籤',
  baseSystem: '六十甲子籤',
  focusKey: 'general',
  focusLabel: '虎威護境',
  titlePrefix: '虎威護境・',
  storyPrefix: '虎爺籤解以護廟鎮煞、守護孩童與正財節奏為主軸；此籤承接六十甲子原意，轉作居家安全與求財請示的白話指引。 ',
  generalPrefix: '虎爺將軍提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const jiutianxuannuConfig: GodSpecificConfig = {
  idOffset: 5900,
  label: '玄女兵法籤',
  baseSystem: '雷雨師百首',
  focusKey: 'career',
  focusLabel: '九天授策',
  titlePrefix: '九天授策・',
  storyPrefix: '九天玄女籤解以布局、策略與危機判斷為主軸；此籤承接雷雨師百首原意，轉作事業競爭請示的白話指引。 ',
  generalPrefix: '九天玄女提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const taisuiConfig: GodSpecificConfig = {
  idOffset: 6000,
  label: '太歲鎮年籤',
  baseSystem: '六十甲子籤',
  focusKey: 'general',
  focusLabel: '太歲鎮年',
  titlePrefix: '太歲鎮年・',
  storyPrefix: '太歲星君籤解以流年秩序、風險防範與元辰安定為主軸；此籤承接六十甲子原意，轉作年度規劃請示的白話指引。 ',
  generalPrefix: '值年太歲星君提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const yiminyeConfig: GodSpecificConfig = {
  idOffset: 6200,
  label: '義民忠義籤',
  baseSystem: '六十甲子籤',
  focusKey: 'general',
  focusLabel: '忠義守土',
  titlePrefix: '義民守土・',
  storyPrefix: '義民爺籤解以忠義、守土與團隊責任為主軸；此籤承接六十甲子原意，轉作地方事務與團隊合作請示的白話指引。 ',
  generalPrefix: '義民爺提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

const medicineBuddhaConfig: GodSpecificConfig = {
  idOffset: 6300,
  label: '藥師護念籤',
  baseSystem: '觀音靈籤',
  focusKey: 'health',
  focusLabel: '藥師護念',
  titlePrefix: '藥師護念・',
  storyPrefix: '藥師佛籤解以身心安定、求醫心態與復原規律為主軸；此籤承接觀音靈籤原意，轉作健康照護請示的白話指引。 ',
  generalPrefix: '藥師佛提醒',
  levelAdvice: DEFAULT_LEVEL_ADVICE,
};

export const baoshengHealthPoems = buildGodSpecificPoems(leiyushiPoems, baoshengConfig);
export const jigongLingQianPoems = buildGodSpecificPoems(leiyushiPoems, jigongConfig);
export const santaiziBreakthroughPoems = buildGodSpecificPoems(jiazi60Poems, santaiziConfig);
export const fudezhengshenBlessingPoems = buildGodSpecificPoems(jiazi60Poems, fudezhengshenConfig);
export const sanguanBlessingPoems = buildGodSpecificPoems(jiazi60Poems, sanguanConfig);
export const zhaogongmingWealthPoems = buildGodSpecificPoems(leiyushiPoems, zhaogongmingConfig);
export const huyeGuardPoems = buildGodSpecificPoems(jiazi60Poems, huyeConfig);
export const jiutianxuannuStrategyPoems = buildGodSpecificPoems(leiyushiPoems, jiutianxuannuConfig);
export const taisuiPoems = buildGodSpecificPoems(jiazi60Poems, taisuiConfig);
export const yiminyePoems = buildGodSpecificPoems(jiazi60Poems, yiminyeConfig);
export const medicineBuddhaPoems = buildGodSpecificPoems(guanyinLingQianPoems, medicineBuddhaConfig);

export const godSpecificPoemSystemMeta = {
  baosheng: baoshengConfig,
  jigong: jigongConfig,
  santaizi: santaiziConfig,
  fudezhengshen: fudezhengshenConfig,
  sanguan: sanguanConfig,
  zhaogongming: zhaogongmingConfig,
  huye: huyeConfig,
  jiutianxuannu: jiutianxuannuConfig,
  taisui: taisuiConfig,
  yiminye: yiminyeConfig,
  medicineBuddha: medicineBuddhaConfig,
} as const;
