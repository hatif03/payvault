import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export const DEFAULT_COMMISSION_RATE = 10;

export interface Affiliate extends FirestoreDocument {
  listing?: string; // Document reference to Listing
  sharedLink?: string; // Document reference to SharedLink
  owner: string; // Document reference to User
  affiliateUser: string; // Document reference to User
  commissionRate: number;
  affiliateCode: string;
  status: 'active' | 'inactive' | 'suspended';
  totalEarnings: number;
  totalSales: number;
}

export interface CreateAffiliateData {
  listing?: string;
  sharedLink?: string;
  owner: string;
  affiliateUser: string;
  commissionRate?: number;
  affiliateCode: string;
  status?: 'active' | 'inactive' | 'suspended';
  totalEarnings?: number;
  totalSales?: number;
}

export interface UpdateAffiliateData {
  listing?: string;
  sharedLink?: string;
  owner?: string;
  affiliateUser?: string;
  commissionRate?: number;
  affiliateCode?: string;
  status?: 'active' | 'inactive' | 'suspended';
  totalEarnings?: number;
  totalSales?: number;
}

class AffiliateService extends FirestoreService<Affiliate> {
  constructor() {
    super('affiliates');
  }

  async createAffiliate(data: CreateAffiliateData): Promise<Affiliate> {
    // Validate that either listing or sharedLink is provided, but not both
    const hasListing = !!data.listing;
    const hasSharedLink = !!data.sharedLink;

    if (!hasListing && !hasSharedLink) {
      throw new Error('Either listing or sharedLink must be provided');
    }

    if (hasListing && hasSharedLink) {
      throw new Error('Cannot have both listing and sharedLink');
    }

    const affiliateData = {
      ...data,
      commissionRate: data.commissionRate || DEFAULT_COMMISSION_RATE,
      status: data.status || 'active',
      totalEarnings: data.totalEarnings || 0,
      totalSales: data.totalSales || 0,
    };

    return this.create(affiliateData);
  }

  async findByAffiliateCode(affiliateCode: string): Promise<Affiliate | null> {
    return this.findOne({ affiliateCode: affiliateCode.toUpperCase() } as Partial<Affiliate>);
  }

  async findByOwner(ownerId: string): Promise<Affiliate[]> {
    return this.findMany({ owner: ownerId } as Partial<Affiliate>);
  }

  async findByAffiliateUser(affiliateUserId: string): Promise<Affiliate[]> {
    return this.findMany({ affiliateUser: affiliateUserId } as Partial<Affiliate>);
  }

  async findByListing(listingId: string): Promise<Affiliate[]> {
    return this.findMany({ listing: listingId } as Partial<Affiliate>);
  }

  async findBySharedLink(sharedLinkId: string): Promise<Affiliate[]> {
    return this.findMany({ sharedLink: sharedLinkId } as Partial<Affiliate>);
  }

  async findByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Affiliate[]> {
    return this.findMany({ status } as Partial<Affiliate>);
  }

  async findActiveAffiliates(): Promise<Affiliate[]> {
    return this.findByStatus('active');
  }

  async updateEarnings(affiliateId: string, earnings: number, sales: number): Promise<Affiliate | null> {
    const affiliate = await this.findById(affiliateId);
    if (!affiliate) return null;

    return this.update(affiliateId, {
      totalEarnings: affiliate.totalEarnings + earnings,
      totalSales: affiliate.totalSales + sales,
    } as UpdateAffiliateData);
  }

  async updateStatus(affiliateId: string, status: 'active' | 'inactive' | 'suspended'): Promise<Affiliate | null> {
    return this.update(affiliateId, { status } as UpdateAffiliateData);
  }

  async updateCommissionRate(affiliateId: string, commissionRate: number): Promise<Affiliate | null> {
    if (commissionRate < 0 || commissionRate > 100) {
      throw new Error('Commission rate must be between 0 and 100');
    }

    return this.update(affiliateId, { commissionRate } as UpdateAffiliateData);
  }
}

// Export singleton instance
export const Affiliate = new AffiliateService();
