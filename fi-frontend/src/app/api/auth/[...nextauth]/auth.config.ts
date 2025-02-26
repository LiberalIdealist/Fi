import NextAuth from 'next-auth';
import type { NextAuthOptions, User, Account, Profile, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Adapter } from 'next-auth/adapters';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, _req) {  // Add underscore to req
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
    async signIn({ 
      user: _user,  // Rename to _user within the function
      account: _account,  // Rename to _account within the function
      profile: _profile  // Rename to _profile within the function
    }: { 
      user: User; 
      account: Account | null; 
      profile?: Profile | undefined; 
    }) {
      return true;
    },
    async redirect({ 
      url, 
      baseUrl 
    }: { 
      url: string; 
      baseUrl: string;
    }) {
      // Force redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      } else if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
    async session({ 
      session, 
      token 
    }: { 
      session: Session; 
      token: JWT;
    }) {
      if (token && session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ 
      token, 
      user 
    }: { 
      token: JWT; 
      user?: User | undefined;
    }) {
      // Add custom JWT logic here
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const, // Explicitly typed as const to match SessionStrategy
  },
  debug: process.env.NODE_ENV === "development"
};

// Export the handler for the route.ts file to use
export default NextAuth(authOptions);
