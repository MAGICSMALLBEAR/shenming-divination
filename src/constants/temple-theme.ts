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
  // 新增：區段間距
  section: 36,    // 兩大區塊之間
  cardGap: 12,    // 卡片之間
  listGap: 10,    // 列表項目之間
} as const;

export const TempleFonts = {
  // 字級（略縮，適配手機更友好）
  hero: 26,        // 首頁大標
  title: 28,       // 頁面標題
  subtitle: 22,    // 副標
  heading: 20,     // 區塊標題
  body: 16,        // 內文
  small: 14,       // 輔助文字
  poem: 18,        // 籤詩文字
  caption: 12,     // 註解/標籤
  overline: 10,    // 小標籤（全大寫間距字）

  // 字重
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,

  // 行高倍率
  lhTight: 1.2,    // 標題
  lhNormal: 1.5,   // 內文
  lhRelaxed: 1.75, // 籤詩/長文

  // 字距
  lsHeading: 0.5,  // 標題字距
  lsOverline: 2,   // 小標籤字距
} as const;

// 一個動畫時間常量，全站共用
export const TempleDuration = {
  fast: 200,       // 微互動（按鈕回饋）
  normal: 400,     // 一般過場
  slow: 700,       // 揭示動畫
  reveal: 900,     // 籤詩展開
} as const;
