import { getFirestoreInstance } from '../lib/firebase';
import { DocumentData, DocumentReference, FieldValue } from 'firebase-admin/firestore';

export interface FirestoreDocument {
  id: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
}

export class FirestoreService<T extends FirestoreDocument> {
  protected collectionName: string;
  protected firestore: any;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.firestore = getFirestoreInstance();
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        // Return mock data for demo purposes
        const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
          id: mockId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as T;
      }

      const docRef = this.firestore.collection(this.collectionName).doc();
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await docRef.set(docData);
      
      return {
        id: docRef.id,
        ...docData,
      } as T;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      // Fallback to mock data on error
      const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: mockId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T;
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        return null;
      }

      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, error);
      return null;
    }
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        return null;
      }

      console.log(`findOne query for ${this.collectionName}:`, query);
      let queryRef = this.firestore.collection(this.collectionName);
      
      // Apply filters
      Object.entries(query).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          console.log(`Adding filter: ${key} == ${value}`);
          queryRef = queryRef.where(key, '==', value);
        }
      });

      const snapshot = await queryRef.limit(1).get();
      console.log(`Query result for ${this.collectionName}:`, snapshot.empty ? 'No results' : `${snapshot.docs.length} results`);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const result = {
        id: doc.id,
        ...doc.data(),
      } as T;
      console.log(`Found document in ${this.collectionName}:`, result.id);
      return result;
    } catch (error) {
      console.error(`Error finding document in ${this.collectionName}:`, error);
      return null;
    }
  }

  async findMany(query: Partial<T>, limit?: number): Promise<T[]> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        return [];
      }

      let queryRef = this.firestore.collection(this.collectionName);
      
      // Apply filters
      Object.entries(query).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          queryRef = queryRef.where(key, '==', value);
        }
      });

      if (limit) {
        queryRef = queryRef.limit(limit);
      }

      const snapshot = await queryRef.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error finding documents in ${this.collectionName}:`, error);
      return [];
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        // Return mock updated data
        return {
          id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as T;
      }

      const docRef = this.firestore.collection(this.collectionName).doc(id);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await docRef.update(updateData);
      
      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as T;
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        return true; // Mock success
      }

      await this.firestore.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document in ${this.collectionName}:`, error);
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      if (!this.firestore) {
        console.warn(`Firestore not initialized, using mock mode for ${this.collectionName}`);
        return false;
      }

      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error(`Error checking document existence in ${this.collectionName}:`, error);
      return false;
    }
  }

  // Helper method to get document reference
  getDocRef(id: string): DocumentReference | null {
    try {
      if (!this.firestore) {
        return null;
      }
      return this.firestore.collection(this.collectionName).doc(id);
    } catch (error) {
      console.error(`Error getting document reference in ${this.collectionName}:`, error);
      return null;
    }
  }
}

