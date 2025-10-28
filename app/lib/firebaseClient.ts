import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { secrets, validateFirebaseClientConfig } from './config';

// Firebase client configuration
const firebaseConfig = {
  apiKey: secrets.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: secrets.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase client
let firebaseApp: any = null;
let auth: any = null;
let firestore: any = null;
let storage: any = null;

export function initializeFirebaseClient() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!validateFirebaseClientConfig()) {
    console.warn('Firebase client configuration is incomplete. Using mock mode.');
    return null;
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }

    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);

    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Client:', error);
    return null;
  }
}

export function getAuthInstance() {
  if (!auth) {
    initializeFirebaseClient();
  }
  return auth;
}

export function getFirestoreClientInstance() {
  if (!firestore) {
    initializeFirebaseClient();
  }
  return firestore;
}

export function getStorageClientInstance() {
  if (!storage) {
    initializeFirebaseClient();
  }
  return storage;
}

// Initialize on import
initializeFirebaseClient();

