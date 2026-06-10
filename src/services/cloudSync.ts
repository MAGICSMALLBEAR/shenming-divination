// 雲端同步服務（Firebase Firestore）
// 同步使用者的求籤記錄、八字資料、設定

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseApp, isFirebaseConfigured } from './firebaseConfig';
import { getCurrentUser } from './authService';

export interface DivinationRecord {
  id?: string;
  godId: number;
  godName: string;
  poemNumber: number;
  poemLevel: string;
  poemContent: string;
  question?: string;
  interpretation?: string;
  timestamp: Date | null;
}

export interface UserProfile {
  uid: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  gender?: 'male' | 'female';
  favoriteGods?: number[];
  settings?: Record<string, unknown>;
  updatedAt: Date | null;
}

function getDb() {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase 尚未設定');
  return getFirestore(app);
}

function getUserId(): string {
  const user = getCurrentUser();
  if (!user) throw new Error('使用者未登入');
  return user.uid;
}

// 儲存求籤記錄至雲端
export async function saveRecordToCloud(record: Omit<DivinationRecord, 'id' | 'timestamp'>): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const uid = getUserId();
    const db = getDb();
    const ref = collection(db, 'users', uid, 'records');
    const docRef = await addDoc(ref, {
      ...record,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.warn('雲端同步失敗:', e);
    return null;
  }
}

// 從雲端取得求籤記錄
export async function loadRecordsFromCloud(count = 20): Promise<DivinationRecord[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const uid = getUserId();
    const db = getDb();
    const ref = collection(db, 'users', uid, 'records');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<DivinationRecord, 'id'>),
    }));
  } catch (e) {
    console.warn('載入雲端記錄失敗:', e);
    return [];
  }
}

// 儲存使用者個人資料
export async function saveUserProfile(profile: Partial<Omit<UserProfile, 'uid' | 'updatedAt'>>): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  try {
    const uid = getUserId();
    const db = getDb();
    const ref = doc(db, 'users', uid);
    await setDoc(ref, {
      uid,
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (e) {
    console.warn('儲存個人資料失敗:', e);
    return false;
  }
}

// 載入使用者個人資料
export async function loadUserProfile(): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const uid = getUserId();
    const db = getDb();
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (e) {
    console.warn('載入個人資料失敗:', e);
    return null;
  }
}
