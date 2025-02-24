import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Account, Profile, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { handleAuthCallback, handleAuthError } from '@/utils/auth'

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
] as const;

for (const env of requiredEnvVars) {
  if (!process.env[env]) {
    throw new Error(`Missing ${env} environment variable`);
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}${handleAuthCallback(url)}`
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      if (token.error) {
        session.error = token.error
      }
      return session
    },
    async jwt({ token, account, user, profile }) {
      if (account?.error) {
        token.error = handleAuthError(
          typeof account.error === 'string' ? account.error : 'Authentication failed'
        ).error;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };