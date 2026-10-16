/// <reference types="node" />
// 產生神明日曆訂閱檔（WebCal）。由 `npm run calendar:feeds` 經 esbuild 打包後執行。
// 用法：node <bundle> [輸出資料夾，預設 dist/calendar]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { gods } from '@/data/gods';
import { buildDeityCalendarIcs } from '@/services/deityCalendarIcs';
import {
  CALENDAR_FEED_REFRESH_HOURS,
  getCalendarFeedFileName,
  getCalendarFeedYears,
} from '@/services/deityCalendarFeeds';
import { DEITY_OBSERVANCES, getDeityObservancesForSolarYear } from '@/services/lunarDeityCalendar';

const outDir = process.argv[2] ?? join('dist', 'calendar');
const generatedAt = new Date();
const options = { refreshHours: CALENDAR_FEED_REFRESH_HOURS };
const occurrences = getCalendarFeedYears(generatedAt).flatMap(getDeityObservancesForSolarYear);

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, getCalendarFeedFileName()),
  buildDeityCalendarIcs(occurrences, '神明日曆', generatedAt, options),
);

const godIds = [...new Set(DEITY_OBSERVANCES.map((item) => item.godId))];
for (const godId of godIds) {
  const god = gods.find((item) => item.id === godId);
  if (!god) continue;
  writeFileSync(
    join(outDir, getCalendarFeedFileName(godId)),
    buildDeityCalendarIcs(
      occurrences.filter((item) => item.god.id === godId),
      `${god.name}紀念日`,
      generatedAt,
      options,
    ),
  );
}

console.log(`calendar feeds: ${godIds.length + 1} files, ${occurrences.length} events → ${outDir}`);
