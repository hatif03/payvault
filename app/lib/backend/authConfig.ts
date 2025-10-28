import { AuthOptions, DefaultSession, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
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
        isRegistration: { label: "Is Registration", type: "hidden" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        // Fixed credential login
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

        throw new Error('Invalid credentials');
      }
    })
  ],
  secret: 'demo-secret',
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
