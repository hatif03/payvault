import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface AIProcessing {
  status: 'none' | 'pending' | 'processing' | 'completed' | 'failed';
  textContent?: string;
  processedAt?: Date;
  topics?: string[];
  chunksCount: number;
}

export interface AIGeneration {
  sourcePrompt?: string;
  sourceFiles?: string[]; // Document references to Items
  generatedAt?: Date;
}

export interface Item extends FirestoreDocument {
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  owner: string; // Document reference to User
  size?: number; // Required for files
  mimeType?: string;
  url?: string;
  aiProcessing: AIProcessing;
  contentSource: 'user_upload' | 'ai_generated' | 'marketplace_purchase' | 'shared_link';
  aiGeneration?: AIGeneration;
}

export interface CreateItemData {
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  owner: string;
  size?: number;
  mimeType?: string;
  url?: string;
  aiProcessing?: Partial<AIProcessing>;
  contentSource?: 'user_upload' | 'ai_generated' | 'marketplace_purchase' | 'shared_link';
  aiGeneration?: AIGeneration;
}

export interface UpdateItemData {
  name?: string;
  type?: 'file' | 'folder';
  parentId?: string;
  owner?: string;
  size?: number;
  mimeType?: string;
  url?: string;
  aiProcessing?: Partial<AIProcessing>;
  contentSource?: 'user_upload' | 'ai_generated' | 'marketplace_purchase' | 'shared_link';
  aiGeneration?: AIGeneration;
}

class ItemService extends FirestoreService<Item> {
  constructor() {
    super('items');
  }

  async createItem(data: CreateItemData): Promise<Item> {
    const itemData = {
      ...data,
      aiProcessing: {
        status: 'none',
        chunksCount: 0,
        ...data.aiProcessing,
      },
      contentSource: data.contentSource || 'user_upload',
    };

    return this.create(itemData);
  }

  async findByOwner(ownerId: string): Promise<Item[]> {
    return this.findMany({ owner: ownerId } as Partial<Item>);
  }

  async findByParent(parentId: string): Promise<Item[]> {
    return this.findMany({ parentId } as Partial<Item>);
  }

  async findByOwnerAndParent(ownerId: string, parentId?: string): Promise<Item[]> {
    const query: Partial<Item> = { owner: ownerId };
    if (parentId) {
      query.parentId = parentId;
    }
    return this.findMany(query);
  }

  async findByNameAndParent(name: string, parentId: string, ownerId: string): Promise<Item | null> {
    const items = await this.findMany({
      name,
      parentId,
      owner: ownerId,
    } as Partial<Item>);
    
    return items.length > 0 ? items[0] : null;
  }

  async findByType(type: 'file' | 'folder', ownerId?: string): Promise<Item[]> {
    const query: Partial<Item> = { type };
    if (ownerId) {
      query.owner = ownerId;
    }
    return this.findMany(query);
  }

  async findByContentSource(contentSource: string, ownerId?: string): Promise<Item[]> {
    const query: Partial<Item> = { contentSource: contentSource as any };
    if (ownerId) {
      query.owner = ownerId;
    }
    return this.findMany(query);
  }

  async updateAIProcessing(itemId: string, aiProcessing: Partial<AIProcessing>): Promise<Item | null> {
    return this.update(itemId, { aiProcessing } as UpdateItemData);
  }

  async updateAIGeneration(itemId: string, aiGeneration: AIGeneration): Promise<Item | null> {
    return this.update(itemId, { aiGeneration } as UpdateItemData);
  }

  async deleteItem(itemId: string): Promise<boolean> {
    // In a real implementation, you might want to delete child items recursively
    return this.delete(itemId);
  }
}

// Export singleton instance
export const Item = new ItemService();