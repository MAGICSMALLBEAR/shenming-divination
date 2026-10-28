import { getItem, setItem } from '@/services/storage';

const KEY = '@divination_dream_privacy';
let unlocked = false;
export interface DreamPrivacySettings { pin?: string; }

export async function getDreamPrivacySettings(): Promise<DreamPrivacySettings> { const raw = await getItem(KEY); try { return raw ? JSON.parse(raw) as DreamPrivacySettings : {}; } catch { return {}; } }
export async function setDreamPin(pin: string): Promise<void> { await setItem(KEY, JSON.stringify({ pin })); unlocked = true; }
export async function clearDreamPin(): Promise<void> { await setItem(KEY, JSON.stringify({})); unlocked = true; }
export async function isDreamJournalLocked(): Promise<boolean> { const settings = await getDreamPrivacySettings(); return Boolean(settings.pin) && !unlocked; }
export async function unlockDreamJournal(pin: string): Promise<boolean> { const settings = await getDreamPrivacySettings(); const valid = Boolean(settings.pin) && settings.pin === pin; if (valid) unlocked = true; return valid; }
