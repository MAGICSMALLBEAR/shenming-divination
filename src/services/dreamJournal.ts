import { getItem, setItem } from '@/services/storage';
import type { DreamResult } from '@/services/dreamAnalysis';

export const DREAM_JOURNAL_KEY = '@divination_dream_journal';
const MAX_ENTRIES = 300;

export type DreamTag = '惡夢' | '好夢' | '清醒夢' | '反覆夢' | '奇異夢';

export interface DreamFollowupQA {
  id: string;
  question: string;
  reply: string;
  createdAt: number;
}

export interface DreamJournalEntry {
  id: string;
  dream: string;
  feeling?: string;
  tags: DreamTag[];
  result: DreamResult;
  reflection?: string;
  followups?: DreamFollowupQA[];
  createdAt: number;
}

function normalizeEntry(entry: DreamJournalEntry): DreamJournalEntry {
  return {
    ...entry,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    result: { ...entry.result, symbols: Array.isArray(entry.result?.symbols) ? entry.result.symbols : [] },
    followups: Array.isArray(entry.followups) ? entry.followups : [],
  };
}

export async function getDreamJournal(): Promise<DreamJournalEntry[]> {
  const raw = await getItem(DREAM_JOURNAL_KEY);
  if (!raw) return [];
  try {
    const entries = JSON.parse(raw) as DreamJournalEntry[];
    return Array.isArray(entries) ? entries.map(normalizeEntry).sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

export async function saveDreamEntry(input: Omit<DreamJournalEntry, 'id' | 'createdAt'>): Promise<DreamJournalEntry> {
  const entry: DreamJournalEntry = {
    ...input,
    id: `dream_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  const entries = await getDreamJournal();
  await setItem(DREAM_JOURNAL_KEY, JSON.stringify([entry, ...entries].slice(0, MAX_ENTRIES)));
  return entry;
}

export async function deleteDreamEntry(id: string): Promise<void> {
  const entries = await getDreamJournal();
  await setItem(DREAM_JOURNAL_KEY, JSON.stringify(entries.filter((entry) => entry.id !== id)));
}

export async function getDreamEntry(id: string): Promise<DreamJournalEntry | null> {
  const entries = await getDreamJournal();
  return entries.find((entry) => entry.id === id) ?? null;
}

export async function updateDreamEntry(
  id: string,
  updates: Partial<Pick<DreamJournalEntry, 'dream' | 'feeling' | 'reflection' | 'tags' | 'followups'>>
): Promise<void> {
  const entries = await getDreamJournal();
  const updated = entries.map((entry) => entry.id === id ? normalizeEntry({ ...entry, ...updates }) : entry);
  await setItem(DREAM_JOURNAL_KEY, JSON.stringify(updated));
}

export async function addDreamFollowup(
  entryId: string,
  question: string,
  reply: string
): Promise<DreamFollowupQA> {
  const qa: DreamFollowupQA = {
    id: `qa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    question: question.trim(),
    reply: reply.trim(),
    createdAt: Date.now(),
  };
  const entries = await getDreamJournal();
  const updated = entries.map((entry) => {
    if (entry.id !== entryId) return entry;
    const existing = Array.isArray(entry.followups) ? entry.followups : [];
    return normalizeEntry({ ...entry, followups: [...existing, qa] });
  });
  await setItem(DREAM_JOURNAL_KEY, JSON.stringify(updated));
  return qa;
}
