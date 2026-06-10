// Firebase 設定檔
// 請在 Firebase Console 建立專案後，將設定值填入下方
// https://console.firebase.google.com/

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

// TODO: 將你的 Firebase 設定貼入此物件
// Firebase Console → 專案設定 → 你的應用程式 → SDK 設定和設定
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
    return null; // Firebase 尚未設定
  }
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

export function isFirebaseConfigured(): boolean {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY';
}
