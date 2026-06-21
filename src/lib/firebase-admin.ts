import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import * as serviceAccount from '../../service-account.json';

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const messaging = getMessaging();
