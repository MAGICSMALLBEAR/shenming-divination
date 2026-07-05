// 主題狀態管理（比照 i18n.ts 的 singleton + listener 模式）
import { DarkTheme, getThemeColors, type ThemeColors, type ThemeMode } from '@/constants/themes';
import { getSettings, saveSettings } from '@/services/storage';

let currentMode: ThemeMode = 'dark';
let systemIsDark = true;
let initialized = false;
const listeners = new Set<() => void>();

export function onThemeChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function notify() {
  listeners.forEach((l) => l());
}

export async function initThemeFromSettings(): Promise<void> {
  if (initialized) return;
  initialized = true;
  const stored = await getSettings();
  if (stored?.theme) {
    currentMode = stored.theme;
    notify();
  }
}

export function setSystemIsDark(isDark: boolean) {
  if (systemIsDark === isDark) return;
  systemIsDark = isDark;
  notify();
}

export function getCurrentThemeMode(): ThemeMode {
  return currentMode;
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  currentMode = mode;
  notify();
  const stored = await getSettings();
  if (stored) {
    await saveSettings({ ...stored, theme: mode });
  }
}

export function getCurrentTheme(): ThemeColors {
  return getThemeColors(currentMode, systemIsDark);
}

export { DarkTheme };
