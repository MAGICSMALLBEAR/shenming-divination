// 神明占卜主題色
export const TempleTheme = {
  // 背景色
  bgDark: '#1A1210',        // 深色廟宇背景
  bgMedium: '#2C1E16',      // 中深色
  bgCard: '#3D2B1F',        // 卡片背景
  bgLight: '#FDF5E6',       // 籤紙/宣紙色

  // 點綴色
  gold: '#C9A96E',          // 主金色
  goldLight: '#FFD700',     // 亮金色
  goldDark: '#B8860B',      // 暗金色

  // 功能色
  red: '#990000',           // 廟宇紅
  redLight: '#B22222',      // 亮紅
  vermilion: '#E34234',     // 朱紅

  // 文字色
  textDark: '#333333',      // 深色文字(用於淺底)
  textLight: '#F8F8FF',     // 淺色文字(用於深底)
  textGold: '#EEDC82',      // 金色文字
  textMuted: '#A09880',     // 淡色文字

  // 狀態色
  success: '#4CAF50',       // 聖筊/吉利
  warning: '#FF9800',       // 笑筊/提醒
  danger: '#F44336',        // 陰筊/注意
} as const;

export const TempleSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const TempleFonts = {
  title: 32,
  subtitle: 24,
  heading: 20,
  body: 16,
  small: 14,
  poem: 18,       // 籤詩文字
} as const;
