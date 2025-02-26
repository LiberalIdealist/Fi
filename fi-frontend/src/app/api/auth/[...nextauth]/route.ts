import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import { authOptions } from "./auth.config"

const handler = NextAuth(authOptions as NextAuthOptions)

export { handler as GET, handler as POST }
