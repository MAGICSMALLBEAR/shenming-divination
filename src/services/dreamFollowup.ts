import { Platform } from 'react-native';
import type { DreamJournalEntry } from '@/services/dreamJournal';
import { getItem } from '@/services/storage';

function defaultUrl() { return Platform.OS === 'android' ? 'http://10.0.2.2:3001/api/chat' : 'http://localhost:3001/api/chat'; }

export async function askDreamFollowup(entry: DreamJournalEntry, question: string): Promise<string> {
  const raw = await getItem('@divination_settings');
  const settings = raw ? JSON.parse(raw) as { aiServerUrl?: string; aiApiKey?: string } : {};
  const url = (settings.aiServerUrl || process.env.EXPO_PUBLIC_AI_API_URL || defaultUrl()).replace('/api/interpret', '/api/chat');
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(settings.aiApiKey ? { 'X-Api-Key': settings.aiApiKey } : {}) }, body: JSON.stringify({ messages: [
    { role: 'system', content: '你是溫和的解夢反思引導者。夢境不是預言，也不可診斷心理或醫療問題。請根據使用者提供的夢境，用繁體中文回答：先給一段可能脈絡，再提出兩個自我反思問題，最後給一項小而安全的行動建議。避免斷言吉凶。' },
    { role: 'user', content: `夢境：${entry.dream}\n感受：${entry.feeling || '未填'}\n已辨識夢象：${entry.result.symbols.join('、') || '無'}\n原解析：${entry.result.interpretation}\n醒後心得：${entry.reflection || '未填'}\n\n我的問題：${question}` },
  ] }) });
  if (!response.ok) throw new Error('AI 暫時無法回應');
  const data = await response.json() as { reply?: string };
  if (!data.reply) throw new Error('AI 暫時無法回應');
  return data.reply;
}
