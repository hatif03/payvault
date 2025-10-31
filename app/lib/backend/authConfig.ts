import { AuthOptions, DefaultSession, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@/app/models/User';
import { Item } from '@/app/models/Item';
import connectDB from '@/app/lib/mongodb';
import { mockHelpers } from '@/app/lib/mock/mockDb';

interface CustomUser extends NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  wallet?: string | null;
  rootFolder?: string | null;
}

declare module 'next-auth' {
  interface Session {
    user: CustomUser & DefaultSession['user'];
  }
  interface JWT {
    id?: string;
    wallet?: string | null;
    rootFolder?: string | null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        wallet: { label: "Wallet", type: "text" },
        isRegistration: { label: "Is Registration", type: "hidden" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          await connectDB();

          // Check if this is a registration attempt
          if (credentials.isRegistration === 'true') {
            if (!credentials.name) {
              throw new Error('Name is required for registration');
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(credentials.email);
            if (existingUser) {
              throw new Error('An account with this email already exists');
            }

            // Create a managed wallet for new users if not provided
            let wallet = credentials.wallet as string | undefined;
            let circleWalletId: string | undefined;
            if (!wallet) {
              const { CircleClient } = await import('@/app/lib/circle/circleClient');
              const { secrets } = await import('@/app/lib/config');
              const circle = new CircleClient(secrets.CIRCLE_API_KEY || '');
              const created = await circle.createWallet({ email: credentials.email, name: credentials.name });
              wallet = created.address;
              circleWalletId = created.walletId;
            }

            // Create root folder for the user
            const rootFolder = await Item.createItem({
              name: credentials.email,
              type: 'folder',
              owner: 'temp', // Will be updated after user creation
            });

            // Create the user
            const newUser = await User.createUser({
              email: credentials.email,
              password: credentials.password,
              name: credentials.name,
              wallet: wallet,
              circleWalletId,
              rootFolder: rootFolder.id,
            });

            // Update the root folder with the correct owner
            await Item.update(rootFolder.id, { owner: newUser.id });

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              wallet: newUser.wallet,
              rootFolder: newUser.rootFolder,
            };
          } else {
            // Login attempt
            console.log('Attempting login for:', credentials.email);
            const user = await User.findByEmail(credentials.email);
            console.log('User found:', user ? 'Yes' : 'No');
            
            if (!user) {
              // Fallback to demo user if Firebase is not available
              if (credentials.email === 'demo@demo.com' && credentials.password === 'demo123') {
                console.log('Using demo user fallback');
                return {
                  id: 'demo-user-id',
                  email: 'demo@demo.com',
                  name: 'Demo User',
                  wallet: '0x1111111111111111111111111111111111111111',
                  rootFolder: 'demo-root-folder',
                };
              }
              throw new Error('Invalid email or password');
            }

            // Verify password
            console.log('Verifying password for user:', user.email);
            const isValidPassword = await User.comparePassword(user, credentials.password);
            console.log('Password valid:', isValidPassword);
            
            if (!isValidPassword) {
              throw new Error('Invalid email or password');
            }

            console.log('Login successful for:', user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              wallet: user.wallet,
              rootFolder: user.rootFolder,
            };
          }
        } catch (error: any) {
          console.error('Auth error:', error);
          
          // Fallback to mock system if Firebase is not available
          if (credentials.email === 'demo@demo.com' && credentials.password === 'demo123') {
            const user = mockHelpers.findUserByEmail('demo@demo.com');
            if (!user) throw new Error('Demo user not seeded');
            return {
              id: user._id,
              email: user.email,
              name: user.name,
              wallet: user.wallet,
              rootFolder: user.rootFolder,
            };
          }

          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: CustomUser }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.wallet = user.wallet;
        token.rootFolder = user.rootFolder;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.wallet = token.wallet as string | null;
        session.user.rootFolder = token.rootFolder as string | null;
      }
      return session;
    },
  },
};
