// 願望追蹤服務
import { getItem, setItem, removeItem } from './storage';

const WISHES_KEY = '@divination_wishes';

export interface Wish {
  id: string;
  content: string;
  godName: string;
  poemNumber: number;
  poemSummary: string;
  createdAt: number;
  dueDate?: number;       // 預計還願日期
  fulfilled: boolean;
  fulfilledAt?: number;
  gratitude?: string;     // 還願感謝文
}

export async function getWishes(): Promise<Wish[]> {
  const data = await getItem(WISHES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addWish(wish: Omit<Wish, 'id' | 'createdAt' | 'fulfilled'>): Promise<Wish> {
  const wishes = await getWishes();
  const newWish: Wish = {
    ...wish,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    createdAt: Date.now(),
    fulfilled: false,
  };
  wishes.unshift(newWish);
  await setItem(WISHES_KEY, JSON.stringify(wishes));
  return newWish;
}

export async function fulfillWish(id: string, gratitude: string): Promise<void> {
  const wishes = await getWishes();
  const idx = wishes.findIndex(w => w.id === id);
  if (idx !== -1) {
    wishes[idx].fulfilled = true;
    wishes[idx].fulfilledAt = Date.now();
    wishes[idx].gratitude = gratitude;
    await setItem(WISHES_KEY, JSON.stringify(wishes));
  }
}

export async function removeWish(id: string): Promise<void> {
  const wishes = await getWishes();
  await setItem(WISHES_KEY, JSON.stringify(wishes.filter(w => w.id !== id)));
}
