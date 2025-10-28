import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface AIChunk extends FirestoreDocument {
  item: string; // Document reference to Item
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface CreateAIChunkData {
  item: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface UpdateAIChunkData {
  item?: string;
  text?: string;
  embedding?: number[];
  chunkIndex?: number;
}

class AIChunkService extends FirestoreService<AIChunk> {
  constructor() {
    super('ai_chunks');
  }

  async createAIChunk(data: CreateAIChunkData): Promise<AIChunk> {
    return this.create(data);
  }

  async findByItem(itemId: string): Promise<AIChunk[]> {
    return this.findMany({ item: itemId } as Partial<AIChunk>);
  }

  async findByItemAndIndex(itemId: string, chunkIndex: number): Promise<AIChunk | null> {
    return this.findOne({ item: itemId, chunkIndex } as Partial<AIChunk>);
  }

  async findByChunkIndex(chunkIndex: number): Promise<AIChunk[]> {
    return this.findMany({ chunkIndex } as Partial<AIChunk>);
  }

  async getChunksByItemOrdered(itemId: string): Promise<AIChunk[]> {
    const chunks = await this.findByItem(itemId);
    return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  async deleteChunksByItem(itemId: string): Promise<boolean> {
    try {
      const chunks = await this.findByItem(itemId);
      const deletePromises = chunks.map(chunk => this.delete(chunk.id));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting chunks by item:', error);
      return false;
    }
  }

  async updateChunkText(chunkId: string, text: string): Promise<AIChunk | null> {
    return this.update(chunkId, { text } as UpdateAIChunkData);
  }

  async updateChunkEmbedding(chunkId: string, embedding: number[]): Promise<AIChunk | null> {
    return this.update(chunkId, { embedding } as UpdateAIChunkData);
  }

  async getChunkCountByItem(itemId: string): Promise<number> {
    const chunks = await this.findByItem(itemId);
    return chunks.length;
  }

  async getMaxChunkIndexByItem(itemId: string): Promise<number> {
    const chunks = await this.findByItem(itemId);
    if (chunks.length === 0) return -1;
    
    return Math.max(...chunks.map(chunk => chunk.chunkIndex));
  }

  async createMultipleChunks(chunksData: CreateAIChunkData[]): Promise<AIChunk[]> {
    const createdChunks: AIChunk[] = [];
    
    for (const chunkData of chunksData) {
      try {
        const chunk = await this.createAIChunk(chunkData);
        createdChunks.push(chunk);
      } catch (error) {
        console.error('Error creating chunk:', error);
        // Continue with other chunks even if one fails
      }
    }
    
    return createdChunks;
  }
}

// Export singleton instance
export const AIChunk = new AIChunkService(); 