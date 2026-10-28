/**
 * 內門紫竹寺觀音運籤的逐首來源索引（非抽籤資料）。
 *
 * 28 個連結依寺方目錄逐一核對。籤文、解曰及解說尚未取得
 * App 展示權，也尚未完成逐字校勘，因此不在此檔複製或上線。
 */
export interface ZizhuGuanyinDraftEntry {
  number: number;
  officialLabel: string;
  sourceUrl: string;
  originalTextStatus: '待逐字校勘';
  rightsStatus: '待確認 App 展示權';
  note?: string;
}

export const ZIZHU_GUANYIN_OFFICIAL_INDEX =
  'https://www.nmzizhusi.org.tw/?act=jieqianyuandi&cmd=list';

const detailUrl = (id: string) =>
  `https://www.nmzizhusi.org.tw/?act=jieqianyuandi&ad_id=${id}&cmd=detail`;

export const zizhuGuanyinDraft: ZizhuGuanyinDraftEntry[] = [
  { number: 1, officialLabel: '籤首', sourceUrl: detailUrl('202212090028248'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權', note: '寺方目錄稱「籤首」，逐首頁亦同；資料號碼記作 1。' },
  { number: 2, officialLabel: '第二籤', sourceUrl: detailUrl('202212090027991'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 3, officialLabel: '第三籤', sourceUrl: detailUrl('202212090026557'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 4, officialLabel: '第四籤', sourceUrl: detailUrl('202212090025514'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 5, officialLabel: '第五籤', sourceUrl: detailUrl('202212090024829'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 6, officialLabel: '第六籤', sourceUrl: detailUrl('202212090023536'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 7, officialLabel: '第七籤', sourceUrl: detailUrl('202212090022516'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 8, officialLabel: '第八籤', sourceUrl: detailUrl('202212090021614'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 9, officialLabel: '第九籤', sourceUrl: detailUrl('202212090020787'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 10, officialLabel: '第十籤', sourceUrl: detailUrl('202212090019483'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 11, officialLabel: '第十一籤', sourceUrl: detailUrl('202212090018406'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 12, officialLabel: '第十二籤', sourceUrl: detailUrl('202212090017060'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 13, officialLabel: '第十三籤', sourceUrl: detailUrl('202212090016859'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 14, officialLabel: '第十四籤', sourceUrl: detailUrl('202212090015354'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 15, officialLabel: '第十五籤', sourceUrl: detailUrl('202212090014910'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 16, officialLabel: '第十六籤', sourceUrl: detailUrl('202212090013794'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 17, officialLabel: '第十七籤', sourceUrl: detailUrl('202212090012001'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 18, officialLabel: '第十八籤', sourceUrl: detailUrl('202212090011820'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 19, officialLabel: '第十九籤', sourceUrl: detailUrl('202212090010438'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 20, officialLabel: '第二十籤', sourceUrl: detailUrl('202212090009753'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 21, officialLabel: '第二十一籤', sourceUrl: detailUrl('202212090008042'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 22, officialLabel: '第二十二籤', sourceUrl: detailUrl('202212090007926'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 23, officialLabel: '第二十三籤', sourceUrl: detailUrl('202212090006656'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 24, officialLabel: '第二十四籤', sourceUrl: detailUrl('202212090005886'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 25, officialLabel: '第二十五籤', sourceUrl: detailUrl('202212090004582'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 26, officialLabel: '第二十六籤', sourceUrl: detailUrl('202212090003780'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 27, officialLabel: '第二十七籤', sourceUrl: detailUrl('202212090002938'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權' },
  { number: 28, officialLabel: '第二十八籤', sourceUrl: detailUrl('202212090001153'), originalTextStatus: '待逐字校勘', rightsStatus: '待確認 App 展示權', note: '非一般七言四句格式；官方解曰與解說看似吉凶混雜，待廟方釐清。' },
];

export const ZIZHU_GUANYIN_DRAFT_STATUS = {
  expectedCount: 28,
  sourcePageCount: zizhuGuanyinDraft.length,
  verifiedAt: '2026-10-28',
  activeForDraw: false,
  nextRequirement: '逐字校勘原文並確認 App 展示權',
} as const;
