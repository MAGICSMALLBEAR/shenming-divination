import {
  DEFAULT_SITE_URL,
  getCalendarFeedFileName,
  getCalendarFeedUrls,
  getCalendarFeedYears,
  getSiteOrigin,
} from '@/services/deityCalendarFeeds';

describe('deity calendar subscription feeds', () => {
  it('builds https and webcal urls for all deities and a single deity', () => {
    expect(getCalendarFeedUrls(null, 'https://example.com/')).toEqual({
      https: 'https://example.com/calendar/all.ics',
      webcal: 'webcal://example.com/calendar/all.ics',
    });
    expect(getCalendarFeedUrls(3, 'https://example.com').webcal).toBe('webcal://example.com/calendar/god-3.ics');
    expect(getCalendarFeedFileName(12)).toBe('god-12.ics');
  });

  it('falls back to the configured or production site when there is no browser origin', () => {
    const originalWindow = (globalThis as { window?: unknown }).window;
    const originalEnv = process.env.EXPO_PUBLIC_SITE_URL;
    try {
      (globalThis as { window?: unknown }).window = {};
      delete process.env.EXPO_PUBLIC_SITE_URL;
      expect(getSiteOrigin()).toBe(DEFAULT_SITE_URL);
      process.env.EXPO_PUBLIC_SITE_URL = 'https://staging.example.com';
      expect(getSiteOrigin()).toBe('https://staging.example.com');
      (globalThis as { window?: unknown }).window = { location: { origin: 'https://preview.example.com' } };
      expect(getSiteOrigin()).toBe('https://preview.example.com');
    } finally {
      (globalThis as { window?: unknown }).window = originalWindow;
      if (originalEnv === undefined) delete process.env.EXPO_PUBLIC_SITE_URL;
      else process.env.EXPO_PUBLIC_SITE_URL = originalEnv;
    }
  });

  it('covers last year through three years ahead', () => {
    expect(getCalendarFeedYears(new Date(2026, 9, 16))).toEqual([2025, 2026, 2027, 2028, 2029]);
  });
});
