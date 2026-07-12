import { gods, getPoemsByGod, type God } from '@/data/gods';
import { getOracleCatalogByGodId, type OracleCatalogEntry } from '@/data/oracleCatalog';
import type { Poem } from '@/data/poems/leiyushi';

export type OracleSourceClass = 'traditional' | 'adapted' | 'original' | 'unclassified';
export type OracleAuditStatus = 'complete' | 'review' | 'critical';

export interface OracleAuditRow {
  god: God;
  catalog: OracleCatalogEntry;
  status: OracleAuditStatus;
  sourceClass: OracleSourceClass;
  poemCount: number;
  uniqueContentCount: number;
  completenessPercent: number;
  errors: string[];
  warnings: string[];
}

export interface OracleAuditSummary {
  rows: OracleAuditRow[];
  completeCount: number;
  reviewCount: number;
  criticalCount: number;
  totalMappedPoems: number;
}

const REQUIRED_TEXT_FIELDS: (keyof Pick<Poem, 'title' | 'content' | 'vernacular' | 'story' | 'level' | 'ganzhi'>)[] = [
  'title', 'content', 'vernacular', 'story', 'level', 'ganzhi',
];
const REQUIRED_INTERPRETATIONS: (keyof Poem['jieYue'])[] = [
  'marriage', 'wealth', 'career', 'health', 'travel', 'study', 'general',
];

export function classifyOracleSource(sourceType: string): OracleSourceClass {
  if (sourceType.includes('原創')) return 'original';
  if (sourceType.includes('傳統') || sourceType.includes('籤系骨幹')) return 'traditional';
  if (sourceType.includes('App') || sourceType.includes('語境') || sourceType.includes('脈絡')) return 'adapted';
  return 'unclassified';
}

export function auditGodOracle(god: God): OracleAuditRow {
  const poems = getPoemsByGod(god.id);
  const catalog = getOracleCatalogByGodId(god.id);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (poems.length !== god.totalPoems) errors.push(`實際 ${poems.length} 首，神明資料標示 ${god.totalPoems} 首`);
  if (catalog.totalPoems !== god.totalPoems) errors.push(`來源目錄標示 ${catalog.totalPoems} 首，與神明資料不一致`);
  const expectedNumbers = Array.from({ length: god.totalPoems }, (_, index) => index + 1);
  if (poems.some((poem, index) => poem.number !== expectedNumbers[index])) errors.push('籤號並非從 1 起連續排列');

  let missingFields = 0;
  poems.forEach((poem) => {
    REQUIRED_TEXT_FIELDS.forEach((field) => { if (!String(poem[field] ?? '').trim()) missingFields += 1; });
    REQUIRED_INTERPRETATIONS.forEach((field) => { if (!String(poem.jieYue?.[field] ?? '').trim()) missingFields += 1; });
  });
  if (missingFields) errors.push(`共有 ${missingFields} 個必要內容欄位為空白`);

  const normalizedContents = poems.map((poem) => poem.content.replace(/\s+/g, ' ').trim());
  const uniqueContentCount = new Set(normalizedContents).size;
  if (uniqueContentCount < poems.length) warnings.push(`系統內有 ${poems.length - uniqueContentCount} 首籤詩原文重複`);

  const sourceClass = classifyOracleSource(catalog.sourceType);
  if (sourceClass === 'unclassified') warnings.push('來源型態尚未明確分類');
  if (!catalog.versionTag || catalog.versionTag === 'internal-general-v1') errors.push('缺少可追蹤的版本標記');
  if (!catalog.editionNote.trim() || !catalog.sourceNote.trim()) errors.push('缺少來源或版本說明');

  const totalChecks = poems.length * (REQUIRED_TEXT_FIELDS.length + REQUIRED_INTERPRETATIONS.length);
  const completenessPercent = totalChecks ? Math.round(((totalChecks - missingFields) / totalChecks) * 100) : 0;
  return {
    god, catalog, sourceClass, poemCount: poems.length, uniqueContentCount, completenessPercent,
    errors, warnings, status: errors.length ? 'critical' : warnings.length ? 'review' : 'complete',
  };
}

export function auditAllOracles(): OracleAuditSummary {
  const rows = gods.map(auditGodOracle);
  return {
    rows,
    completeCount: rows.filter((row) => row.status === 'complete').length,
    reviewCount: rows.filter((row) => row.status === 'review').length,
    criticalCount: rows.filter((row) => row.status === 'critical').length,
    totalMappedPoems: rows.reduce((sum, row) => sum + row.poemCount, 0),
  };
}
