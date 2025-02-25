import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Profile } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profile: Profile | null;
    } & DefaultSession["user"];
  }
}