import type { DefaultSession, DefaultUser } from "next-auth"
import type { Profile } from "@prisma/client"

export interface AuthError {
  error: string
  description: string
}

// Augment next-auth module types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      profile?: Profile | null
    } & DefaultSession["user"]
    error?: string
  }

  interface User extends DefaultUser {
    id: string
    profile?: Profile | null
  }
}

// Augment JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    profile: Profile | null
    error?: string
  }
}

// Export types that depend on the augmented modules
export type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  profile?: Profile | null
}

export interface QuestionnaireAnswers {
  [key: string]: string
}
