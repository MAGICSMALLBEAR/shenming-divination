// 推播通知服務 - 每日籤詩推播
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDailyPoem } from './dailyPoem';

// 設定通知 handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// 排程每日籤詩通知（早上 7:30）
export async function scheduleDailyNotification(): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  // 取消舊的排程
  await Notifications.cancelAllScheduledNotificationsAsync();

  const daily = getDailyPoem();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏛️ 今日籤詩 · 第 ${daily.poem.number} 籤`,
      body: daily.poem.content.split('\n')[0],
      data: { type: 'daily-poem', poemNumber: daily.poem.number },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 30,
    },
  });
}

// 測試通知（立即發送）
export async function sendTestNotification(): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  const daily = getDailyPoem();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏛️ 今日籤詩 · 第 ${daily.poem.number} 籤`,
      body: daily.poem.content.split('\n')[0],
      data: { type: 'test' },
    },
    trigger: null, // 立即
  });
}
