// Freemium 訂閱服務
// 目前使用本地狀態模擬，未來接入 RevenueCat / Stripe

import AsyncStorage from '@react-native-async-storage/async-storage';

export type PremiumPlan = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface PremiumStatus {
  plan: PremiumPlan;
  expiresAt: number | null; // timestamp ms, null = forever / not set
  activatedAt: number | null;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredPlan: PremiumPlan;
}

const STORAGE_KEY = '@divination_premium';

const FREE_TRIAL_DRAWS = 3; // 免費每日最多求籤次數

// 付費功能定義
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited_draws',
    name: '無限求籤',
    description: '每日無限次求籤，不受次數限制',
    requiredPlan: 'monthly',
  },
  {
    id: 'detailed_ai',
    name: '詳細 AI 解籤',
    description: '完整 AI 解析 + 追問功能',
    requiredPlan: 'monthly',
  },
  {
    id: 'year_fortune',
    name: '流年/流月運勢',
    description: '個人化年度運勢、逐月詳細報告',
    requiredPlan: 'monthly',
  },
  {
    id: 'bazi_advanced',
    name: '完整八字命理',
    description: '四柱八字、十神分析、大運流年',
    requiredPlan: 'monthly',
  },
  {
    id: 'match_analysis',
    name: '合婚分析',
    description: '兩人生肖/五行相性深度分析',
    requiredPlan: 'monthly',
  },
  {
    id: '择日',
    name: '擇日服務',
    description: '婚禮/開業/入宅等重要事項吉日推薦',
    requiredPlan: 'monthly',
  },
  {
    id: 'online_candle',
    name: '線上點燈',
    description: '為神明點長明燈，祈求庇護',
    requiredPlan: 'monthly',
  },
  {
    id: 'consult',
    name: '真人解籤諮詢',
    description: '預約解籤師一對一視訊諮詢（30分鐘）',
    requiredPlan: 'yearly',
  },
  {
    id: 'ad_free',
    name: '無廣告體驗',
    description: '享受純淨無廣告的占卜體驗',
    requiredPlan: 'monthly',
  },
];

// 訂閱方案
export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly' as PremiumPlan,
    name: '月訂閱',
    price: 'NT$99',
    period: '/月',
    badge: null,
    features: PREMIUM_FEATURES.filter(f => f.requiredPlan === 'monthly').map(f => f.name),
    highlight: false,
  },
  {
    id: 'yearly' as PremiumPlan,
    name: '年訂閱',
    price: 'NT$799',
    period: '/年',
    badge: '省 33%',
    features: PREMIUM_FEATURES.map(f => f.name),
    highlight: true,
  },
  {
    id: 'lifetime' as PremiumPlan,
    name: '終身版',
    price: 'NT$1,999',
    period: '一次付清',
    badge: '最超值',
    features: [...PREMIUM_FEATURES.map(f => f.name), '未來所有新功能'],
    highlight: false,
  },
];

let _cachedStatus: PremiumStatus | null = null;

export async function getPremiumStatus(): Promise<PremiumStatus> {
  if (_cachedStatus) return _cachedStatus;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      _cachedStatus = JSON.parse(raw) as PremiumStatus;
      return _cachedStatus;
    }
  } catch { /* ignore */ }
  _cachedStatus = { plan: 'free', expiresAt: null, activatedAt: null };
  return _cachedStatus;
}

export async function savePremiumStatus(status: PremiumStatus): Promise<void> {
  _cachedStatus = status;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}

// 檢查是否為付費用戶（未過期）
export async function isPremiumActive(): Promise<boolean> {
  const status = await getPremiumStatus();
  if (status.plan === 'free') return false;
  if (status.plan === 'lifetime') return true;
  if (!status.expiresAt) return false;
  return Date.now() < status.expiresAt;
}

// 檢查特定功能是否可用
export async function canUseFeature(featureId: string): Promise<boolean> {
  const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
  if (!feature) return true; // 未定義的功能預設可用
  if (feature.requiredPlan === 'free') return true;
  return isPremiumActive();
}

// 免費版每日求籤次數檢查
const _drawCountKey = `@divination_daily_draws_${new Date().toDateString()}`;
export async function checkFreeDailyDraws(): Promise<{ allowed: boolean; remaining: number; used: number }> {
  const isPremium = await isPremiumActive();
  if (isPremium) return { allowed: true, remaining: Infinity, used: 0 };
  try {
    const raw = await AsyncStorage.getItem(_drawCountKey);
    const used = raw ? parseInt(raw, 10) : 0;
    const remaining = Math.max(0, FREE_TRIAL_DRAWS - used);
    return { allowed: remaining > 0, remaining, used };
  } catch {
    return { allowed: true, remaining: FREE_TRIAL_DRAWS, used: 0 };
  }
}

export async function incrementDailyDrawCount(): Promise<void> {
  const isPremium = await isPremiumActive();
  if (isPremium) return;
  try {
    const raw = await AsyncStorage.getItem(_drawCountKey);
    const current = raw ? parseInt(raw, 10) : 0;
    await AsyncStorage.setItem(_drawCountKey, String(current + 1));
  } catch { /* ignore */ }
}

// 模擬訂閱啟用（正式版接 IAP）
export async function activatePlan(plan: PremiumPlan): Promise<void> {
  const now = Date.now();
  let expiresAt: number | null = null;
  if (plan === 'monthly') expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  if (plan === 'yearly') expiresAt = now + 365 * 24 * 60 * 60 * 1000;
  await savePremiumStatus({ plan, expiresAt, activatedAt: now });
}

export async function cancelPlan(): Promise<void> {
  await savePremiumStatus({ plan: 'free', expiresAt: null, activatedAt: null });
}
