import type { JieYue, Poem } from './leiyushi';
import { leiyushiPoems } from './leiyushi';
import { ershibaxiuPoems } from './ershibaxiu';
import {
  guanyin24Poems, guanyin28Poems, lingyinghou60Poems, tianhouLingQianPoems,
} from './marketCommon';

type JieYueKey = keyof JieYue;

interface DeityFocusConfig {
  idOffset: number;
  systemName: string;
  versionTag: string;
  baseSystem: string;
  focusKey: JieYueKey;
  focusLabel: string;
  titlePrefix: string;
  storyPrefix: string;
  generalPrefix: string;
}

function buildDeityFocusedPoems(base: Poem[], config: DeityFocusConfig): Poem[] {
  return base.map((poem) => {
    const focused = poem.jieYue[config.focusKey];
    return {
      ...poem,
      id: config.idOffset + poem.number,
      title: config.titlePrefix + poem.title,
      story: config.storyPrefix + poem.story,
      jieYue: {
        ...poem.jieYue,
        [config.focusKey]: config.focusLabel + '專解：' + focused,
        ...(config.focusKey === 'general'
          ? {}
          : { general: config.generalPrefix + '：' + poem.jieYue.general }),
      },
    };
  });
}

const configs = {
  mazu: {
    idOffset: 7000,
    systemName: '媽祖天后百籤',
    versionTag: 'mazu-tianhou-100-focused-v1',
    baseSystem: '天后宮靈籤 App 白話整理版',
    focusKey: 'travel',
    focusLabel: '聖母護航',
    titlePrefix: '媽祖聖示・',
    storyPrefix: '本解讀層聚焦媽祖護航、家宅與遠行平安；底本為 App 天后宮百籤整理版，並非特定宮廟唯一定本。 ',
    generalPrefix: '媽祖提醒',
  },
  wenchang: {
    idOffset: 7200,
    systemName: '文昌功名百籤',
    versionTag: 'wenchang-leiyushi-100-focused-v1',
    baseSystem: '雷雨師百首 App 修訂版',
    focusKey: 'study',
    focusLabel: '功名學業',
    titlePrefix: '文昌策問・',
    storyPrefix: '本解讀層聚焦讀書、考試、文書與職涯精進；底本承接雷雨師百首 App 修訂版。 ',
    generalPrefix: '文昌帝君提醒',
  },
  xuantian: {
    idOffset: 7400,
    systemName: '玄天二十八宿籤',
    versionTag: 'xuantian-28-focused-v1',
    baseSystem: '二十八宿靈籤 App 白話版',
    focusKey: 'general',
    focusLabel: '鎮煞穩局',
    titlePrefix: '玄天鎮局・',
    storyPrefix: '本解讀層聚焦護境、止煞、是非與局勢穩定；底本為二十八宿 App 白話版。 ',
    generalPrefix: '玄天上帝提醒',
  },
  chenghuang: {
    idOffset: 7500,
    systemName: '城隍明鑑六十籤',
    versionTag: 'chenghuang-60-focused-v1',
    baseSystem: '靈應侯六十籤 App 白話整理版',
    focusKey: 'career',
    focusLabel: '公道文書',
    titlePrefix: '城隍明鑑・',
    storyPrefix: '本解讀層聚焦是非、公道、契約與責任歸屬；底本為靈應侯六十籤 App 整理版。 ',
    generalPrefix: '城隍爺提醒',
  },
  jinmu: {
    idOffset: 7600,
    systemName: '金母慈光二十八籤',
    versionTag: 'jinmu-28-focused-v1',
    baseSystem: '觀音廿八籤 App 白話整理版',
    focusKey: 'general',
    focusLabel: '慈光和合',
    titlePrefix: '金母慈示・',
    storyPrefix: '本解讀層聚焦身心和合、家庭、女性長輩緣與貴人助力；底本為觀音廿八籤 App 整理版。 ',
    generalPrefix: '瑤池金母提醒',
  },
  dizang: {
    idOffset: 7700,
    systemName: '地藏大願二十四籤',
    versionTag: 'dizang-24-focused-v1',
    baseSystem: '觀音二十四籤 App 白話整理版',
    focusKey: 'health',
    focusLabel: '安心解厄',
    titlePrefix: '地藏願行・',
    storyPrefix: '本解讀層聚焦失落安頓、家族牽掛、苦厄化解與修心；底本為觀音二十四籤 App 整理版。 ',
    generalPrefix: '地藏菩薩提醒',
  },
} as const satisfies Record<string, DeityFocusConfig>;

export const mazuFocusedPoems = buildDeityFocusedPoems(tianhouLingQianPoems, configs.mazu);
export const wenchangFocusedPoems = buildDeityFocusedPoems(leiyushiPoems, configs.wenchang);
export const xuantianFocusedPoems = buildDeityFocusedPoems(ershibaxiuPoems, configs.xuantian);
export const chenghuangFocusedPoems = buildDeityFocusedPoems(lingyinghou60Poems, configs.chenghuang);
export const jinmuFocusedPoems = buildDeityFocusedPoems(guanyin28Poems, configs.jinmu);
export const dizangFocusedPoems = buildDeityFocusedPoems(guanyin24Poems, configs.dizang);

export const deityFocusedSystemMeta = configs;