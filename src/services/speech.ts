// TTS 語音朗讀服務 - 使用 expo-speech
import * as Speech from 'expo-speech';
import { getDailyBlessing, getRandomBlessing } from '@/data/godBlessings';

let isSpeaking = false;

export async function speakText(text: string, language: string = 'zh-TW'): Promise<void> {
  try {
    if (isSpeaking) {
      await stopSpeaking();
    }
    isSpeaking = true;
    await Speech.speak(text, {
      language,
      pitch: 1.0,
      rate: 0.85, // 稍慢，適合籤詩的莊重語調
    });
    // 等待說完
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!isSpeaking) {
          clearInterval(check);
          resolve();
        }
      }, 200);
    });
  } catch (error) {
    console.warn('TTS 失敗:', error);
  } finally {
    isSpeaking = false;
  }
}

// 朗讀神明祝福語（隨機選一句）
export async function speakGodBlessing(godId: number): Promise<void> {
  const text = getRandomBlessing(godId);
  if (!text) return;
  await speakText(text);
}

// 朗讀今日神明祝福語（根據日期固定選一句）
export async function speakDailyBlessing(godId: number): Promise<void> {
  const text = getDailyBlessing(godId);
  if (!text) return;
  await speakText(text);
}

// 取得祝福語文字（不朗讀，供 UI 顯示用）
export function getBlessingText(godId: number, daily = false): string {
  return daily ? getDailyBlessing(godId) : getRandomBlessing(godId);
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // 靜默失敗
  }
  isSpeaking = false;
}

export function isCurrentlySpeaking(): boolean {
  return isSpeaking;
}
