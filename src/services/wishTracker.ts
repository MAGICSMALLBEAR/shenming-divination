import { cancelScheduledNotification, scheduleWishReminder } from './notifications';
import { getItem, setItem } from './storage';

const WISHES_KEY = '@divination_wishes';

export interface Wish {
  id: string;
  content: string;
  godName: string;
  poemNumber: number;
  poemSummary: string;
  createdAt: number;
  dueDate?: number;
  fulfilled: boolean;
  fulfilledAt?: number;
  gratitude?: string;
  reminderNotificationId?: string;
}

type WishDraft = Omit<
  Wish,
  'id' | 'createdAt' | 'fulfilled' | 'fulfilledAt' | 'gratitude' | 'reminderNotificationId'
>;

function createWishId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

export async function getWishes(): Promise<Wish[]> {
  const data = await getItem(WISHES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addWish(wish: WishDraft): Promise<Wish> {
  const wishes = await getWishes();
  const newWish: Wish = {
    ...wish,
    id: createWishId(),
    createdAt: Date.now(),
    fulfilled: false,
  };

  if (wish.dueDate && wish.dueDate > Date.now()) {
    newWish.reminderNotificationId = await scheduleWishReminder({
      wishId: newWish.id,
      content: newWish.content,
      godName: newWish.godName,
      dueDate: wish.dueDate,
    }) ?? undefined;
  }

  wishes.unshift(newWish);
  await setItem(WISHES_KEY, JSON.stringify(wishes));
  return newWish;
}

export async function fulfillWish(id: string, gratitude: string): Promise<void> {
  const wishes = await getWishes();
  const target = wishes.find((wish) => wish.id === id);
  if (!target) return;

  target.fulfilled = true;
  target.fulfilledAt = Date.now();
  target.gratitude = gratitude;

  if (target.reminderNotificationId) {
    await cancelScheduledNotification(target.reminderNotificationId);
    delete target.reminderNotificationId;
  }

  await setItem(WISHES_KEY, JSON.stringify(wishes));
}

export async function removeWish(id: string): Promise<void> {
  const wishes = await getWishes();
  const target = wishes.find((wish) => wish.id === id);

  if (target?.reminderNotificationId) {
    await cancelScheduledNotification(target.reminderNotificationId);
  }

  await setItem(
    WISHES_KEY,
    JSON.stringify(wishes.filter((wish) => wish.id !== id))
  );
}
