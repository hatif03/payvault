import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface Listing extends FirestoreDocument {
  item: string; // Document reference to Item
  seller: string; // Document reference to User
  title: string;
  description: string;
  price: number;
  status: 'active' | 'inactive' | 'suspended';
  tags: string[];
  views: number;
  affiliateEnabled: boolean;
}

export interface CreateListingData {
  item: string;
  seller: string;
  title: string;
  description: string;
  price: number;
  status?: 'active' | 'inactive' | 'suspended';
  tags?: string[];
  views?: number;
  affiliateEnabled?: boolean;
}

export interface UpdateListingData {
  item?: string;
  seller?: string;
  title?: string;
  description?: string;
  price?: number;
  status?: 'active' | 'inactive' | 'suspended';
  tags?: string[];
  views?: number;
  affiliateEnabled?: boolean;
}

class ListingService extends FirestoreService<Listing> {
  constructor() {
    super('listings');
  }

  async createListing(data: CreateListingData): Promise<Listing> {
    const listingData = {
      ...data,
      status: data.status || 'active',
      tags: data.tags || [],
      views: data.views || 0,
      affiliateEnabled: data.affiliateEnabled || false,
    };

    return this.create(listingData);
  }

  async findBySeller(sellerId: string): Promise<Listing[]> {
    return this.findMany({ seller: sellerId } as Partial<Listing>);
  }

  async findByItem(itemId: string): Promise<Listing | null> {
    return this.findOne({ item: itemId } as Partial<Listing>);
  }

  async findByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Listing[]> {
    return this.findMany({ status } as Partial<Listing>);
  }

  async findActiveListings(): Promise<Listing[]> {
    return this.findByStatus('active');
  }

  async findBySellerAndStatus(sellerId: string, status: 'active' | 'inactive' | 'suspended'): Promise<Listing[]> {
    return this.findMany({ seller: sellerId, status } as Partial<Listing>);
  }

  async findByAffiliateEnabled(affiliateEnabled: boolean): Promise<Listing[]> {
    return this.findMany({ affiliateEnabled } as Partial<Listing>);
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Listing[]> {
    // Note: Firestore doesn't support range queries on multiple fields easily
    // This would need to be implemented differently in production
    const allListings = await this.findActiveListings();
    return allListings.filter(listing => 
      listing.price >= minPrice && listing.price <= maxPrice
    );
  }

  async findByTags(tags: string[]): Promise<Listing[]> {
    // Note: Firestore doesn't support array-contains-any easily
    // This would need to be implemented differently in production
    const allListings = await this.findActiveListings();
    return allListings.filter(listing => 
      tags.some(tag => listing.tags.includes(tag))
    );
  }

  async incrementViews(listingId: string): Promise<Listing | null> {
    const listing = await this.findById(listingId);
    if (!listing) return null;

    return this.update(listingId, { views: listing.views + 1 } as UpdateListingData);
  }

  async updateStatus(listingId: string, status: 'active' | 'inactive' | 'suspended'): Promise<Listing | null> {
    return this.update(listingId, { status } as UpdateListingData);
  }

  async updateAffiliateSettings(listingId: string, affiliateEnabled: boolean): Promise<Listing | null> {
    return this.update(listingId, { affiliateEnabled } as UpdateListingData);
  }
}

// Export singleton instance
export const Listing = new ListingService(); 