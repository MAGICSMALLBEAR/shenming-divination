import { useEffect, useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';
import {
  getCurrentTheme,
  getCurrentThemeMode,
  onThemeChange,
  setSystemIsDark,
  setThemeMode,
} from '@/services/themeStore';
import type { ThemeColors, ThemeMode } from '@/constants/themes';

export interface AppTheme {
  theme: ThemeColors;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export function useAppTheme(): AppTheme {
  const systemScheme = useColorScheme();

  useEffect(() => {
    setSystemIsDark(systemScheme === 'dark');
  }, [systemScheme]);

  const mode = useSyncExternalStore(onThemeChange, getCurrentThemeMode);
  const theme = useSyncExternalStore(onThemeChange, getCurrentTheme);

  return { theme, mode, setMode: setThemeMode };
}
