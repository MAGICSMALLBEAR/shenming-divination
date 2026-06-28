import type { JieYue, Poem } from './leiyushi';
import { leiyushiPoems } from './leiyushi';
import { jiazi60Poems } from './jiazi60';

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
    general: `${config.generalPrefix}：${poem.jieYue.general}。${advice}`,
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

const yuelaoConfig: GodSpecificConfig = {
  idOffset: 5300,
  label: '月老姻緣籤',
  baseSystem: '六十甲子籤',
  focusKey: 'marriage',
  focusLabel: '姻緣紅線',
  titlePrefix: '月老紅線・',
  storyPrefix: '月老籤解以姻緣、關係修復與相處時機為主軸；此籤承接六十甲子原意，轉作感情請示的白話指引。 ',
  generalPrefix: '月老提醒',
  levelAdvice: {
    ...DEFAULT_LEVEL_ADVICE,
    '上上': '紅線有力，宜真誠表達，也要尊重對方節奏。',
    '中平': '緣分仍在整理，先把溝通方式變溫柔。',
    '下下': '不宜強求，先照顧自己的界線與安全感。',
  },
};

export const baoshengHealthPoems = buildGodSpecificPoems(leiyushiPoems, baoshengConfig);
export const jigongLingQianPoems = buildGodSpecificPoems(leiyushiPoems, jigongConfig);
export const santaiziBreakthroughPoems = buildGodSpecificPoems(jiazi60Poems, santaiziConfig);
export const yuelaoMarriagePoems = buildGodSpecificPoems(jiazi60Poems, yuelaoConfig);

export const godSpecificPoemSystemMeta = {
  baosheng: baoshengConfig,
  jigong: jigongConfig,
  santaizi: santaiziConfig,
  yuelao: yuelaoConfig,
} as const;
