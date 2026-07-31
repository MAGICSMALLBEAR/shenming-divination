import {
  DEFAULT_DEITY_REMINDER_PREFERENCES,
  normalizeDeityReminderPreferences,
} from '@/services/deityReminderPreferences';
import { getDeityObservanceReminders } from '@/services/lunarDeityCalendar';

describe('deity reminder preferences', () => {
  it('keeps old users on the backwards-compatible all-deity defaults', () => {
    expect(normalizeDeityReminderPreferences()).toEqual(DEFAULT_DEITY_REMINDER_PREFERENCES);
  });

  it('normalizes invalid values and removes duplicate deity ids', () => {
    expect(normalizeDeityReminderPreferences({
      mode: 'selected',
      godIds: [3, 3, -1, 0, 2.5, 6],
      daysBefore: 5 as never,
      hour: 17 as never,
    })).toEqual({
      mode: 'selected',
      godIds: [3, 6],
      daysBefore: 1,
      hour: 20,
    });
  });

  it('only schedules followed deities in selected mode', () => {
    const reminders = getDeityObservanceReminders(
      new Date(2027, 3, 1, 10),
      60,
      { mode: 'selected', godIds: [3], daysBefore: 3, hour: 8 },
    );

    expect(reminders.length).toBeGreaterThan(0);
    expect(reminders.every((item) => item.godId === 3)).toBe(true);
    expect(reminders[0].solarDateStr).toBe('4/29');
    expect(reminders[0].reminderDate.getDate()).toBe(26);
    expect(reminders[0].reminderDate.getHours()).toBe(8);
  });

  it('schedules nothing when selected mode has no followed deity', () => {
    expect(getDeityObservanceReminders(
      new Date(2027, 0, 1, 10),
      370,
      { mode: 'selected', godIds: [], daysBefore: 1, hour: 20 },
    )).toEqual([]);
  });

  it('supports same-day morning reminders', () => {
    const reminder = getDeityObservanceReminders(
      new Date(2027, 3, 1, 10),
      60,
      { mode: 'selected', godIds: [3], daysBefore: 0, hour: 8 },
    )[0];

    expect(reminder.reminderDate.getDate()).toBe(reminder.solarDate.getDate());
    expect(reminder.reminderDate.getHours()).toBe(8);
  });
});
