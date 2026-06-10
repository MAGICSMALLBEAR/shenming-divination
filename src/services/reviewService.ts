// App Store 評分機制（P4）
// 在適當時機（求到好籤後）請用戶評分
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REVIEW_ASKED_KEY = '@review_asked_v1';
const REVIEW_DRAW_COUNT_KEY = '@review_draw_count';
const MIN_DRAWS_BEFORE_REVIEW = 5;

// 好籤等級
const GOOD_POEM_LEVELS = ['上上籤', '上吉', '大吉', '吉', '中上'];

export async function shouldRequestReview(poemLevel: string): Promise<boolean> {
  // 只對好籤觸發
  const isGoodPoem = GOOD_POEM_LEVELS.some(level => poemLevel.includes(level));
  if (!isGoodPoem) return false;

  try {
    // 已請求過評分則不再顯示
    const alreadyAsked = await AsyncStorage.getItem(REVIEW_ASKED_KEY);
    if (alreadyAsked) return false;

    // 累積求籤次數
    const countRaw = await AsyncStorage.getItem(REVIEW_DRAW_COUNT_KEY);
    const count = countRaw ? parseInt(countRaw, 10) : 0;
    const newCount = count + 1;
    await AsyncStorage.setItem(REVIEW_DRAW_COUNT_KEY, String(newCount));

    // 至少求了 MIN_DRAWS_BEFORE_REVIEW 次才提示
    return newCount >= MIN_DRAWS_BEFORE_REVIEW;
  } catch {
    return false;
  }
}

export async function requestReview(): Promise<void> {
  try {
    // 標記已請求
    await AsyncStorage.setItem(REVIEW_ASKED_KEY, '1');

    // 嘗試使用 expo-store-review（若已安裝）
    if (Platform.OS !== 'web') {
      try {
        // expo-store-review 需要安裝後才能使用
        // 安裝方式: npx expo install expo-store-review
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const StoreReview = await import('expo-store-review' as any);
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
          return;
        }
      } catch {
        // expo-store-review 未安裝，靜默忽略
      }
    }
  } catch { /* ignore */ }
}

export async function resetReviewStatus(): Promise<void> {
  await AsyncStorage.removeItem(REVIEW_ASKED_KEY);
  await AsyncStorage.removeItem(REVIEW_DRAW_COUNT_KEY);
}
