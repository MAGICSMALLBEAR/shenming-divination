// 神明日曆訂閱（WebCal）網址。
// 訂閱檔在網頁版打包時由 scripts/generate-calendar-feeds.ts 產生到 dist/calendar/，
// 這個模組不可引入 react-native，產生腳本會在 Node 環境直接使用。

export const DEFAULT_SITE_URL = 'https://shenming-divination.vercel.app';
export const CALENDAR_FEED_PATH = 'calendar';
export const CALENDAR_FEED_REFRESH_HOURS = 24;

/** 訂閱檔涵蓋的國曆年份：去年到三年後，讓行事曆往回、往後都看得到。 */
export function getCalendarFeedYears(today = new Date()): number[] {
  const year = today.getFullYear();
  return [year - 1, year, year + 1, year + 2, year + 3];
}

export function getCalendarFeedFileName(godId?: number | null): string {
  return godId ? `god-${godId}.ics` : 'all.ics';
}

export function getSiteOrigin(): string {
  const location = typeof window !== 'undefined' ? window.location : undefined;
  if (location?.origin && /^https?:/.test(location.origin)) return location.origin;
  return process.env.EXPO_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

export function getCalendarFeedUrls(
  godId?: number | null,
  origin = getSiteOrigin(),
): { https: string; webcal: string } {
  const https = `${origin.replace(/\/$/, '')}/${CALENDAR_FEED_PATH}/${getCalendarFeedFileName(godId)}`;
  return { https, webcal: https.replace(/^https?:/, 'webcal:') };
}
