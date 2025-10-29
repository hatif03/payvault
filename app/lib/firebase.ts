import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { secrets, validateFirebaseConfig } from './config';

// Initialize Firebase Admin SDK
let firebaseApp: any = null;
let firestore: any = null;
let storage: any = null;

export function initializeFirebaseAdmin() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!validateFirebaseConfig()) {
    console.warn('Firebase configuration is incomplete. Using mock mode.');
    return null;
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: secrets.FIREBASE_PROJECT_ID,
          privateKey: secrets.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: secrets.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: secrets.FIREBASE_STORAGE_BUCKET,
      });
    }

    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);

    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}

export function getFirestoreInstance() {
  if (!firestore) {
    initializeFirebaseAdmin();
  }
  return firestore;
}

export function getStorageInstance() {
  if (!storage) {
    initializeFirebaseAdmin();
  }
  return storage;
}

// Initialize on import
initializeFirebaseAdmin();


