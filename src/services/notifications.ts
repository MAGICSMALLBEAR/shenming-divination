import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getAllGodBirthdays } from '@/data/lunarCalendar';
import { getDailyPoem } from './dailyPoem';
import { getCurrentSolarTerm, getNextSolarTerm } from './solarTerms';

type NotificationKind = 'daily-poem' | 'god-birthday' | 'wish-reminder' | 'fortune-widget';

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

/**
 * 每日運勢通知 — Widget 替代方案
 * Expo SDK 56 不支援原生 Widget，改以每天 08:00 發送富文字通知
 * 包含當日節氣、籤詩頭句、行事宜忌，讓鎖定螢幕/通知中心有類 Widget 體驗
 * Widget 原生支援預計在 Expo SDK 57+ (expo-widgets) 實作
 */
export async function scheduleFortuneWidgetNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  // Cancel any existing fortune-widget notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.type === 'fortune-widget')
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );

  const daily = getDailyPoem();
  const solarTerm = getCurrentSolarTerm();
  const next = getNextSolarTerm();

  const solarLine = solarTerm
    ? `【${solarTerm.name}】宜${solarTerm.auspicious} · 忌${solarTerm.avoid}`
    : next
    ? `距${next.term.name}還有 ${next.daysUntil} 天`
    : '';

  const poemLine = daily.poem.content.split('\n')[0];

  const title = solarTerm
    ? `☀️ ${solarTerm.name} · 今日神諭`
    : `🏮 今日神明籤詩 · 第 ${daily.poem.number} 籤`;

  const body = [poemLine, solarLine].filter(Boolean).join('\n');

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        type: 'fortune-widget',
        poemNumber: daily.poem.number,
        solarTermName: solarTerm?.name ?? null,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}

export async function cancelFortuneWidgetNotification(): Promise<void> {
  await cancelNotificationsByType(['fortune-widget']);
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
