// 一事一籤：同一件事不重複向同一位神明求籤
// 只比對同一位神明，因為「跨廟比較」本來就是讓同一件事請示不同神明。
import type { DivinationRecord } from './storage';

export const SAME_MATTER_WINDOW_MS = 24 * 60 * 60 * 1000;

// 去掉空白與常見中英文標點，讓「要不要換工作？」與「要不要換工作」視為同一件事
const IGNORED_CHARS = /[\s，。、！？；：「」『』（）()《》〈〉【】［］.,!?;:'"“”‘’…—\-~～·]/g;

export function normalizeQuestion(question: string): string {
  return question.normalize('NFKC').toLowerCase().replace(IGNORED_CHARS, '');
}

/** 找出時限內向同一位神明問過同一件事的最近一筆紀錄；沒有則回傳 null。 */
export function findSameMatterDraw(
  history: DivinationRecord[],
  godName: string,
  question: string,
  now: number = Date.now(),
): DivinationRecord | null {
  const key = normalizeQuestion(question);
  if (!key) return null;
  const matches = history.filter((record) =>
    record.godName === godName
    && now - record.timestamp >= 0
    && now - record.timestamp < SAME_MATTER_WINDOW_MS
    && normalizeQuestion(record.question ?? '') === key,
  );
  if (matches.length === 0) return null;
  return matches.reduce((latest, record) => (record.timestamp > latest.timestamp ? record : latest));
}
