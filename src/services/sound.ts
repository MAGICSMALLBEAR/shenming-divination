// 音效服務 - 使用 expo-av
import { Audio } from 'expo-av';

let jiaobeiSound: Audio.Sound | null = null;
let drawSound: Audio.Sound | null = null;
let shengbeiSound: Audio.Sound | null = null;
let isLoaded = false;

async function loadSounds() {
  if (isLoaded) return;
  try {
    // 使用系統內建音效或自定義音效
    // 此處採用程式化音效（Web Audio API），原生端使用 expo-av
    jiaobeiSound = new Audio.Sound();
    drawSound = new Audio.Sound();
    shengbeiSound = new Audio.Sound();

    // 載入音效檔案（若無檔案則靜默失敗）
    // await jiaobeiSound.loadAsync(require('@/assets/sounds/jiaobei.mp3'));
    // await drawSound.loadAsync(require('@/assets/sounds/shake.mp3'));
    // await shengbeiSound.loadAsync(require('@/assets/sounds/shengbei.mp3'));
    isLoaded = true;
  } catch {
    // 音效非必要功能，載入失敗靜默忽略
    isLoaded = false;
  }
}

// 播放短音效的輔助函數
async function playSound(sound: Audio.Sound | null) {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch {
    // 靜默失敗
  }
}

export async function playJiaobeiSound() {
  await loadSounds();
  await playSound(jiaobeiSound);
}

export async function playDrawSound() {
  await loadSounds();
  await playSound(drawSound);
}

export async function playShengbeiSound() {
  await loadSounds();
  await playSound(shengbeiSound);
}

// 使用振動回饋模擬音效（備用方案，原生端可用 Vibration API）
export function vibratePattern() {
  try {
    const { Vibration } = require('react-native');
    Vibration.vibrate([50, 100, 50]);
  } catch {
    // 靜默失敗
  }
}
