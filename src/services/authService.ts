// 帳號與認證服務（Firebase Auth）
// 提供 Google 登入、匿名登入、登出功能

import {
  getAuth,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirebaseApp, isFirebaseConfigured } from './firebaseConfig';

export interface AuthState {
  user: User | null;
  isAnonymous: boolean;
  isSignedIn: boolean;
  uid: string | null;
  displayName: string | null;
  email: string | null;
}

function getAuthInstance() {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase 尚未設定，請先填入 firebaseConfig.ts');
  return getAuth(app);
}

// 匿名登入（不需帳號即可使用雲端同步）
export async function signInAnon(): Promise<User> {
  const auth = getAuthInstance();
  const result = await signInAnonymously(auth);
  return result.user;
}

// 登出
export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const auth = getAuthInstance();
  await signOut(auth);
}

// 監聽認證狀態變更
export function onAuthChange(callback: (state: AuthState) => void): () => void {
  if (!isFirebaseConfigured()) {
    callback({ user: null, isAnonymous: false, isSignedIn: false, uid: null, displayName: null, email: null });
    return () => {};
  }
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, (user) => {
    callback({
      user,
      isAnonymous: user?.isAnonymous ?? false,
      isSignedIn: !!user,
      uid: user?.uid ?? null,
      displayName: user?.displayName ?? null,
      email: user?.email ?? null,
    });
  });
}

// 取得目前使用者
export function getCurrentUser(): User | null {
  if (!isFirebaseConfigured()) return null;
  try {
    return getAuthInstance().currentUser;
  } catch {
    return null;
  }
}
