// 抽籤與擲筊核心邏輯
import { getPoemsByGod } from '@/data/gods';
import type { Poem } from '@/data/poems/leiyushi';
import type { DivinationRecord } from './storage';
import { addHistory } from './storage';
import { mulberry32 } from './seededRandom';
export { drawZhugePoem } from '@/data/poems/zhugeShenShu';

// 擲筊結果
export type JiaobeiResult = 'shengbei' | 'xiaobei' | 'yinbei';

// 擲筊機率設定
const JIAOBEI_WEIGHTS = {
  shengbei: 0.50,
  xiaobei: 0.25,
  yinbei: 0.25,
};

// 使用加權隨機模擬擲筊
export function tossJiaobei(): JiaobeiResult {
  const rand = Math.random();
  if (rand < JIAOBEI_WEIGHTS.shengbei) return 'shengbei';
  if (rand < JIAOBEI_WEIGHTS.shengbei + JIAOBEI_WEIGHTS.xiaobei) return 'xiaobei';
  return 'yinbei';
}

// 取得籤詩（均勻分佈的隨機）
// seed 若提供（例如來自搖籤筒的操作遙測雜湊），改用種子亂數決定索引，
// 讓「這支籤是你搖出來的」在技術上也成立；未提供時維持原本的系統亂數。
export function drawPoem(godId: number, seed?: number): Poem {
  const poems = getPoemsByGod(godId);
  let index: number;
  if (seed != null) {
    index = Math.floor(mulberry32(seed)() * poems.length) % poems.length;
  } else {
    // 使用 crypto.getRandomValues 在可用時提供更好的隨機性
    const array = new Uint32Array(1);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      array[0] = Math.floor(Math.random() * 4294967296);
    }
    index = array[0] % poems.length;
  }
  return poems[index];
}

// 產生唯一 ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

// 儲存求籤紀錄
export async function saveDivinationRecord(params: {
  godName: string;
  poem: Poem;
  question: string;
  questionCategory: string;
  aiInterpretation?: string;
  actionPlan?: string[];
}): Promise<DivinationRecord> {
  const record: DivinationRecord = {
    id: generateId(),
    ...params,
    timestamp: Date.now(),
    verificationDueAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    verificationFinalDueAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  await addHistory(record);
  return record;
}
