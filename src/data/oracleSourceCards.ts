/**
 * 籤本來源卡：以「底本」為單位記錄出處、版本、來源、權利與上架紀錄。
 *
 * 許多神明共用同一套底本（雷雨師、六十甲子、觀音），只在白話與解曰上做專屬改寫，
 * 所以來源卡掛在底本上，再以實際抽到的籤詩原文對應回神明，不另外維護神明對照表。
 * 只記錄 repo 內有紀錄可查的資訊；沒有紀錄的欄位一律標 ORACLE_SOURCE_PENDING，不自行推定。
 */
import { gods, getPoemsByGod, type God } from './gods';
import type { YuelaoEdition } from './yuelaoEdition';
import type { Poem } from './poems/leiyushi';
import { leiyushiPoems } from './poems/leiyushi';
import { jiazi60Poems } from './poems/jiazi60';
import { guanyinLingQianPoems } from './poems/guanyinLingQian';
import { huangdaxianPoems } from './poems/huangdaxian';
import { chegongPoems } from './poems/chegong';
import { xuantianLingqianPoems } from './poems/xuantianLingqian';
import { zhushengLingqianPoems } from './poems/zhushengLingqian';
import { linshuiWeifangPoems } from './poems/linshuiWeifang';
import { yuelaoHongKongPoems, yuelaoTaiwanPoems } from './poems/yuelao';
import { kongziShengqianPoems } from './poems/kongziShengqian';
import { luzuZhinanPoems } from './poems/luzuZhinan';
import { zhugeShenShuPoems } from './poems/zhugeShenShu';
import { qingshuiZushiPoems } from './poems/qingshuiZushi';
import { baoshengBaoanPoems } from './poems/baoshengBaoan';

export const ORACLE_SOURCE_PENDING = '待補';

export interface OracleSourceLink {
  label: string;
  url?: string;
}

export interface OracleSourceCard {
  id: string;
  title: string;
  origin: string;
  edition: string;
  totalPoems: number;
  sources: OracleSourceLink[];
  sourceGapNote?: string;
  originalImages: string;
  rights: string;
  reviewer: string;
  listedAt: string;
  listedCommit: string;
  withdrawal: string;
  poems: readonly Poem[];
}

type CardInput = Omit<OracleSourceCard, 'totalPoems' | 'reviewer' | 'withdrawal'>;

function card(input: CardInput): OracleSourceCard {
  return {
    ...input,
    totalPoems: input.poems.length,
    reviewer: ORACLE_SOURCE_PENDING,
    withdrawal: ORACLE_SOURCE_PENDING,
  };
}

const kanripo = (id: string, title: string): OracleSourceLink => ({
  label: `Kanripo《正統道藏》數位版 ${id}（${title}）`,
  url: `https://github.com/kanripo/${id}`,
});

const DAOZANG_RIGHTS = '《正統道藏》明代刊本，原文屬公有領域；白話、籤題與解曰為本 App 撰寫。';
const DAOZANG_IMAGES = '未取得刊本影像；依 Kanripo 數位文字版（底本三家本）。';
const NO_IMAGES = '未取得';
const RIGHTS_PENDING = '待確認；白話、籤題與解曰為本 App 撰寫。';

