import { v4 as uuidv4 } from 'uuid';

// Simple in-memory demo data
export type DemoUser = {
  _id: string;
  name: string;
  email: string;
  wallet: `0x${string}`;
  rootFolder: string;
};

export type DemoItem = {
  _id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  size?: number;
  mimeType?: string;
  url?: string;
  owner: string;
  contentSource?: string;
};

export type DemoListing = {
  _id: string;
  status: 'active' | 'inactive';
  price: number;
  title: string;
  description: string;
  tags: string[];
  views: number;
  seller: string; // userId
  item: string; // itemId
  sellerWallet: `0x${string}`;
};

export type DemoTransaction = {
  _id: string;
  listing?: string;
  sharedLink?: string;
  buyer: string;
  seller: string;
  item: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  receiptNumber: string;
  purchaseDate: Date;
  transactionType: 'purchase' | 'sale' | 'commission';
  paymentFlow: 'direct' | 'admin';
  metadata?: Record<string, any> | null;
};

export type DemoAffiliate = {
  _id: string;
  listing: string;
  affiliateUser: string; // userId
  affiliateCode: string;
  commissionRate: number;
  status: 'active' | 'inactive';
  totalEarnings: number;
  totalSales: number;
};

export const db = {
  users: [] as DemoUser[],
  items: [] as DemoItem[],
  listings: [] as DemoListing[],
  transactions: [] as DemoTransaction[],
  affiliates: [] as DemoAffiliate[],
  balances: new Map<string, number>() // wallet -> usdc balance (6 decimals simplified)
};

function seedOnce() {
  if (db.users.length > 0) return;

  const demoUserId = uuidv4();
  const demoWallet = '0x1111111111111111111111111111111111111111' as `0x${string}`;
  const rootFolderId = uuidv4();
  const buyerId = demoUserId;
  const sellerId = uuidv4();
  const sellerWallet = '0x2222222222222222222222222222222222222222' as `0x${string}`;

  db.users.push(
    { _id: demoUserId, name: 'Demo User', email: 'demo@demo.com', wallet: demoWallet, rootFolder: rootFolderId },
    { _id: sellerId, name: 'Seller One', email: 'seller@demo.com', wallet: sellerWallet, rootFolder: uuidv4() }
  );

  const itemId = uuidv4();
  db.items.push(
    { _id: rootFolderId, name: 'demo@demo.com', type: 'folder', parentId: null, owner: demoUserId },
    { _id: itemId, name: 'Sample PDF.pdf', type: 'file', parentId: null, size: 1024 * 128, mimeType: 'application/pdf', url: '/file.svg', owner: sellerId }
  );

  const listingId = uuidv4();
  db.listings.push({
    _id: listingId,
    status: 'active',
    price: 9.99,
    title: 'Sample Document',
    description: 'A sample document for demo purchase flow.',
    tags: ['docs', 'sample'],
    views: 42,
    seller: sellerId,
    item: itemId,
    sellerWallet
  });

  db.affiliates.push({
    _id: uuidv4(),
    listing: listingId,
    affiliateUser: demoUserId,
    affiliateCode: 'DEMOAFF',
    commissionRate: 10,
    status: 'active',
    totalEarnings: 0,
    totalSales: 0
  });

  db.balances.set(demoWallet, 12.34);
  db.balances.set(sellerWallet, 100);
}

seedOnce();

export const mockHelpers = {
  findUserByEmail(email: string) { return db.users.find(u => u.email === email) || null; },
  getListing(id: string) { return db.listings.find(l => l._id === id) || null; },
  listListings() { return db.listings; },
  incrementListingViews(id: string) { const l = this.getListing(id); if (l) l.views += 1; },
  createTransaction(t: Omit<DemoTransaction, '_id'>) { const _id = uuidv4(); const rec = { _id, ...t }; db.transactions.push(rec); return rec; },
  getBalance(wallet: `0x${string}`) { return db.balances.get(wallet) ?? 0; },
  fund(wallet: `0x${string}`, delta: number) { const current = db.balances.get(wallet) ?? 0; db.balances.set(wallet, current + delta); return db.balances.get(wallet)!; }
};


