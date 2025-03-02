import NextAuth from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      financialProfile?: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedQuestionnaire: boolean;
        riskScore: number | null;
        investmentStyle: string | null;
      } | null;
      name?: string;
      email?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, _req) {
        if (!credentials) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && user.password && bcrypt.compareSync(credentials.password, user.password)) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Make sure to use the right includes
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            financialProfile: true,
          }
        });
        
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return true; // Still allow sign in even if lookup fails
      }
    },
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // If the URL is already absolute, return it
      else if (new URL(url).origin === baseUrl) return url
      // Otherwise, return to the base URL
      return baseUrl
    },
    async session({ session, token }) {
      if (session.user) {
        // Make sure to keep the user's email in the session
        session.user.id = token.sub as string;
        session.user.email = token.email as string | undefined;
        session.user.name = token.name as string | undefined;
        
        if (token.financialProfile) {
          if (token.financialProfile && typeof token.financialProfile === 'object' && 'id' in token.financialProfile) {
            session.user.financialProfile = token.financialProfile as typeof session.user.financialProfile;
          }
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        
        // Make sure to store email and name in the token
        token.email = user.email;
        token.name = user.name;
        
        // Fetch financial profile during sign-in
        try {
          const financialProfile = await prisma.financialProfile.findUnique({
            where: { userId: user.id },
          });
          
          if (financialProfile) {
            token.financialProfile = financialProfile;
          }
        } catch (error) {
          console.error("Error fetching financial profile:", error);
        }
      }
      
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
