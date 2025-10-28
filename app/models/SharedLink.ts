import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface SharedLink extends FirestoreDocument {
  item: string; // Document reference to Item
  owner: string; // Document reference to User
  linkId: string;
  type: 'public' | 'monetized';
  price?: number; // Required for monetized links
  title: string;
  description?: string;
  isActive: boolean;
  expiresAt?: Date;
  accessCount: number;
  paidUsers: string[]; // Document references to Users
  affiliateEnabled: boolean;
}

export interface CreateSharedLinkData {
  item: string;
  owner: string;
  linkId: string;
  type: 'public' | 'monetized';
  price?: number;
  title: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: Date;
  accessCount?: number;
  paidUsers?: string[];
  affiliateEnabled?: boolean;
}

export interface UpdateSharedLinkData {
  item?: string;
  owner?: string;
  linkId?: string;
  type?: 'public' | 'monetized';
  price?: number;
  title?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: Date;
  accessCount?: number;
  paidUsers?: string[];
  affiliateEnabled?: boolean;
}

class SharedLinkService extends FirestoreService<SharedLink> {
  constructor() {
    super('sharedlinks');
  }

  async createSharedLink(data: CreateSharedLinkData): Promise<SharedLink> {
    // Validate price requirement for monetized links
    if (data.type === 'monetized' && (!data.price || data.price <= 0)) {
      throw new Error('Price is required for monetized shared links');
    }

    const sharedLinkData = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      accessCount: data.accessCount || 0,
      paidUsers: data.paidUsers || [],
      affiliateEnabled: data.affiliateEnabled || false,
    };

    return this.create(sharedLinkData);
  }

  async findByLinkId(linkId: string): Promise<SharedLink | null> {
    return this.findOne({ linkId } as Partial<SharedLink>);
  }

  async findByOwner(ownerId: string): Promise<SharedLink[]> {
    return this.findMany({ owner: ownerId } as Partial<SharedLink>);
  }

  async findByItem(itemId: string): Promise<SharedLink[]> {
    return this.findMany({ item: itemId } as Partial<SharedLink>);
  }

  async findByType(type: 'public' | 'monetized'): Promise<SharedLink[]> {
    return this.findMany({ type } as Partial<SharedLink>);
  }

  async findActiveLinks(): Promise<SharedLink[]> {
    return this.findMany({ isActive: true } as Partial<SharedLink>);
  }

  async findByOwnerAndType(ownerId: string, type: 'public' | 'monetized'): Promise<SharedLink[]> {
    return this.findMany({ owner: ownerId, type } as Partial<SharedLink>);
  }

  async incrementAccessCount(linkId: string): Promise<SharedLink | null> {
    const sharedLink = await this.findByLinkId(linkId);
    if (!sharedLink) return null;

    return this.update(sharedLink.id, { 
      accessCount: sharedLink.accessCount + 1 
    } as UpdateSharedLinkData);
  }

  async addPaidUser(linkId: string, userId: string): Promise<SharedLink | null> {
    const sharedLink = await this.findByLinkId(linkId);
    if (!sharedLink) return null;

    const paidUsers = [...sharedLink.paidUsers];
    if (!paidUsers.includes(userId)) {
      paidUsers.push(userId);
    }

    return this.update(sharedLink.id, { paidUsers } as UpdateSharedLinkData);
  }

  async isUserPaid(linkId: string, userId: string): Promise<boolean> {
    const sharedLink = await this.findByLinkId(linkId);
    if (!sharedLink) return false;

    return sharedLink.paidUsers.includes(userId);
  }

  async updateStatus(linkId: string, isActive: boolean): Promise<SharedLink | null> {
    const sharedLink = await this.findByLinkId(linkId);
    if (!sharedLink) return null;

    return this.update(sharedLink.id, { isActive } as UpdateSharedLinkData);
  }

  async updateAffiliateSettings(linkId: string, affiliateEnabled: boolean): Promise<SharedLink | null> {
    const sharedLink = await this.findByLinkId(linkId);
    if (!sharedLink) return null;

    return this.update(sharedLink.id, { affiliateEnabled } as UpdateSharedLinkData);
  }

  async getExpiredLinks(): Promise<SharedLink[]> {
    const now = new Date();
    const allLinks = await this.findMany({} as Partial<SharedLink>);
    
    return allLinks.filter(link => 
      link.expiresAt && link.expiresAt < now
    );
  }

  async getPublicLinks(): Promise<SharedLink[]> {
    return this.findMany({ type: 'public', isActive: true } as Partial<SharedLink>);
  }

  async getMonetizedLinks(): Promise<SharedLink[]> {
    return this.findMany({ type: 'monetized', isActive: true } as Partial<SharedLink>);
  }
}

// Export singleton instance
export const SharedLink = new SharedLinkService(); 