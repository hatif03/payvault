import { getFirestoreInstance } from './firebase';

export interface FirestoreTransactionHandler<T> {
  (transaction: any): Promise<T>;
}

export async function withFirestoreTransaction<T>(
  handler: FirestoreTransactionHandler<T>
): Promise<T> {
  const firestore = getFirestoreInstance();
  
  if (!firestore) {
    console.warn('Firestore not initialized, executing without transaction');
    // Create a mock transaction object for compatibility
    const mockTransaction = {
      get: async () => ({ exists: false }),
      set: async () => {},
      update: async () => {},
      delete: async () => {},
      create: async () => ({ id: 'mock-id' }),
    };
    return handler(mockTransaction);
  }

  try {
    return await firestore.runTransaction(async (transaction: any) => {
      return await handler(transaction);
    });
  } catch (error) {
    console.error('Firestore transaction failed:', error);
    throw error;
  }
}

// Helper function to execute multiple operations in a transaction
export async function executeTransactionOperations<T>(
  operations: Array<(transaction: any) => Promise<any>>
): Promise<T[]> {
  return withFirestoreTransaction(async (transaction) => {
    const results: T[] = [];
    
    for (const operation of operations) {
      try {
        const result = await operation(transaction);
        results.push(result);
      } catch (error) {
        console.error('Transaction operation failed:', error);
        throw error; // This will abort the entire transaction
      }
    }
    
    return results;
  });
}

// Helper function for batch operations
export async function executeBatchOperations<T>(
  operations: Array<(batch: any) => void>
): Promise<void> {
  const firestore = getFirestoreInstance();
  
  if (!firestore) {
    console.warn('Firestore not initialized, skipping batch operations');
    return;
  }

  const batch = firestore.batch();
  
  try {
    operations.forEach(operation => operation(batch));
    await batch.commit();
  } catch (error) {
    console.error('Batch operation failed:', error);
    throw error;
  }
}


