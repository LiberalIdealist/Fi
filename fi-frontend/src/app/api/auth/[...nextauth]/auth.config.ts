import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma/prisma"
import bcrypt from "bcryptjs"

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET'
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
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
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        if (typeof credentials.email !== 'string') {
          throw new Error("Invalid email format");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { 
            id: true, 
            name: true, 
            email: true, 
            password: true,
            profile: true
          },
        })

        if (!user || !user.password) {
          throw new Error("User not found")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValidPassword) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id
        token.profile = user.profile
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.profile = token.profile
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
