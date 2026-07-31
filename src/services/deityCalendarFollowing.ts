import { getSettings, saveSettings, type AppSettings } from '@/services/storage';
import type { UpcomingDeityObservance } from '@/services/lunarDeityCalendar';

const EMPTY_SETTINGS: AppSettings = {
  userName: '',
  birthDate: '',
  preferredGodId: 0,
};

export function normalizeFollowedDeityIds(value?: readonly number[] | null): number[] {
  return [...new Set(
    (Array.isArray(value) ? value : [])
      .filter((id): id is number => Number.isInteger(id) && id > 0),
  )];
}

export function toggleFollowedDeityId(ids: readonly number[], godId: number): number[] {
  const followed = new Set(normalizeFollowedDeityIds(ids));
  if (followed.has(godId)) followed.delete(godId);
  else followed.add(godId);
  return [...followed];
}

export function filterUpcomingForFollowedDeities(
  upcoming: readonly UpcomingDeityObservance[],
  followedGodIds: readonly number[],
): UpcomingDeityObservance[] {
  const followed = new Set(normalizeFollowedDeityIds(followedGodIds));
  return upcoming.filter((item) => followed.has(item.godId));
}

export async function getFollowedDeityIds(): Promise<number[]> {
  const settings = await getSettings();
  return normalizeFollowedDeityIds(settings?.birthdayReminderGodIds);
}

export async function saveFollowedDeityIds(godIds: readonly number[]): Promise<number[]> {
  const normalized = normalizeFollowedDeityIds(godIds);
  const settings = await getSettings();
  await saveSettings({
    ...(settings ?? EMPTY_SETTINGS),
    birthdayReminderGodIds: normalized,
  });
  return normalized;
}
