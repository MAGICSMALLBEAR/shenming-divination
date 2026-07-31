export type DeityReminderMode = 'all' | 'selected';
export type DeityReminderDaysBefore = 0 | 1 | 3 | 7;
export type DeityReminderHour = 8 | 12 | 20;

export interface DeityReminderPreferences {
  mode: DeityReminderMode;
  godIds: number[];
  daysBefore: DeityReminderDaysBefore;
  hour: DeityReminderHour;
}

export const DEFAULT_DEITY_REMINDER_PREFERENCES: DeityReminderPreferences = {
  mode: 'all',
  godIds: [],
  daysBefore: 1,
  hour: 20,
};

export function normalizeDeityReminderPreferences(
  value?: Partial<DeityReminderPreferences> | null,
): DeityReminderPreferences {
  const uniqueGodIds = [...new Set(
    (Array.isArray(value?.godIds) ? value.godIds : [])
      .filter((id): id is number => Number.isInteger(id) && id > 0),
  )];
  const daysBefore = ([0, 1, 3, 7] as const).includes(value?.daysBefore as DeityReminderDaysBefore)
    ? value?.daysBefore as DeityReminderDaysBefore
    : DEFAULT_DEITY_REMINDER_PREFERENCES.daysBefore;
  const hour = ([8, 12, 20] as const).includes(value?.hour as DeityReminderHour)
    ? value?.hour as DeityReminderHour
    : DEFAULT_DEITY_REMINDER_PREFERENCES.hour;

  return {
    mode: value?.mode === 'selected' ? 'selected' : 'all',
    godIds: uniqueGodIds,
    daysBefore,
    hour,
  };
}
