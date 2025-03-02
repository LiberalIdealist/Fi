import type { DefaultSession } from "next-auth"
import type { Profile } from "@prisma/client"
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      financialProfile?: any;
      profile: Profile | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile?: Profile | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    profile: Profile | null
  }
}
