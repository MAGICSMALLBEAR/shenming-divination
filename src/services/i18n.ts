// 多語言服務 (i18n)

export type Lang = 'zh-TW' | 'en' | 'ja';

const translations: Record<string, Record<Lang, string>> = {
  appName: { 'zh-TW': '神明占卜', en: 'Divine Oracle', ja: '神様占い' },
  drawLots: { 'zh-TW': '求籤', en: 'Draw Lots', ja: 'おみくじ' },
  collection: { 'zh-TW': '收藏', en: 'Collection', ja: 'お気に入り' },
  wishes: { 'zh-TW': '願望', en: 'Wishes', ja: '願い事' },
  settings: { 'zh-TW': '設定', en: 'Settings', ja: '設定' },
  today: { 'zh-TW': '今日', en: 'Today', ja: '今日' },
  chat: { 'zh-TW': '追問', en: 'Chat', ja: '質問する' },
  stats: { 'zh-TW': '統計', en: 'Stats', ja: '統計' },
  selectGod: { 'zh-TW': '請選擇神明', en: 'Select Deity', ja: '神様を選んでください' },
  meditate: { 'zh-TW': '靜心冥想', en: 'Meditate', ja: '瞑想' },
  toss: { 'zh-TW': '擲筊', en: 'Toss Blocks', ja: 'おみくじを投げる' },
  shengbei: { 'zh-TW': '聖筊', en: 'Divine Yes', ja: '聖筊' },
  xiaobei: { 'zh-TW': '笑筊', en: 'Laughing', ja: '笑筊' },
  yinbei: { 'zh-TW': '陰筊', en: 'Divine No', ja: '陰筊' },
  drawAgain: { 'zh-TW': '再求一籤', en: 'Draw Again', ja: 'もう一度引く' },
  share: { 'zh-TW': '分享', en: 'Share', ja: '共有' },
  save: { 'zh-TW': '儲存', en: 'Save', ja: '保存' },
  todayPoem: { 'zh-TW': '今日籤詩', en: 'Daily Poem', ja: '今日のおみくじ' },
  noData: { 'zh-TW': '尚無資料', en: 'No Data', ja: 'データなし' },
};

let currentLang: Lang = 'zh-TW';
const listeners = new Set<(lang: Lang) => void>();

export function onLanguageChange(listener: (lang: Lang) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function setLanguage(lang: Lang) {
  currentLang = lang;
  listeners.forEach(l => l(lang));
}

export function getLanguage(): Lang {
  return currentLang;
}

export function t(key: string, params?: Record<string, string | number>): string {
  let text = translations[key]?.[currentLang] || translations[key]?.['zh-TW'] || key;
  if (params) {
    Object.keys(params).forEach((k) => {
      text = text.replace(new RegExp(`{${k}}`, 'g'), String(params[k]));
    });
  }
  return text;
}

export function getTranslations() {
  return translations;
}

export function addTranslations(newTranslations: Record<string, Record<Lang, string>>) {
  Object.assign(translations, newTranslations);
}

