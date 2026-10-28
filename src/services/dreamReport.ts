import type { DreamJournalEntry } from '@/services/dreamJournal';
import { getDreamInsights } from '@/services/dreamInsights';

export function buildDreamReport(entries: DreamJournalEntry[], year: number, month?: number): string {
  const selected = entries.filter((entry) => { const date = new Date(entry.createdAt); return date.getFullYear() === year && (month === undefined || date.getMonth() === month); });
  const insights = getDreamInsights(selected);
  const title = month === undefined ? `${year} 年夢境報告` : `${year} 年 ${month + 1} 月夢境報告`;
  const list = (items: { label: string; count: number }[]) => items.length ? items.slice(0, 5).map((item) => `${item.label}（${item.count}）`).join('、') : '尚無資料';
  return [title, '＝'.repeat(title.length), '', `記錄數：${selected.length}`, `常見夢象：${list(insights.recurringSymbols)}`, `醒來感受：${list(insights.feelings)}`, `夢境類型：${list(insights.tags)}`, '', '夢境記錄', ...selected.sort((a, b) => b.createdAt - a.createdAt).map((entry) => { const date = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(entry.createdAt); return `\n【${date}】${entry.result.symbols.join('、') || '未辨識夢象'}\n${entry.dream}\n感受：${entry.feeling || '未填'}\n心得：${entry.reflection || '未填'}`; }), '', '本報告以夢境日記內容整理，供自我回顧與探索，不代表預言或醫療建議。'].join('\n');
}
