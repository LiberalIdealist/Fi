import { DefaultSession } from "next-auth"

export interface AuthError {
  error: string
  description: string
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    sub?: string
    error?: string
  }
}
