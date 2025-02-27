import NextAuth from 'next-auth';
import type { NextAuthOptions, User, Account, Profile, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Adapter } from 'next-auth/adapters';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { AuthOptions } from "next-auth"

// Extend the next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

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

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add credentials provider for dev/test users
    CredentialsProvider({
      name: "Development Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hard-coded users for development
        const users = [
          { 
            id: "admin-id",
            name: "Administrator", 
            email: "admin@example.com", 
            username: "admin", // Note the username field here
            password: "admin123",
            role: "admin"
          },
          { 
            id: "user-id",
            name: "Test User", 
            email: "user@example.com", 
            username: "user", // Note the username field here
            password: "user123",
            role: "user" 
          }
        ];
        
        const user = users.find(user => 
          user.username === credentials?.username && 
          user.password === credentials?.password
        );
        
        if (user) {
          // Return user without the password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: null
          };
        }
        
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token if available from user
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session from token
      if (token?.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Required for credentials provider
  },
  pages: {
    signIn: '/auth/signin',
  },
}

// Export the handler for the route.ts file to use
export default NextAuth(authOptions);
