import { gods } from './gods';
import { getOracleEditionById, getSelectableOracleEditions } from './oracleEditionRegistry';
import type { DivinationRecord } from '@/services/storage';

type RecordEditionFields = Pick<DivinationRecord, 'godName' | 'poem' | 'editionId' | 'editionLabel'>;

export interface RecordEditionDisplay {
  id: string | null;
  label: string;
  inferred: boolean;
}

/** A historical record only gains a version when its number and full text match one edition. */
export function getRecordEditionDisplay(record: RecordEditionFields): RecordEditionDisplay {
  if (record.editionId) {
    const edition = getOracleEditionById(record.editionId);
    return { id: record.editionId, label: record.editionLabel ?? edition?.label ?? record.editionId, inferred: false };
  }
  if (record.editionLabel) {
    return { id: null, label: record.editionLabel, inferred: false };
  }
  const god = gods.find((item) => item.name === record.godName);
  const matches = god
    ? getSelectableOracleEditions(god.id).filter((edition) =>
        edition.poems?.some((poem) =>
          poem.number === record.poem.number && poem.content === record.poem.content,
        ),
      )
    : [];
  if (matches.length === 1) {
    return { id: matches[0].id, label: matches[0].label, inferred: true };
  }
  return { id: null, label: '舊紀錄・版本未註明', inferred: false };
}
