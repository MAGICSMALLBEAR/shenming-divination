import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

import type { BackupPayload } from './backup';
import { getCurrentUser } from './authService';
import { getFirebaseApp, isFirebaseConfigured } from './firebaseConfig';

export interface CloudBackupMeta {
  configured: boolean;
  signedIn: boolean;
  uid: string | null;
  updatedAt?: string;
  exportedAt?: string;
}

export interface CloudBackupDocument {
  version: number;
  exportedAt: string;
  payload: BackupPayload;
  updatedAt?: unknown;
}

function getCloudBackupRef() {
  const app = getFirebaseApp();
  const user = getCurrentUser();
  if (!app || !user) return null;
  return doc(getFirestore(app), 'users', user.uid, 'backups', 'latest');
}

export async function getCloudBackupMeta(): Promise<CloudBackupMeta> {
  if (!isFirebaseConfigured()) {
    return { configured: false, signedIn: false, uid: null };
  }

  const user = getCurrentUser();
  if (!user) {
    return { configured: true, signedIn: false, uid: null };
  }

  const ref = getCloudBackupRef();
  if (!ref) return { configured: true, signedIn: true, uid: user.uid };

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { configured: true, signedIn: true, uid: user.uid };
    }
    const data = snap.data() as Partial<CloudBackupDocument>;
    return {
      configured: true,
      signedIn: true,
      uid: user.uid,
      exportedAt: data.exportedAt,
      updatedAt: data.exportedAt,
    };
  } catch {
    return { configured: true, signedIn: true, uid: user.uid };
  }
}

export async function uploadLocalBackupToCloud(): Promise<CloudBackupMeta> {
  const ref = getCloudBackupRef();
  const user = getCurrentUser();
  if (!isFirebaseConfigured()) throw new Error('Firebase 尚未設定');
  if (!ref || !user) throw new Error('請先登入或啟用匿名同步');

  const { createBackupPayload } = await import('./backup');
  const payload = await createBackupPayload();
  await setDoc(ref, {
    version: payload.version,
    exportedAt: payload.exportedAt,
    payload,
    updatedAt: serverTimestamp(),
  });

  return {
    configured: true,
    signedIn: true,
    uid: user.uid,
    exportedAt: payload.exportedAt,
    updatedAt: payload.exportedAt,
  };
}

export async function restoreCloudBackupToLocal(): Promise<BackupPayload> {
  const ref = getCloudBackupRef();
  if (!isFirebaseConfigured()) throw new Error('Firebase 尚未設定');
  if (!ref) throw new Error('請先登入或啟用匿名同步');

  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('雲端目前沒有備份');

  const data = snap.data() as Partial<CloudBackupDocument>;
  if (!data.payload) throw new Error('雲端備份格式不正確');

  const { importBackupJson } = await import('./backup');
  await importBackupJson(JSON.stringify(data.payload));
  return data.payload;
}