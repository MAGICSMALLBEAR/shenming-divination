import {
  DONGYUE_YILAN_DRAFT_STATUS,
  DONGYUE_YILAN_EXPECTED_DRAW_COUNT,
  dongyueYilanDraftEvidence,
} from '@/data/poems/dongyueYilanDraft';

describe('宜蘭東嶽廟二十八星宿籤校勘索引', () => {
  it('保留已核對的首、末兩筆實物證據，但不作為可抽籤資料', () => {
    expect(DONGYUE_YILAN_EXPECTED_DRAW_COUNT).toBe(29);
    expect(dongyueYilanDraftEvidence.map((item) => item.drawNumber)).toEqual([1, 28]);
    expect(DONGYUE_YILAN_DRAFT_STATUS.verifiedEvidenceCount).toBe(2);
    expect(DONGYUE_YILAN_DRAFT_STATUS.activeForDraw).toBe(false);
  });

  it('每筆證據都保留可追溯來源，且未將第三方轉錄文字嵌入 App', () => {
    for (const evidence of dongyueYilanDraftEvidence) {
      expect(evidence.sourceUrl).toMatch(/^https:\/\//);
      expect(evidence.contentStatus).toBe('待取得原始影像或授權後建檔');
    }
  });
});
