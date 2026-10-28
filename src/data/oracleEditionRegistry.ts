import type { Poem } from './poems/leiyushi';
import { guanyinLingQianPoems } from './poems/guanyinLingQian';
import { jiazi60Poems } from './poems/jiazi60';
import { mazuFocusedPoems } from './poems/deityFocused';
import { yuelaoHongKongPoems, yuelaoTaiwanPoems } from './poems/yuelao';

export type OracleEditionStatus =
  | 'legacy'
  | 'draft'
  | 'verified'
  | 'rights-cleared'
  | 'published'
  | 'withdrawn';

export type OracleDrawMethod = 'stick-confirmation' | 'three-cup-direct';

/**
 * Verbatim transcription status for a candidate edition.
 *
 * The transcribed poem text itself is deliberately NOT stored in this repository:
 * the repository is public and display rights are not granted yet. Only counts,
 * dates and unresolved issues are recorded here.
 */
export interface OracleTranscription {
  verifiedAt: string;
  expectedCount: number;
  transcribedCount: number;
  /** Poems without an unresolved text problem. */
  cleanCount: number;
  /** Poems also checked against a second source. */
  crossSourceCheckedCount: number;
  /** Human-readable location of the off-repo archive. */
  archive: string;
  issues?: readonly string[];
}

export interface OracleEdition {
  id: string;
  godId: number;
  label: string;
  temple: string;
  expectedCount: number | null;
  status: OracleEditionStatus;
  drawMethod: OracleDrawMethod;
  sourceUrl?: string;
  sourceVerified?: boolean;
  textVerified: boolean;
  rightsCleared: boolean;
  transcription?: OracleTranscription;
  poems?: readonly Poem[];
}

/**
 * Existing live editions are kept as `legacy` during the migration. New editions
 * must satisfy the published gate below before any draw or selector can use them.
 * Drafts are metadata only: the source register is never imported into a draw pool.
 */
export const oracleEditions: readonly OracleEdition[] = [
  { id: 'guanyin-common-100', godId: 2, label: '觀音靈籤百首', temple: '通行本', expectedCount: 100, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: guanyinLingQianPoems },
  { id: 'zizhu-guanyin-28', godId: 2, label: '內門紫竹寺觀音籤・28 首', temple: '內門紫竹寺', expectedCount: 28, status: 'verified', drawMethod: 'stick-confirmation', sourceUrl: 'https://www.nmzizhusi.org.tw/?act=jieqianyuandi&cmd=list', sourceVerified: true, textVerified: true, rightsCleared: false, transcription: { verifiedAt: '2026-10-28', expectedCount: 28, transcribedCount: 28, cleanCount: 28, crossSourceCheckedCount: 0, archive: '神明占卜/private-oracle-transcriptions/2026-10-28（未入版控）', issues: ['第 28 首為特殊格式：四句長短不一、不是七言四句，也不標吉凶'] } },
  { id: 'mazu-jiazi-60', godId: 3, label: '媽祖天后籤・六十甲子', temple: '通行本', expectedCount: 60, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: mazuFocusedPoems },
  { id: 'cifeng-mazu-100', godId: 3, label: '屏東慈鳳宮媽祖籤・100 首', temple: '屏東慈鳳宮', expectedCount: 100, status: 'draft', drawMethod: 'stick-confirmation', sourceUrl: 'https://www.323pt.org.tw/?act=menuinfo&api=list&cmd=list&ml_id=20260818003', sourceVerified: true, textVerified: false, rightsCleared: false, transcription: { verifiedAt: '2026-10-28', expectedCount: 100, transcribedCount: 100, cleanCount: 99, crossSourceCheckedCount: 0, archive: '神明占卜/private-oracle-transcriptions/2026-10-28（未入版控）', issues: ['第 49 首官方頁面本身含 U+FFFD 亂碼（三個替換字元），須廟方提供正確用字後才能列為已校對'] } },
  { id: 'yuelao-taiwan-100', godId: 13, label: '月老靈籤・台灣版 100 首', temple: '新竹普天宮版本', expectedCount: 100, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: yuelaoTaiwanPoems },
  { id: 'yuelao-hongkong-101', godId: 13, label: '月老靈籤・香港版 101 首', temple: '香港通行本', expectedCount: 101, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: yuelaoHongKongPoems },
  { id: 'wenwu-yuelao-40', godId: 13, label: '日月潭文武廟月老籤・40 首', temple: '日月潭文武廟', expectedCount: 40, status: 'verified', drawMethod: 'stick-confirmation', sourceUrl: 'https://www.wenwu.org.tw/index.php/zh/2023-05-15-03-52-29/2023-05-21-01-58-51.html', sourceVerified: true, textVerified: true, rightsCleared: false, transcription: { verifiedAt: '2026-10-28', expectedCount: 40, transcribedCount: 40, cleanCount: 40, crossSourceCheckedCount: 0, archive: '神明占卜/private-oracle-transcriptions/2026-10-28（未入版控）', issues: ['官方頁面未押韻尾標點，轉錄時保留原文用字但不補標點'] } },
  { id: 'tainan-tianhou-yuelao-27', godId: 13, label: '祀典大天后宮月老籤・27 首', temple: '祀典大天后宮', expectedCount: 27, status: 'verified', drawMethod: 'three-cup-direct', sourceUrl: 'https://www.gtainanmazu.org.tw/?act=menuinfo&cmd=list&ml_id=20220121003', sourceVerified: true, textVerified: true, rightsCleared: false, transcription: { verifiedAt: '2026-10-28', expectedCount: 27, transcribedCount: 27, cleanCount: 27, crossSourceCheckedCount: 0, archive: '神明占卜/private-oracle-transcriptions/2026-10-28（未入版控）', issues: ['籤文只以圖片公布，由人工目視轉錄；第 9、10、16、24 首有可疑用字，已標記但保留廟方原文', '此版本與紫竹寺觀音籤屬不同傳本，異文不得互相修正'] } },
  { id: 'guangze-jiazi-60', godId: 24, label: '廣澤尊王・六十甲子', temple: '通行本', expectedCount: 60, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: jiazi60Poems },
  { id: 'guangze-ancient-provisional', godId: 24, label: '廣澤尊王古本・待核定', temple: '版本未核定', expectedCount: null, status: 'draft', drawMethod: 'stick-confirmation', sourceVerified: false, textVerified: false, rightsCleared: false },
  { id: 'dongyue-guanyin-100', godId: 38, label: '東嶽大帝・觀音百首', temple: '通行本', expectedCount: 100, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: guanyinLingQianPoems },
  { id: 'yilan-dongyue-28-king', godId: 38, label: '宜蘭東嶽廟二十八星宿籤', temple: '宜蘭東嶽廟', expectedCount: 29, status: 'draft', drawMethod: 'stick-confirmation', sourceUrl: 'https://www.lym.gov.tw/ch/collection/epaper/epaper-detail/288e8a09-1331-11ef-a1c3-2760f1289ae7/', sourceVerified: false, textVerified: false, rightsCleared: false },
  { id: 'wunian-jiazi-60', godId: 43, label: '五年千歲・六十甲子', temple: '通行本', expectedCount: 60, status: 'legacy', drawMethod: 'stick-confirmation', textVerified: true, rightsCleared: false, poems: jiazi60Poems },
  { id: 'mamingshan-wunian-50', godId: 43, label: '馬鳴山鎮安宮五年千歲籤', temple: '馬鳴山鎮安宮', expectedCount: 50, status: 'draft', drawMethod: 'stick-confirmation', sourceUrl: 'https://mamingshan.tw/services/fortune.html', sourceVerified: false, textVerified: false, rightsCleared: false },
];

