/**
 * 宜蘭東嶽廟二十八星宿籤：校勘中的來源索引。
 *
 * 這不是可抽籤資料。現階段僅保留兩筆可追溯的公開實物證據，
 * 不嵌入第三方轉錄的籤文；待取得全套原始影像／廟方核定文字與
 * 使用同意後，才建立可抽的 dongyueYilanPoems。
 */
export interface DongyueYilanDraftEvidence {
  drawNumber: number;
  sourceLabel: string;
  sourceUrl: string;
  evidenceType: '公開實物轉錄';
  contentStatus: '待取得原始影像或授權後建檔';
}

export const DONGYUE_YILAN_EXPECTED_DRAW_COUNT = 29;

export const dongyueYilanDraftEvidence: DongyueYilanDraftEvidence[] = [
  {
    drawNumber: 1,
    sourceLabel: '《宜蘭街嶽帝廟靈籤》第壹首（九藏閣公開實物資料）',
    sourceUrl: 'https://9collection.blogspot.com/2011/11/?m=0',
    evidenceType: '公開實物轉錄',
    contentStatus: '待取得原始影像或授權後建檔',
  },
  {
    drawNumber: 28,
    sourceLabel: '《宜蘭街嶽帝廟靈籤》貳捌首（九藏閣公開實物資料）',
    sourceUrl: 'https://9collection.blogspot.com/2011/11/?m=0',
    evidenceType: '公開實物轉錄',
    contentStatus: '待取得原始影像或授權後建檔',
  },
];

export const DONGYUE_YILAN_DRAFT_STATUS = {
  expectedCount: DONGYUE_YILAN_EXPECTED_DRAW_COUNT,
  verifiedEvidenceCount: dongyueYilanDraftEvidence.length,
  activeForDraw: false,
  nextRequirement: '取得其餘籤首與籤王的原始影像／廟方核定文字及 App 使用同意',
} as const;
