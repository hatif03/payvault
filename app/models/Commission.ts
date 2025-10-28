import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface Commission extends FirestoreDocument {
  affiliate: string; // Document reference to Affiliate
  originalTransaction: string; // Document reference to Transaction
  commissionTransaction?: string; // Document reference to Transaction
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'paid' | 'failed';
  paidAt?: Date;
}

export interface CreateCommissionData {
  affiliate: string;
  originalTransaction: string;
  commissionTransaction?: string;
  commissionAmount: number;
  commissionRate: number;
  status?: 'pending' | 'paid' | 'failed';
  paidAt?: Date;
}

export interface UpdateCommissionData {
  affiliate?: string;
  originalTransaction?: string;
  commissionTransaction?: string;
  commissionAmount?: number;
  commissionRate?: number;
  status?: 'pending' | 'paid' | 'failed';
  paidAt?: Date;
}

class CommissionService extends FirestoreService<Commission> {
  constructor() {
    super('commissions');
  }

  async createCommission(data: CreateCommissionData): Promise<Commission> {
    const commissionData = {
      ...data,
      status: data.status || 'pending',
    };

    return this.create(commissionData);
  }

  async findByAffiliate(affiliateId: string): Promise<Commission[]> {
    return this.findMany({ affiliate: affiliateId } as Partial<Commission>);
  }

  async findByOriginalTransaction(transactionId: string): Promise<Commission[]> {
    return this.findMany({ originalTransaction: transactionId } as Partial<Commission>);
  }

  async findByCommissionTransaction(transactionId: string): Promise<Commission | null> {
    return this.findOne({ commissionTransaction: transactionId } as Partial<Commission>);
  }

  async findByStatus(status: 'pending' | 'paid' | 'failed'): Promise<Commission[]> {
    return this.findMany({ status } as Partial<Commission>);
  }

  async findPendingCommissions(): Promise<Commission[]> {
    return this.findByStatus('pending');
  }

  async findPaidCommissions(): Promise<Commission[]> {
    return this.findByStatus('paid');
  }

  async findFailedCommissions(): Promise<Commission[]> {
    return this.findByStatus('failed');
  }

  async updateStatus(commissionId: string, status: 'pending' | 'paid' | 'failed'): Promise<Commission | null> {
    const updateData: UpdateCommissionData = { status };
    
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    return this.update(commissionId, updateData);
  }

  async markAsPaid(commissionId: string, commissionTransactionId: string): Promise<Commission | null> {
    return this.update(commissionId, {
      status: 'paid',
      commissionTransaction: commissionTransactionId,
      paidAt: new Date(),
    } as UpdateCommissionData);
  }

  async markAsFailed(commissionId: string): Promise<Commission | null> {
    return this.update(commissionId, { status: 'failed' } as UpdateCommissionData);
  }

  async getTotalCommissionsByAffiliate(affiliateId: string): Promise<number> {
    const commissions = await this.findByAffiliate(affiliateId);
    return commissions.reduce((total, commission) => total + commission.commissionAmount, 0);
  }

  async getTotalPaidCommissionsByAffiliate(affiliateId: string): Promise<number> {
    const paidCommissions = await this.findByAffiliate(affiliateId);
    return paidCommissions
      .filter(commission => commission.status === 'paid')
      .reduce((total, commission) => total + commission.commissionAmount, 0);
  }
}

// Export singleton instance
export const Commission = new CommissionService();