import { leiyushiPoems } from '@/data/poems/leiyushi';
import type { Poem } from '@/data/poems/leiyushi';

function hashDate(date: Date): number {
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function formatWeekday(date: Date): string {
  return ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()];
}

export function getDailyPoem(): { poem: Poem; date: string; dayOfWeek: string } {
  const today = new Date();
  const index = hashDate(today) % leiyushiPoems.length;

  return {
    poem: leiyushiPoems[index],
    date: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`,
    dayOfWeek: formatWeekday(today),
  };
}

export function getWeeklyPoems(): { poem: Poem; date: string; dayOfWeek: string }[] {
  const result: { poem: Poem; date: string; dayOfWeek: string }[] = [];
  const today = new Date();

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + index);
    const poemIndex = hashDate(date) % leiyushiPoems.length;

    result.push({
      poem: leiyushiPoems[poemIndex],
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      dayOfWeek: formatWeekday(date),
    });
  }

  return result;
}
