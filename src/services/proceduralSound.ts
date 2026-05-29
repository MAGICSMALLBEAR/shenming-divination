// 程式化音效服務 - 跨平台音效 (Web Audio API + Vibration + Haptics)
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// 產生簡單的合成音效
let audioContext: any = null;

function getAudioContext() {
  if (Platform.OS !== 'web') return null;
  if (!audioContext) {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContextClass();
    } catch {
      return null;
    }
  }
  return audioContext;
}

// 播放擲筊音效（短木頭撞擊聲）
export async function playTossSound() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics 不可用
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

// 播放聖筊音效（清脆金玉之聲）
export async function playShengbeiSound() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics 不可用
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  // 雙音階 — 模擬筊杯落地清脆聲
  [800, 1200].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.2);
  });
}

// 播放抽籤音效（籤筒搖晃）
export async function playDrawSound() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics 不可用
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300 + Math.random() * 200, ctx.currentTime + i * 0.06);
    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.05);
    osc.start(ctx.currentTime + i * 0.06);
    osc.stop(ctx.currentTime + i * 0.06 + 0.05);
  }
}

// 簡單震動
export async function vibrateLight() {
  try {
    const { Vibration } = require('react-native');
    Vibration.vibrate(30);
  } catch {
    // 不可用
  }
}