export const oracleSourceCards: OracleSourceCard[] = [
  card({
    id: 'leiyushi-100',
    title: '雷雨師百首（關聖帝君靈籤）',
    origin: '行天宮、城隍廟等台灣廟宇通行；即《正統道藏》護國嘉濟江東王靈籤',
    edition: '台灣現行版本；2026-10-17 以道藏三方比對修正 7 處錯字',
    sources: [
      { label: 'fortune-poems.blogspot.com', url: 'https://fortune-poems.blogspot.com/' },
      { label: 'stellarnier.com', url: 'https://stellarnier.com/' },
      { label: 'fate.superd.org', url: 'https://fate.superd.org/' },
      kanripo('KR5g0114', '護國嘉濟江東王靈籤'),
      { label: '台灣好廟網 關聖帝君一百籤', url: 'https://temples.tw/stick/fs100' },
    ],
    originalImages: NO_IMAGES,
    rights: '同一套籤見於《正統道藏》明代刊本，原文屬公有領域；白話與解曰為本 App 撰寫。',
    listedAt: '2026-10-17',
    listedCommit: 'a3abf06',
    poems: leiyushiPoems,
  }),
  card({
    id: 'jiazi-60',
    title: '六十甲子籤',
    origin: '媽祖廟、王爺廟、土地公廟、天公廟等台灣廟宇通行',
    edition: '傳統定本，保留六十甲子排序；2026-10-23 三方比對修正 6 首，#55 因押韻保留',
    sources: [
      { label: '台灣好廟網 六十甲子籤', url: 'https://temples.tw/stick/fs60' },
      { label: '台東東海龍門天聖宮官網 媽祖靈籤', url: 'https://donghaimazu.com/post/fortune-sticks/fs01/' },
      { label: '籤詩網 六十甲子籤', url: 'http://www.chance.org.tw/' },
    ],
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-23',
    listedCommit: 'f658181',
    poems: jiazi60Poems,
  }),
  card({
    id: 'guanyin-100',
    title: '觀音靈籤百首',
    origin: '艋舺龍山寺等觀音廟宇通行',
    edition: '2026-10-23 三方比對修正 3 首；第 100 籤主詩依籤本「詩曰一」',
    sources: [
      { label: '台灣好廟網 觀音一百籤', url: 'https://temples.tw/stick/fs_yin100' },
      { label: '籤詩網 觀音一百籤', url: 'http://www.chance.org.tw/' },
      { label: 'fortune-poems〈觀音靈籤百首目錄〉', url: 'http://fortune-poems.blogspot.com/2011/03/blog-post_18.html' },
    ],
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-23',
    listedCommit: 'f658181',
    poems: guanyinLingQianPoems,
  }),
  card({
    id: 'huangdaxian-100',
    title: '黃大仙靈籤一百首',
    origin: '香港嗇色園黃大仙祠',
    edition: '三方多數決定字；2026-10-17 修正 4 處錯字',
    sources: [
      { label: '香港算命王 m.hkir.com', url: 'https://m.hkir.com/chouqian/huangdaxian/' },
      { label: 'golla.tw', url: 'https://www.golla.tw/chouqian/huangdaxian/' },
      { label: 'hktemple88.blogspot.com', url: 'https://hktemple88.blogspot.com/' },
      { label: '台灣好廟網（複查用）', url: 'https://temples.tw/stick/fs_hdx100' },
    ],
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-17',
    listedCommit: 'c92519c',
    poems: huangdaxianPoems,
  }),
  card({
    id: 'chegong-96',
    title: '車公靈籤九十六首',
    origin: '香港沙田車公廟',
    edition: '三方逐字比對，差異僅異體字',
    sources: [
      { label: 'qian.time.actor', url: 'https://qian.time.actor/chegong/1' },
      { label: 'hktemple88.blogspot.com', url: 'https://hktemple88.blogspot.com/' },
      { label: 'sheup.org', url: 'https://sheup.org/' },
    ],
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-16',
    listedCommit: 'c5d37f8',
    poems: chegongPoems,
  }),
  card({
    id: 'xuantian-daozang-49',
    title: '玄天上帝感應靈籤四十九首',
    origin: '《正統道藏》續道藏《玄天上帝百字聖號》（DZ1482）',
    edition: '原典；#40 缺字以「□」保留',
    sources: [kanripo('KR5h0052', '玄天上帝百字聖號')],
    originalImages: DAOZANG_IMAGES,
    rights: DAOZANG_RIGHTS,
    listedAt: '2026-10-17',
    listedCommit: '575d149',
    poems: xuantianLingqianPoems,
  }),
  card({
    id: 'zhusheng-daozang-64',
    title: '靈濟真君注生堂靈籤六十四首',
    origin: '《正統道藏》；原為靈濟真君（徐仙）信仰的求嗣籤',
    edition: '原典',
    sources: [kanripo('KR5g0111', '靈濟真君注生堂靈籤')],
    originalImages: DAOZANG_IMAGES,
    rights: DAOZANG_RIGHTS,
    listedAt: '2026-10-17',
    listedCommit: '4811f5f',
    poems: zhushengLingqianPoems,
  }),
  card({
    id: 'linshui-daozang-99',
    title: '九天衛房聖母元君靈應寶籤九十九首',
    origin: '《正統道藏》正一部（DZ1300）',
    edition: '原典；#28 缺字以「□」保留',
    sources: [kanripo('KR5g0109', '大慈好生九天衛房聖母元君靈應寶籤')],
    originalImages: DAOZANG_IMAGES,
    rights: DAOZANG_RIGHTS,
    listedAt: '2026-10-19',
    listedCommit: 'f11a0dc',
    poems: linshuiWeifangPoems,
  }),
  card({
    id: 'yuelao-taiwan-100',
    title: '月老聖籤一百籤（台灣版）',
    origin: '新竹普天宮',
    edition: '籤號依好廟網；錯字可考出處者依原典定字',
    sources: [{ label: '台灣好廟網 月老籤', url: 'https://temples.tw/stick/fs_yuelao' }],
    sourceGapNote: '籤號排序只有一個來源。',
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-19',
    listedCommit: '62bb27a',
    poems: yuelaoTaiwanPoems,
  }),
  card({
    id: 'yuelao-hongkong-101',
    title: '月老靈簽一百零一簽（香港版）',
    origin: '香港通行',
    edition: '籤號與吉凶依 golla／hkir；錯字可考出處者依原典定字',
    sources: [
      { label: 'golla.tw', url: 'https://www.golla.tw/chouqian/yuelao/' },
      { label: '香港算命王 m.hkir.com', url: 'https://m.hkir.com/chouqian/yuelao/' },
    ],
    sourceGapNote: '兩站錯字相同，屬同一來源。',
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-19',
    listedCommit: '62bb27a',
    poems: yuelaoHongKongPoems,
  }),
  card({
    id: 'kongzi-wenwu-72',
    title: '孔子聖籤七十二首',
    origin: '南投日月潭文武廟',
    edition: '依廟方官網；明顯打字錯誤依所引原典改正',
    sources: [
      { label: '日月潭文武廟官網 籤詩詳解', url: 'https://www.wenwu.org.tw/' },
      { label: 'qian.time.actor', url: 'https://qian.time.actor/kongzi/1' },
      { label: 'golla.tw', url: 'https://www.golla.tw/chouqian/kongzi/' },
    ],
    originalImages: NO_IMAGES,
    rights: '廟方官網公開全文，未取得使用同意，待確認；籤題、白話與解曰為本 App 撰寫，未使用廟方解說。',
    listedAt: '2026-10-20',
    listedCommit: '9cedec9',
    poems: kongziShengqianPoems,
  }),
  card({
    id: 'luzu-zhinan-61',
    title: '指南宮呂祖靈籤六十首＋籤王',
    origin: '台北木柵指南宮',
    edition: '依籤紙；籤序依六十甲子，籤王排第 61',
    sources: [
      { label: '指南宮官網 呂祖靈籤', url: 'https://www.chih-nan-temple.org/' },
      { label: '台灣好廟網 呂祖籤', url: 'https://temples.tw/stick/fs_lz' },
      { label: '岐黃醫林論壇（籤題）', url: 'https://www.herb-tw.com/' },
    ],
    originalImages: '指南宮官網 61 張籤紙圖檔，已逐張核對。',
    rights: '廟方官網公開籤紙，未取得使用同意，待確認；白話與解曰為本 App 撰寫。',
    listedAt: '2026-10-20',
    listedCommit: 'fa49b49',
    poems: luzuZhinanPoems,
  }),
  card({
    id: 'zhuge-384',
    title: '諸葛神數三百八十四籤',
    origin: '民間流傳',
    edition: '三方多數決定字',
    sources: [
      { label: 'Google Sites fengshuialo', url: 'https://sites.google.com/site/fengshuialo' },
      { label: 'destiny.to 論壇', url: 'https://destiny.to/' },
      { label: 'fatekeep.com', url: 'https://fatekeep.com/blog/3643' },
    ],
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-20',
    listedCommit: '51354ad',
    poems: zhugeShenShuPoems,
  }),
  card({
    id: 'qingshui-taipei-50',
    title: '清水祖師靈籤（臺北版）四十八首＋簽王二首',
    origin: '三峽長福巖、艋舺清水巖、淡水清水巖通行；見於《清水岩志略》',
    edition: '臺北版；明顯錯字依安溪版改正',
    sources: [
      { label: '南陳宗親網〈臺北市清水岩清水祖師靈簽〉' },
      { label: '南陳宗親網〈安溪清水岩清水祖師靈簽〉（對校）' },
      { label: '閩南文化 PDF《清水祖師簽詩解》（對校）' },
    ],
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-20',
    listedCommit: 'd810fab',
    poems: qingshuiZushiPoems,
  }),
  card({
    id: 'baosheng-baoan-61',
    title: '大龍峒保安宮保生大帝籤六十首＋籤王',
    origin: '台北大龍峒保安宮',
    edition: '依好廟網；新聞引用 5 首抽查一致',
    sources: [
      { label: '台灣好廟網 保生大帝六十籤', url: 'https://temples.tw/stick/fs_bao' },
      { label: '大龍峒保安宮國運籤報導（抽查）', url: 'https://www.nownews.com/news/5623944' },
    ],
    sourceGapNote: '全文只有好廟網一個來源；保安宮官網沒有公開籤詩。',
    originalImages: NO_IMAGES,
    rights: RIGHTS_PENDING,
    listedAt: '2026-10-20',
    listedCommit: '3ccfebc',
    poems: baoshengBaoanPoems,
  }),
];

