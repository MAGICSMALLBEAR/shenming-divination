// 每首籤詩的視覺主題：圖示、背景色、幸運色、幸運數字
// 根據籤詩典故和吉凶設計

export interface PoemTheme {
  icon: string;
  bgColor: string;
  borderColor: string;
  luckyColor: string;
  luckyColorName: string;
  luckyNumber: number;
}

const LEVEL_DEFAULTS = {
  '上上': { bgColor: '#C9A96E15', borderColor: '#C9A96E' },
  '大吉': { bgColor: '#C9A96E15', borderColor: '#C9A96E' },
  '中吉': { bgColor: '#4CAF5015', borderColor: '#4CAF50' },
  '中平': { bgColor: '#FF980015', borderColor: '#FF9800' },
  '下下': { bgColor: '#F4433615', borderColor: '#F44336' },
};

// 個別籤詩主題，未設定者用等級預設
const POEM_THEMES: Record<number, Partial<PoemTheme>> = {
  1:  { icon: '☁️', luckyColor: '#4169E1', luckyColorName: '靛藍', luckyNumber: 9 },
  2:  { icon: '🌸', luckyColor: '#FF69B4', luckyColorName: '粉紅', luckyNumber: 6 },
  3:  { icon: '🌳', luckyColor: '#228B22', luckyColorName: '墨綠', luckyNumber: 3 },
  4:  { icon: '⚖️', luckyColor: '#8B4513', luckyColorName: '棕色', luckyNumber: 4 },
  5:  { icon: '⚡', luckyColor: '#FFD700', luckyColorName: '金黃', luckyNumber: 5 },
  6:  { icon: '🦅', luckyColor: '#FF4500', luckyColorName: '朱紅', luckyNumber: 7 },
  7:  { icon: '🌙', luckyColor: '#C0C0C0', luckyColorName: '銀白', luckyNumber: 8 },
  8:  { icon: '🐉', luckyColor: '#9400D3', luckyColorName: '紫色', luckyNumber: 8 },
  9:  { icon: '🌷', luckyColor: '#FF6347', luckyColorName: '橘紅', luckyNumber: 2 },
  10: { icon: '🏮', luckyColor: '#DC143C', luckyColorName: '緋紅', luckyNumber: 10 },
  11: { icon: '⭐', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 1 },
  12: { icon: '❄️', luckyColor: '#87CEEB', luckyColorName: '天藍', luckyNumber: 7 },
  13: { icon: '🌊', luckyColor: '#00008B', luckyColorName: '深藍', luckyNumber: 3 },
  14: { icon: '🦋', luckyColor: '#DA70D6', luckyColorName: '蘭紫', luckyNumber: 4 },
  15: { icon: '🎖️', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 5 },
  16: { icon: '🌅', luckyColor: '#FF7F50', luckyColorName: '珊瑚', luckyNumber: 6 },
  17: { icon: '🕯️', luckyColor: '#FFFACD', luckyColorName: '淡黃', luckyNumber: 7 },
  18: { icon: '📖', luckyColor: '#2E8B57', luckyColorName: '深綠', luckyNumber: 8 },
  19: { icon: '🍃', luckyColor: '#32CD32', luckyColorName: '翠綠', luckyNumber: 9 },
  20: { icon: '🏆', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 1 },
  21: { icon: '⚔️', luckyColor: '#B22222', luckyColorName: '火紅', luckyNumber: 6 },
  22: { icon: '🎵', luckyColor: '#9370DB', luckyColorName: '紫丁香', luckyNumber: 7 },
  23: { icon: '🌟', luckyColor: '#FFD700', luckyColorName: '金黃', luckyNumber: 8 },
  24: { icon: '🌧️', luckyColor: '#708090', luckyColorName: '灰藍', luckyNumber: 2 },
  25: { icon: '🐟', luckyColor: '#4682B4', luckyColorName: '鋼藍', luckyNumber: 8 },
  26: { icon: '🌺', luckyColor: '#FF69B4', luckyColorName: '粉紅', luckyNumber: 5 },
  27: { icon: '🗺️', luckyColor: '#DAA520', luckyColorName: '暗金', luckyNumber: 3 },
  28: { icon: '🐉', luckyColor: '#FFD700', luckyColorName: '金黃', luckyNumber: 8 },
  29: { icon: '💎', luckyColor: '#00CED1', luckyColorName: '青碧', luckyNumber: 4 },
  30: { icon: '⚡', luckyColor: '#FF4500', luckyColorName: '橘紅', luckyNumber: 9 },
  31: { icon: '🍂', luckyColor: '#D2691E', luckyColorName: '棕橙', luckyNumber: 6 },
  32: { icon: '⚖️', luckyColor: '#191970', luckyColorName: '深藍', luckyNumber: 7 },
  33: { icon: '🪷', luckyColor: '#FF69B4', luckyColorName: '蓮粉', luckyNumber: 8 },
  34: { icon: '📜', luckyColor: '#8B0000', luckyColorName: '深紅', luckyNumber: 1 },
  35: { icon: '🍷', luckyColor: '#722F37', luckyColorName: '酒紅', luckyNumber: 5 },
  36: { icon: '👑', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 9 },
  37: { icon: '🌨️', luckyColor: '#B0C4DE', luckyColorName: '霧藍', luckyNumber: 4 },
  38: { icon: '🌹', luckyColor: '#DC143C', luckyColorName: '深紅', luckyNumber: 3 },
  39: { icon: '🌏', luckyColor: '#008000', luckyColorName: '正綠', luckyNumber: 5 },
  40: { icon: '🍑', luckyColor: '#FFDAB9', luckyColorName: '蟠桃粉', luckyNumber: 3 },
  41: { icon: '🐪', luckyColor: '#C4A35A', luckyColorName: '沙褐', luckyNumber: 6 },
  42: { icon: '🌕', luckyColor: '#C0C0C0', luckyColorName: '月白', luckyNumber: 8 },
  43: { icon: '🦅', luckyColor: '#228B22', luckyColorName: '國旗綠', luckyNumber: 7 },
  44: { icon: '🖌️', luckyColor: '#4B0082', luckyColorName: '靛紫', luckyNumber: 4 },
  45: { icon: '🐂', luckyColor: '#8B4513', luckyColorName: '土褐', luckyNumber: 1 },
  46: { icon: '💤', luckyColor: '#9370DB', luckyColorName: '薰衣草', luckyNumber: 3 },
  47: { icon: '🏅', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 7 },
  48: { icon: '🌸', luckyColor: '#FFB6C1', luckyColorName: '淡粉', luckyNumber: 6 },
  49: { icon: '🐒', luckyColor: '#FF8C00', luckyColorName: '橙色', luckyNumber: 9 },
  50: { icon: '🧘', luckyColor: '#778899', luckyColorName: '鐵灰', luckyNumber: 5 },
  51: { icon: '🌾', luckyColor: '#6B8E23', luckyColorName: '橄欖', luckyNumber: 4 },
  52: { icon: '👑', luckyColor: '#4169E1', luckyColorName: '皇藍', luckyNumber: 6 },
  53: { icon: '🌌', luckyColor: '#191970', luckyColorName: '深藍', luckyNumber: 3 },
  54: { icon: '🧠', luckyColor: '#6A0DAD', luckyColorName: '深紫', luckyNumber: 7 },
  55: { icon: '⚔️', luckyColor: '#708090', luckyColorName: '鐵灰', luckyNumber: 8 },
  56: { icon: '💊', luckyColor: '#FF6347', luckyColorName: '朱橘', luckyNumber: 2 },
  57: { icon: '🌟', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 9 },
  58: { icon: '🌊', luckyColor: '#4169E1', luckyColorName: '皇藍', luckyNumber: 6 },
  59: { icon: '🐍', luckyColor: '#228B22', luckyColorName: '深綠', luckyNumber: 3 },
  60: { icon: '⛩️', luckyColor: '#DC143C', luckyColorName: '緋紅', luckyNumber: 8 },
  // 61–100 用等級預設，emoji 從典故推算
  61: { icon: '🧱', luckyColor: '#A0522D', luckyColorName: '赭石', luckyNumber: 9 },
  62: { icon: '🤝', luckyColor: '#2E8B57', luckyColorName: '翠綠', luckyNumber: 7 },
  63: { icon: '🗡️', luckyColor: '#4682B4', luckyColorName: '鋼藍', luckyNumber: 5 },
  64: { icon: '🐉', luckyColor: '#FFD700', luckyColorName: '金黃', luckyNumber: 8 },
  65: { icon: '🏛️', luckyColor: '#8B4513', luckyColorName: '棕色', luckyNumber: 4 },
  66: { icon: '⛵', luckyColor: '#00CED1', luckyColorName: '深青', luckyNumber: 6 },
  67: { icon: '📿', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 7 },
  68: { icon: '🦋', luckyColor: '#FF69B4', luckyColorName: '粉紅', luckyNumber: 9 },
  69: { icon: '🎣', luckyColor: '#5F9EA0', luckyColorName: '青碧', luckyNumber: 3 },
  70: { icon: '🐯', luckyColor: '#FF8C00', luckyColorName: '橙色', luckyNumber: 5 },
  71: { icon: '✨', luckyColor: '#4169E1', luckyColorName: '藍色', luckyNumber: 8 },
  72: { icon: '⚓', luckyColor: '#1E3A5F', luckyColorName: '海藍', luckyNumber: 8 },
  73: { icon: '🌷', luckyColor: '#FF69B4', luckyColorName: '粉紅', luckyNumber: 7 },
  74: { icon: '🌿', luckyColor: '#228B22', luckyColorName: '深綠', luckyNumber: 4 },
  75: { icon: '🏯', luckyColor: '#B8860B', luckyColorName: '暗金', luckyNumber: 5 },
  76: { icon: '☁️', luckyColor: '#B0C4DE', luckyColorName: '霧藍', luckyNumber: 1 },
  77: { icon: '📐', luckyColor: '#191970', luckyColorName: '深藍', luckyNumber: 6 },
  78: { icon: '🍖', luckyColor: '#8B0000', luckyColorName: '深紅', luckyNumber: 3 },
  79: { icon: '🥁', luckyColor: '#9370DB', luckyColorName: '紫色', luckyNumber: 9 },
  80: { icon: '🍑', luckyColor: '#FFB6C1', luckyColorName: '桃粉', luckyNumber: 3 },
  81: { icon: '💔', luckyColor: '#8B0000', luckyColorName: '深紅', luckyNumber: 2 },
  82: { icon: '🌿', luckyColor: '#228B22', luckyColorName: '草綠', luckyNumber: 5 },
  83: { icon: '🌉', luckyColor: '#9370DB', luckyColorName: '夜紫', luckyNumber: 7 },
  84: { icon: '❄️', luckyColor: '#4169E1', luckyColorName: '藍色', luckyNumber: 8 },
  85: { icon: '🐑', luckyColor: '#DCDCDC', luckyColorName: '銀白', luckyNumber: 5 },
  86: { icon: '💰', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 8 },
  87: { icon: '📊', luckyColor: '#2E8B57', luckyColorName: '翡翠', luckyNumber: 3 },
  88: { icon: '👟', luckyColor: '#C4A35A', luckyColorName: '古銅', luckyNumber: 6 },
  89: { icon: '🌾', luckyColor: '#6B8E23', luckyColorName: '橄欖', luckyNumber: 4 },
  90: { icon: '🌈', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 9 },
  91: { icon: '📚', luckyColor: '#8B4513', luckyColorName: '棕色', luckyNumber: 6 },
  92: { icon: '🎨', luckyColor: '#228B22', luckyColorName: '翠綠', luckyNumber: 3 },
  93: { icon: '🎓', luckyColor: '#4169E1', luckyColorName: '寶藍', luckyNumber: 1 },
  94: { icon: '⛰️', luckyColor: '#808080', luckyColorName: '石灰', luckyNumber: 8 },
  95: { icon: '🏠', luckyColor: '#8B4513', luckyColorName: '棕色', luckyNumber: 7 },
  96: { icon: '🌟', luckyColor: '#FFD700', luckyColorName: '金色', luckyNumber: 6 },
  97: { icon: '🌸', luckyColor: '#FFB6C1', luckyColorName: '梅粉', luckyNumber: 5 },
  98: { icon: '🐉', luckyColor: '#FF6347', luckyColorName: '橘紅', luckyNumber: 4 },
  99: { icon: '🌅', luckyColor: '#FF4500', luckyColorName: '朱紅', luckyNumber: 9 },
  100: { icon: '⛵', luckyColor: '#1E90FF', luckyColorName: '道奇藍', luckyNumber: 10 },
};

export function getPoemTheme(poemNumber: number, level: string): PoemTheme {
  const custom = POEM_THEMES[poemNumber] || {};
  const levelKey = Object.keys(LEVEL_DEFAULTS).find(k => level.includes(k)) || '中平';
  const levelDef = LEVEL_DEFAULTS[levelKey as keyof typeof LEVEL_DEFAULTS];

  return {
    icon: custom.icon || '📿',
    bgColor: custom.bgColor || levelDef.bgColor,
    borderColor: custom.borderColor || levelDef.borderColor,
    luckyColor: custom.luckyColor || '#C9A96E',
    luckyColorName: custom.luckyColorName || '金色',
    luckyNumber: custom.luckyNumber ?? ((poemNumber * 7 + 3) % 9 + 1),
  };
}
