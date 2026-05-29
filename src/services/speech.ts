// TTS 語音朗讀服務 - 使用 expo-speech
import * as Speech from 'expo-speech';

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
