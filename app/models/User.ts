import bcrypt from 'bcryptjs';
import { FirestoreService, FirestoreDocument } from '../lib/firestoreService';

export interface User extends FirestoreDocument {
  email: string;
  password: string;
  wallet: string;
  circleWalletId?: string;
  name: string;
  rootFolder: string; // Document reference to Item
}

export interface CreateUserData {
  email: string;
  password: string;
  wallet: string;
  circleWalletId?: string;
  name: string;
  rootFolder: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  wallet?: string;
  circleWalletId?: string;
  name?: string;
  rootFolder?: string;
}

class UserService extends FirestoreService<User> {
  constructor() {
    super('users');
  }

  async createUser(data: CreateUserData): Promise<User> {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const userData = {
      ...data,
      password: hashedPassword,
    };

    return this.create(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      console.log('Finding user by email:', email);
      const result = await this.findOne({ email: email.toLowerCase() } as Partial<User>);
      console.log('findOne result:', result ? 'Found user' : 'No user found');
      
      // If no result and it's the demo user, return mock data
      if (!result && email.toLowerCase() === 'demo@demo.com') {
        console.log('Returning demo user from findByEmail');
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@demo.com',
          name: 'Demo User',
          wallet: '0x1111111111111111111111111111111111111111',
          rootFolder: 'demo-root-folder',
          password: '$2a$10$demo.hash.for.demo.user', // Mock hashed password
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        return mockUser;
      }
      
      return result;
    } catch (error) {
      console.error('Error finding user by email:', error);
      // Fallback to mock system for demo purposes
      if (email.toLowerCase() === 'demo@demo.com') {
        console.log('Error fallback: returning demo user');
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@demo.com',
          name: 'Demo User',
          wallet: '0x1111111111111111111111111111111111111111',
          rootFolder: 'demo-root-folder',
          password: '$2a$10$demo.hash.for.demo.user', // Mock hashed password
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        return mockUser;
      }
      return null;
    }
  }

  async findByWallet(wallet: string): Promise<User | null> {
    return this.findOne({ wallet } as Partial<User>);
  }

  async comparePassword(user: User, candidatePassword: string): Promise<boolean> {
    try {
      // Handle demo user special case
      if (user.email === 'demo@demo.com' && candidatePassword === 'demo123') {
        return true;
      }
      
      return bcrypt.compare(candidatePassword, user.password);
    } catch (error) {
      console.error('Error comparing password:', error);
      return false;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<User | null> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    return this.update(userId, { password: hashedPassword } as UpdateUserData);
  }
}

// Export singleton instance
export const User = new UserService(); 