import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface CommissionDistribution {
  affiliateId: string; // Document reference to Affiliate
  amount: number;
  commissionRate: number;
}

export interface AffiliateInfo {
  isAffiliateSale: boolean;
  originalAmount: number;
  netAmount: number;
  commissionDistribution: CommissionDistribution[];
}

export interface TransactionMetadata {
  blockchainTransaction?: string;
  network?: string;
  payer?: string;
  success?: boolean;
  paymentResponseRaw?: string;
  [key: string]: any;
}

export interface Transaction extends FirestoreDocument {
  listing?: string; // Document reference to Listing
  sharedLink?: string; // Document reference to SharedLink
  buyer: string; // Document reference to User
  seller: string; // Document reference to User
  item: string; // Document reference to Item
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  receiptNumber: string;
  purchaseDate: Date;
  transactionType: 'purchase' | 'sale' | 'commission';
  paymentFlow: 'direct' | 'admin';
  affiliateInfo?: AffiliateInfo;
  parentTransaction?: string; // Document reference to Transaction
  metadata?: TransactionMetadata;
}

export interface CreateTransactionData {
  listing?: string;
  sharedLink?: string;
  buyer: string;
  seller: string;
  item: string;
  amount: number;
  status?: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  receiptNumber: string;
  purchaseDate?: Date;
  transactionType: 'purchase' | 'sale' | 'commission';
  paymentFlow?: 'direct' | 'admin';
  affiliateInfo?: AffiliateInfo;
  parentTransaction?: string;
  metadata?: TransactionMetadata;
}

export interface UpdateTransactionData {
  listing?: string;
  sharedLink?: string;
  buyer?: string;
  seller?: string;
  item?: string;
  amount?: number;
  status?: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId?: string;
  receiptNumber?: string;
  purchaseDate?: Date;
  transactionType?: 'purchase' | 'sale' | 'commission';
  paymentFlow?: 'direct' | 'admin';
  affiliateInfo?: AffiliateInfo;
  parentTransaction?: string;
  metadata?: TransactionMetadata;
}

class TransactionService extends FirestoreService<Transaction> {
  constructor() {
    super('transactions');
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const transactionData = {
      ...data,
      status: data.status || 'completed',
      purchaseDate: data.purchaseDate || new Date(),
      paymentFlow: data.paymentFlow || 'direct',
    };

    return this.create(transactionData);
  }

  async findByBuyer(buyerId: string): Promise<Transaction[]> {
    return this.findMany({ buyer: buyerId } as Partial<Transaction>);
  }

  async findBySeller(sellerId: string): Promise<Transaction[]> {
    return this.findMany({ seller: sellerId } as Partial<Transaction>);
  }

  async findByItem(itemId: string): Promise<Transaction[]> {
    return this.findMany({ item: itemId } as Partial<Transaction>);
  }

  async findByListing(listingId: string): Promise<Transaction[]> {
    return this.findMany({ listing: listingId } as Partial<Transaction>);
  }

  async findBySharedLink(sharedLinkId: string): Promise<Transaction[]> {
    return this.findMany({ sharedLink: sharedLinkId } as Partial<Transaction>);
  }

  async findByStatus(status: 'completed' | 'pending' | 'failed' | 'refunded'): Promise<Transaction[]> {
    return this.findMany({ status } as Partial<Transaction>);
  }

  async findByTransactionType(transactionType: 'purchase' | 'sale' | 'commission'): Promise<Transaction[]> {
    return this.findMany({ transactionType } as Partial<Transaction>);
  }

  async findByTransactionId(transactionId: string): Promise<Transaction | null> {
    return this.findOne({ transactionId } as Partial<Transaction>);
  }

  async findByReceiptNumber(receiptNumber: string): Promise<Transaction | null> {
    return this.findOne({ receiptNumber } as Partial<Transaction>);
  }

  async findByParentTransaction(parentTransactionId: string): Promise<Transaction[]> {
    return this.findMany({ parentTransaction: parentTransactionId } as Partial<Transaction>);
  }

  async findByAffiliate(affiliateId: string): Promise<Transaction[]> {
    // Note: This is a simplified implementation
    // In production, you might need to query differently for nested fields
    const allTransactions = await this.findMany({} as Partial<Transaction>);
    return allTransactions.filter(transaction => 
      transaction.affiliateInfo?.commissionDistribution?.some(
        dist => dist.affiliateId === affiliateId
      )
    );
  }

  async updateStatus(transactionId: string, status: 'completed' | 'pending' | 'failed' | 'refunded'): Promise<Transaction | null> {
    return this.update(transactionId, { status } as UpdateTransactionData);
  }

  async updateMetadata(transactionId: string, metadata: TransactionMetadata): Promise<Transaction | null> {
    return this.update(transactionId, { metadata } as UpdateTransactionData);
  }

  async getCompletedTransactions(): Promise<Transaction[]> {
    return this.findByStatus('completed');
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return this.findByStatus('pending');
  }

  async getFailedTransactions(): Promise<Transaction[]> {
    return this.findByStatus('failed');
  }

  async getRefundedTransactions(): Promise<Transaction[]> {
    return this.findByStatus('refunded');
  }
}

// Export singleton instance
export const Transaction = new TransactionService(); 