function sameText(base: readonly Poem[], poems: readonly Poem[]) {
  return base.length === poems.length && base.every((poem, index) => poem.content === poems[index].content);
}

/** 以籤詩原文找出底本；神明專屬改寫只動白話與解曰，原文不變。 */
export function getOracleSourceCardForPoems(poems: readonly Poem[]): OracleSourceCard | null {
  return oracleSourceCards.find((item) => item.poems === poems || sameText(item.poems, poems)) ?? null;
}

export function getOracleSourceCardByGodId(godId: number, yuelaoEdition?: YuelaoEdition): OracleSourceCard | null {
  return getOracleSourceCardForPoems(getPoemsByGod(godId, yuelaoEdition));
}

/** 每張來源卡被哪些神明使用；月老兩個版本都算。 */
export function getOracleSourceCardUsage(): Map<string, God[]> {
  const usage = new Map<string, God[]>(oracleSourceCards.map((item) => [item.id, []]));
  for (const god of gods) {
    const ids = new Set(
      (['taiwan', 'hongkong'] as YuelaoEdition[])
        .map((edition) => getOracleSourceCardByGodId(god.id, edition)?.id)
        .filter((id): id is string => Boolean(id)),
    );
    ids.forEach((id) => usage.get(id)?.push(god));
  }
  return usage;
}
