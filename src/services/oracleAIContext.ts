import { getRecordEditionDisplay } from '@/data/oracleRecordEdition';
import type { DivinationRecord } from './storage';

export interface OracleAIContext {
  editionId?: string;
  editionLabel?: string;
  editionVersionTag?: string;
  editionTemple?: string;
  editionSource?: string;
  editionSourceUrl?: string;
  drawMethod?: string;
}

export interface AIInterpretRequest extends OracleAIContext {
  godName: string;
  userName: string;
  question: string;
  questionCategory: string;
  poemNumber: number;
  poemContent: string;
  poemMeaning: string;
  poemStory: string;
  poemLevel: string;
  recentHistorySummary?: string;
}

export const ORACLE_AI_EDITION_RULE = '解讀時請先標明提供的籤本名稱與版次；只依本次籤文解讀，不得將同號的其他廟本混為一談。版本未註明時請明說，不要猜測廟本。來源資訊僅供辨識，AI 解讀與 App 白話不得宣稱為廟方原解。';

export function formatOracleAIContext(context: OracleAIContext): string {
  return [
    `籤本：${context.editionLabel || '版本未註明'}`,
    context.editionId ? `籤本識別：${context.editionId}` : '',
    `版次：${context.editionVersionTag || '版本未註明'}`,
    context.editionTemple ? `廟宇／傳本：${context.editionTemple}` : '',
    context.editionSource ? `來源說明：${context.editionSource}` : '',
    context.editionSourceUrl ? `來源連結：${context.editionSourceUrl}` : '',
    context.drawMethod ? `取籤方式：${context.drawMethod}` : '',
  ].filter(Boolean).join('\n');
}

export function buildRecentHistorySummary(history: DivinationRecord[], category: string): string {
  return history.filter((record) => record.questionCategory === category).slice(0, 3).map((record) => {
    const edition = getRecordEditionDisplay(record);
    return `${record.godName}第${record.poem.number}籤/${edition.label}${edition.inferred ? '（依籤文推定）' : ''}/版次：${record.editionVersionTag || '版本未註明'}/${record.poem.level}/${record.verificationStatus ?? '待驗證'}`;
  }).join('；');
}
