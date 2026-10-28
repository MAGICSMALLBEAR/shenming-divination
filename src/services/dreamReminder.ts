import { getItem, setItem } from '@/services/storage';
import { cancelDreamReminder, scheduleDreamReminder } from '@/services/notifications';

const KEY = '@divination_dream_reminder';

export interface DreamReminderPreferences { enabled: boolean; hour: number; minute: number; }
const defaults: DreamReminderPreferences = { enabled: false, hour: 7, minute: 30 };

export async function getDreamReminderPreferences(): Promise<DreamReminderPreferences> {
  const raw = await getItem(KEY);
  if (!raw) return defaults;
  try {
    const value = JSON.parse(raw) as Partial<DreamReminderPreferences>;
    return { enabled: Boolean(value.enabled), hour: Number.isInteger(value.hour) && value.hour! >= 0 && value.hour! <= 23 ? value.hour! : 7, minute: Number.isInteger(value.minute) && value.minute! >= 0 && value.minute! <= 59 ? value.minute! : 30 };
  } catch { return defaults; }
}

export async function setDreamReminderEnabled(enabled: boolean): Promise<boolean> {
  const prefs = await getDreamReminderPreferences();
  if (enabled) {
    const scheduled = await scheduleDreamReminder(prefs.hour, prefs.minute);
    if (!scheduled) return false;
  } else await cancelDreamReminder();
  await setItem(KEY, JSON.stringify({ ...prefs, enabled }));
  return true;
}
