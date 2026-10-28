import register from './poems/oracleCandidateEntryRegister.json';
import { getOracleEditionById, isOracleEditionSelectable, oracleEditions } from './oracleEditionRegistry';

export type IntakeStatus = '可抽籤' | '校對中' | '原文已校・待展示權' | '待取得底本';

interface CandidateEntry {
  number: number | null;
  officialLabel?: string;
  sourceUrl?: string | null;
  evidence?: string;
  ritualPattern?: string;
}

interface CandidateCollection {
  id: string;
  temple: string | null;
  deityGodId: number;
  expectedSlots: number | null;
  provisionalNumberSlots?: number;
  numberingStatus: string;
  textStatus: string;
  rightsStatus: string;
  countSourceUrl: string;
  entries: CandidateEntry[];
}

const candidateRegister = register as unknown as { checkedAt: string; collections: CandidateCollection[] };

const editionIds: Record<string, string> = {
  zizhu_guanyin_28: 'zizhu-guanyin-28',
  wenwu_yuelao_40: 'wenwu-yuelao-40',
  cifeng_mazu_100: 'cifeng-mazu-100',
  tainan_tianhou_yuelao_27: 'tainan-tianhou-yuelao-27',
  mamingshan_wunian_50: 'mamingshan-wunian-50',
  yilan_dongyue_28_king: 'yilan-dongyue-28-king',
  guangze_ancient_provisional: 'guangze-ancient-provisional',
};

export interface OracleIntakeProgress {
  editionId: string;
  godId: number;
  title: string;
  temple: string;
  status: IntakeStatus;
  plannedSlots: number | null;
  officialLinks: number;
  checkedTextCount: number;
  /** Transcribed poems without an unresolved text problem. */
  cleanTextCount: number;
  rightsCleared: boolean;
  sourceUrl?: string;
  checkedAt: string;
  entries: readonly CandidateEntry[];
  note: string;
}

export function getOracleIntakeProgress(): OracleIntakeProgress[] {
  const live = oracleEditions.filter(isOracleEditionSelectable).map((edition): OracleIntakeProgress => ({
    editionId: edition.id,
    godId: edition.godId,
    title: edition.label,
    temple: edition.temple,
    status: '可抽籤',
    plannedSlots: edition.expectedCount,
    officialLinks: 0,
    checkedTextCount: edition.poems?.length ?? 0,
    cleanTextCount: edition.poems?.length ?? 0,
    rightsCleared: edition.rightsCleared,
    sourceUrl: edition.sourceUrl,
    checkedAt: candidateRegister.checkedAt,
    entries: [],
    note: edition.status === 'legacy'
      ? '既有上線版；來源與展示權欄位仍須逐一補齊，不代表已通過新籤本發布審核。'
      : '已通過新籤本發布審核。',
  }));
  const candidates = candidateRegister.collections
    .filter((collection) => {
      const edition = getOracleEditionById(editionIds[collection.id]);
      return !edition || !isOracleEditionSelectable(edition);
    })
    .map((collection): OracleIntakeProgress => {
    const editionId = editionIds[collection.id];
    const edition = getOracleEditionById(editionId);
    const hasOfficialIndex = collection.numberingStatus === 'official_index_complete';
    const transcription = edition?.transcription;
    const textComplete = transcription != null
      && transcription.cleanCount === transcription.expectedCount;
    const transcriptionStarted = (transcription?.transcribedCount ?? 0) > 0;
    return {
      editionId,
      godId: collection.deityGodId,
      title: edition?.label ?? collection.id,
      temple: collection.temple ?? '廟本未核定',
      status: textComplete
        ? '原文已校・待展示權'
        : hasOfficialIndex || transcriptionStarted ? '校對中' : '待取得底本',
      plannedSlots: collection.expectedSlots,
      officialLinks: collection.entries.filter((entry) => Boolean(entry.sourceUrl)).length,
      checkedTextCount: transcription?.transcribedCount ?? 0,
      cleanTextCount: transcription?.cleanCount ?? 0,
      rightsCleared: false,
      sourceUrl: collection.countSourceUrl,
      checkedAt: candidateRegister.checkedAt,
      entries: collection.entries,
      note: textComplete
        ? '廟方官方頁面已逐首轉錄並人工核對；App 展示權尚未取得，因此仍不進入抽籤池。'
        : transcriptionStarted
          ? '已完成大部分逐首轉錄，仍有待廟方確認的用字或格式；展示權亦未取得。'
          : hasOfficialIndex
            ? '已有逐首目錄或來源連結；籤文仍待轉錄、逐字校對及確認 App 展示權。'
            : '目前只有總數、結構或轉載線索；須取得廟方核定底本後才能逐首校對。',
    };
    });
  return [...live, ...candidates];
}