export function getOracleEditionById(id: string): OracleEdition | undefined {
  return oracleEditions.find((edition) => edition.id === id);
}

export function getOracleEditionGateErrors(edition: OracleEdition): string[] {
  if (edition.status === 'legacy') return [];
  const errors: string[] = [];
  if (edition.status !== 'published') errors.push('籤本尚未發布');
  if (!edition.sourceUrl || !edition.sourceVerified) errors.push('逐首來源尚未核定');
  if (!edition.textVerified) errors.push('原文尚未逐首校對');
  if (!edition.rightsCleared) errors.push('App 展示權尚未確認');
  if (edition.expectedCount == null) errors.push('籤本首數尚未核定');
  if (!edition.poems || edition.poems.length !== edition.expectedCount) errors.push('可抽籤資料未齊');
  if (edition.poems?.some((poem) => !poem.content.trim() || !Number.isInteger(poem.number))) {
    errors.push('籤文或籤號有空缺');
  }
  if (edition.poems && new Set(edition.poems.map((poem) => poem.number)).size !== edition.poems.length) {
    errors.push('籤號有重複');
  }
  if (edition.drawMethod === 'three-cup-direct' && edition.expectedCount !== 27) {
    errors.push('三筊定籤需要 27 首');
  }
  if (edition.drawMethod === 'three-cup-direct' && edition.poems &&
      edition.poems.some((poem, index) => poem.number !== index + 1)) {
    errors.push('三筊定籤需要第 1–27 首依序完整建檔');
  }
  return errors;
}

export function isOracleEditionSelectable(edition: OracleEdition): boolean {
  return edition.status === 'legacy'
    ? Boolean(edition.poems?.length)
    : getOracleEditionGateErrors(edition).length === 0;
}

export function getSelectableOracleEditions(godId: number): OracleEdition[] {
  return oracleEditions.filter((edition) => edition.godId === godId && isOracleEditionSelectable(edition));
}

export function resolveOracleEdition(godId: number, preferredId?: string | null): OracleEdition | null {
  const editions = getSelectableOracleEditions(godId);
  return editions.find((edition) => edition.id === preferredId) ?? editions[0] ?? null;
}

export function getAllSelectableOraclePoems(godId: number): Poem[] {
  return getSelectableOracleEditions(godId).flatMap((edition) => [...(edition.poems ?? [])]);
}
