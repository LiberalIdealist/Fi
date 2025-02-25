import type { DefaultSession } from "next-auth"
import type { Profile } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      profile: Profile | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    profile?: Profile | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    profile: Profile | null
  }
}
