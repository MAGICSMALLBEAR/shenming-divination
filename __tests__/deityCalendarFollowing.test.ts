import {
  filterUpcomingForFollowedDeities,
  normalizeFollowedDeityIds,
  toggleFollowedDeityId,
} from '@/services/deityCalendarFollowing';
import { getUpcomingDeityObservances } from '@/services/lunarDeityCalendar';

describe('deity calendar following', () => {
  it('normalizes and toggles followed deity ids', () => {
    expect(normalizeFollowedDeityIds([3, 3, 0, -1, 6])).toEqual([3, 6]);
    expect(toggleFollowedDeityId([3, 6], 3)).toEqual([6]);
    expect(toggleFollowedDeityId([6], 3)).toEqual([6, 3]);
  });

  it('filters upcoming observances to followed deities', () => {
    const upcoming = getUpcomingDeityObservances(60, new Date(2027, 3, 1, 12));
    const followed = filterUpcomingForFollowedDeities(upcoming, [3]);

    expect(followed.length).toBeGreaterThan(0);
    expect(followed.every((item) => item.godId === 3)).toBe(true);
    expect(followed[0].title).toBe('天上聖母聖誕');
  });
});
