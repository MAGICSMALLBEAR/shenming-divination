// 亮/暗雙主題系統（P4）
// 儲存在 AppSettings.theme

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeColors {
  bgDark: string;
  bgMedium: string;
  bgCard: string;
  bgLight: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  red: string;
  redLight: string;
  vermilion: string;
  textDark: string;
  textLight: string;
  textGold: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
}

// 深色主題（原始主題）
export const DarkTheme: ThemeColors = {
  bgDark: '#1A1210',
  bgMedium: '#2C1E16',
  bgCard: '#3D2B1F',
  bgLight: '#FDF5E6',
  gold: '#C9A96E',
  goldLight: '#FFD700',
  goldDark: '#B8860B',
  red: '#990000',
  redLight: '#B22222',
  vermilion: '#E34234',
  textDark: '#333333',
  textLight: '#F8F8FF',
  textGold: '#EEDC82',
  textMuted: '#A09880',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
};

// 淺色主題（宣紙/廟宇白色系）
export const LightTheme: ThemeColors = {
  bgDark: '#FDF8F0',       // 宣紙米白
  bgMedium: '#F5ECD8',     // 淺米色
  bgCard: '#FFFEF5',       // 卡片白
  bgLight: '#FFFFFF',
  gold: '#8B6914',         // 深金（淺底上可見）
  goldLight: '#9B6A00',    // 暗金
  goldDark: '#7A5C0A',     // 更深金
  red: '#8B0000',          // 深紅（廟宇紅）
  redLight: '#A52020',
  vermilion: '#C0392B',
  textDark: '#1A1210',     // 深色文字
  textLight: '#2C1E10',    // 主文字
  textGold: '#7A5C0A',     // 金色文字
  textMuted: '#8B7355',    // 淡色文字
  success: '#2E7D32',
  warning: '#E65100',
  danger: '#C62828',
};

// 根據模式取得顏色
export function getThemeColors(mode: ThemeMode, systemIsDark: boolean): ThemeColors {
  if (mode === 'system') return systemIsDark ? DarkTheme : LightTheme;
  return mode === 'dark' ? DarkTheme : LightTheme;
}

// 主題模式標籤
export const THEME_LABELS: Record<ThemeMode, string> = {
  dark: '深色（廟宇夜色）',
  light: '淺色（宣紙米白）',
  system: '跟隨系統',
};
