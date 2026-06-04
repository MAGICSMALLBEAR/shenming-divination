import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getAllGodBirthdays } from '@/data/lunarCalendar';
import { getDailyPoem } from './dailyPoem';

type NotificationKind = 'daily-poem' | 'god-birthday' | 'wish-reminder';

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

export async function cancelScheduledNotification(
  notificationId?: string | null
): Promise<void> {
  if (!notificationId || Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore missing / expired notification ids.
  }
}

async function cancelNotificationsByType(types: NotificationKind[]): Promise<void> {
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => {
        const type = item.content.data?.type;
        return typeof type === 'string' && types.includes(type as NotificationKind);
      })
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

export async function cancelDailyNotifications(): Promise<void> {
  await cancelNotificationsByType(['daily-poem']);
}

export async function cancelGodBirthdayNotifications(): Promise<void> {
  await cancelNotificationsByType(['god-birthday']);
}

export async function scheduleDailyNotification(): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await cancelDailyNotifications();

  const daily = getDailyPoem();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `今日神明籤詩 | 第 ${daily.poem.number} 籤`,
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

export async function scheduleGodBirthdayNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  await cancelGodBirthdayNotifications();

  const now = new Date();
  const limit = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const birthdays = getAllGodBirthdays(now.getFullYear());

  for (const birthday of birthdays) {
    const reminderDate = new Date(birthday.date);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(20, 0, 0, 0);

    if (reminderDate <= now || reminderDate > limit) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `明日神誕 ${birthday.solarDateStr} | ${birthday.name}`,
          body: '記得安排參拜或向神明表達心意。',
          data: { type: 'god-birthday', name: birthday.name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });
    } catch {
      // Some devices may reject old or duplicated triggers.
    }
  }
}

export async function scheduleWishReminder(params: {
  wishId: string;
  content: string;
  godName: string;
  dueDate: number;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (params.dueDate <= Date.now()) return null;

  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `${params.godName}提醒你回來看看這個心願`,
        body: params.content.length > 38 ? `${params.content.slice(0, 38)}...` : params.content,
        data: {
          type: 'wish-reminder',
          wishId: params.wishId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(params.dueDate),
      },
    });
  } catch {
    return null;
  }
}

export async function sendTestNotification(): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  const daily = getDailyPoem();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `今日神明籤詩 | 第 ${daily.poem.number} 籤`,
      body: daily.poem.content.split('\n')[0],
      data: { type: 'daily-poem' },
    },
    trigger: null,
  });
}
