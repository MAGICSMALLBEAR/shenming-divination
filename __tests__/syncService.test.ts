jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  getFirestore: jest.fn(),
  serverTimestamp: jest.fn(() => 'server-time'),
  setDoc: jest.fn(),
}));

jest.mock('@/services/authService', () => ({
  getCurrentUser: jest.fn(() => null),
}));

jest.mock('@/services/firebaseConfig', () => ({
  getFirebaseApp: jest.fn(() => null),
  isFirebaseConfigured: jest.fn(() => false),
}));

import { getCloudBackupMeta } from '@/services/syncService';

describe('syncService', () => {
  it('reports disabled cloud sync when Firebase is not configured', async () => {
    await expect(getCloudBackupMeta()).resolves.toMatchObject({
      configured: false,
      signedIn: false,
      uid: null,
    });
  });
});
