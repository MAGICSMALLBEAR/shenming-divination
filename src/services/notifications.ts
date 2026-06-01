// 推播通知服務 - 每日籤詩 + 神明聖誕提醒
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDailyPoem } from './dailyPoem';
import { getAllGodBirthdays } from '@/data/lunarCalendar';

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

// 排程所有通知（每日籤詩 + 未來 60 天內的神明聖誕）
export async function scheduleDailyNotification(): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  // 1. 每日籤詩（早上 7:30）
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

  // 2. 神明聖誕提醒（聖誕前一晚 20:00，未來 60 天內）
  await scheduleGodBirthdayNotifications();
}

// 排程神明聖誕提醒
export async function scheduleGodBirthdayNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  const now = new Date();
  const limit = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 天後

  const birthdays = getAllGodBirthdays(now.getFullYear());

  for (const bday of birthdays) {
    // 提醒時間：聖誕當天前一晚 20:00
    const reminderDate = new Date(bday.date);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(20, 0, 0, 0);

    if (reminderDate <= now || reminderDate > limit) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🙏 明日 ${bday.solarDateStr} — ${bday.name}`,
          body: '記得明日到廟裡上香祈福，恭祝神明聖誕快樂！',
          data: { type: 'god-birthday', name: bday.name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });
    } catch {
      // 若排程失敗（如重複）則跳過
    }
  }
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
    trigger: null,
  });
}
