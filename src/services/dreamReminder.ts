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

export async function setDreamReminderTime(hour: number, minute: number): Promise<boolean> {
  const prefs = await getDreamReminderPreferences();
  const validHour = Math.max(0, Math.min(23, Math.floor(hour)));
  const validMinute = Math.max(0, Math.min(59, Math.floor(minute)));
  const nextPrefs: DreamReminderPreferences = { ...prefs, hour: validHour, minute: validMinute };
  if (nextPrefs.enabled) {
    const scheduled = await scheduleDreamReminder(validHour, validMinute);
    if (!scheduled) return false;
  }
  await setItem(KEY, JSON.stringify(nextPrefs));
  return true;
}

export function formatDreamReminderTime(hour: number, minute: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hour)}:${pad(minute)}`;
}
