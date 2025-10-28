import { getFirestoreInstance } from './firebase';

// Firebase Firestore connection
async function connectDB() {
  try {
    const firestore = getFirestoreInstance();
    if (!firestore) {
      console.warn('Firebase not initialized, using mock mode');
      return {} as any;
    }
    
    // Test connection by getting a simple document
    await firestore.collection('_health').doc('test').get();
    console.log('Connected to Firestore');
    return firestore;
  } catch (error) {
    console.error('Failed to connect to Firestore:', error);
    console.warn('Using mock mode');
    return {} as any;
  }
}

export default connectDB;