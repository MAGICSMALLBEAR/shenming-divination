// 廟宇音效服務 — expo-av（Native）+ Web Audio API（Web）+ Haptics
// Native: 播放內嵌音檔；Web: 合成音效；兩者皆加 Haptics
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// ─── Native 音檔（放於 assets/sounds/） ───────────────────────
// 若音檔不存在則靜默降級為合成音
let SoundLib: any = null;

async function getSound(require_path: any): Promise<any | null> {
  if (Platform.OS === 'web') return null;
  try {
    if (!SoundLib) {
      const { Audio } = require('expo-av');
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      SoundLib = Audio;
    }
    const { sound } = await SoundLib.Sound.createAsync(require_path, { shouldPlay: false });
    return sound;
  } catch {
    return null;
  }
}

async function playNativeSound(require_path: any) {
  const sound = await getSound(require_path);
  if (!sound) return false;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync().catch(() => {}), 3000);
    return true;
  } catch {
    return false;
  }
}

// ─── Web Audio API 合成音 ─────────────────────────────────────
let audioCtx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  if (!audioCtx) {
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AC();
    } catch { return null; }
  }
  return audioCtx;
}

function synth(type: OscillatorType, freq: number, duration: number, gain = 0.25, delay = 0) {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g); g.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, c.currentTime + delay + duration);
  g.gain.setValueAtTime(gain, c.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration);
}

// 木魚聲 — 短促「咚」
function synthMuyu() {
  synth('triangle', 320, 0.18, 0.3);
  synth('sine',     640, 0.08, 0.12, 0.02);
}

// 清磬 — 高頻泛音衰減
function synthQing() {
  [880, 1320, 1760].forEach((f, i) => synth('sine', f, 0.6, 0.18 - i * 0.04, i * 0.01));
}

// 竹片碰撞 — 擲筊
function synthJiaobei() {
  synth('triangle', 420, 0.09, 0.3);
  synth('triangle', 300, 0.12, 0.2, 0.03);
}

function synthWoodClack() {
  synth('square', 180, 0.045, 0.16);
  synth('triangle', 120, 0.08, 0.1, 0.015);
  synth('sine', 90, 0.12, 0.06, 0.03);
}

// 搖籤筒 — 連續短音
function synthShaker(count = 8) {
  for (let i = 0; i < count; i++) {
    const f = 260 + Math.random() * 180;
    synth('triangle', f, 0.04, 0.08, i * 0.055);
  }
}

// ─── 公開 API ─────────────────────────────────────────────────

// 擲筊落地聲
export async function playTossSound() {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
  const played = await playNativeSound(tryRequire('toss'));
  if (!played) {
    synthJiaobei();
    synthWoodClack();
  }
}

// 聖筊 — 清磬聲 + 成功震動
export async function playShengbeiSound() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  const played = await playNativeSound(tryRequire('shengbei'));
  if (!played) {
    synthWoodClack();
    synthQing();
  }
}

// 抽籤搖筒聲
export async function playDrawSound() {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  const played = await playNativeSound(tryRequire('draw'));
  if (!played) synthShaker();
}

// 上香 — 木魚聲
export async function playIncenseSound() {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); } catch {}
  const played = await playNativeSound(tryRequire('incense'));
  if (!played) {
    synthMuyu();
    synth('triangle', 220, 0.06, 0.08, 0.04);
  }
}

// 結果揭曉 — 銅鑼聲（合成：低頻衰減）
export async function playResultSound() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  const played = await playNativeSound(tryRequire('result'));
  if (!played) {
    synth('sine', 220, 1.2, 0.4);
    synth('sine', 110, 1.5, 0.2, 0.05);
  }
}

export async function vibrateLight() {
  try { const { Vibration } = require('react-native'); Vibration.vibrate(30); } catch {}
}

// ─── 廟宇環境背景音（合成） ──────────────────────────────────
let ambientNodes: { stop: () => void }[] = [];
let ambientInterval: ReturnType<typeof setInterval> | null = null;
let ambientEnabled = false;

function createAmbientDrone() {
  const c = ctx();
  if (!c) return null;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.04, c.currentTime);
  gain.connect(c.destination);

  // 低頻嗡鳴 (廟宇鐘聲基礎音)
  const osc1 = c.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 82.4;
  osc1.connect(gain);
  osc1.start();

  // 泛音
  const osc2 = c.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 164.8;
  const gain2 = c.createGain();
  gain2.gain.value = 0.018;
  osc2.connect(gain2);
  gain2.connect(c.destination);
  osc2.start();

  return {
    stop: () => {
      try { osc1.stop(); osc2.stop(); } catch {}
      try { gain.disconnect(); gain2.disconnect(); } catch {}
    },
  };
}

function playAmbientBell() {
  const c = ctx();
  if (!c) return;
  const freqs = [440, 528, 660];
  freqs.forEach((f, i) => {
    const g = c.createGain();
    g.gain.setValueAtTime(0.06, c.currentTime + i * 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3 + i * 0.02);
    g.connect(c.destination);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(g);
    o.start(c.currentTime + i * 0.02);
    o.stop(c.currentTime + 3 + i * 0.02);
  });
}

export async function startAmbientSound() {
  if (Platform.OS !== 'web') {
    // Native: loop incense sound softly at lower volume
    try {
      if (!SoundLib) {
        const { Audio } = require('expo-av');
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        SoundLib = Audio;
      }
      const { sound } = await SoundLib.Sound.createAsync(
        require('../../assets/sounds/incense.mp3'),
        { shouldPlay: true, isLooping: true, volume: 0.3 }
      );
      ambientNodes.push({ stop: () => sound.unloadAsync().catch(() => {}) });
    } catch {}
    return;
  }
  stopAmbientSound();
  ambientEnabled = true;
  const drone = createAmbientDrone();
  if (drone) ambientNodes.push(drone);
  // Ring a bell every 18-30 seconds
  ambientInterval = setInterval(() => {
    if (!ambientEnabled) return;
    playAmbientBell();
  }, 22000);
  // First bell after 3s
  setTimeout(playAmbientBell, 3000);
}

export function stopAmbientSound() {
  ambientEnabled = false;
  ambientNodes.forEach(n => { try { n.stop(); } catch {} });
  ambientNodes = [];
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

// assets/sounds/{name}.mp3 存在時才 require；不存在時回傳 null
function tryRequire(_name: string): any {
  switch (_name) {
    case 'toss':     return require('../../assets/sounds/toss.mp3');
    case 'shengbei': return require('../../assets/sounds/shengbei.mp3');
    case 'draw':     return require('../../assets/sounds/draw.mp3');
    case 'incense':  return require('../../assets/sounds/incense.mp3');
    case 'result':   return require('../../assets/sounds/result.mp3');
  }
  return null;
}
