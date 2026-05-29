// 每日一籤服務 - 基於日期生成穩定的每日籤詩
import { leiyushiPoems } from '@/data/poems/leiyushi';
import type { Poem } from '@/data/poems/leiyushi';

// 根據日期產生固定的籤號（同一天所有人看到同一支籤）
function getDailyPoemIndex(): number {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // 簡單的 hash 函數
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

export function getDailyPoem(): { poem: Poem; date: string; dayOfWeek: string } {
  const index = getDailyPoemIndex();
  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return {
    poem: leiyushiPoems[index],
    date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    dayOfWeek: `星期${weekdays[today.getDay()]}`,
  };
}

// 取得本週每日籤
export function getWeeklyPoems(): Array<{ poem: Poem; date: string; dayOfWeek: string }> {
  const result = [];
  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    let hash = 0;
    for (let j = 0; j < dateStr.length; j++) {
      const char = dateStr.charCodeAt(j);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % 100;

    result.push({
      poem: leiyushiPoems[index],
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      dayOfWeek: `週${weekdays[date.getDay()]}`,
    });
  }
  return result;
}
