import { DefaultSession } from "next-auth";

// Extend the NextAuth session type
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user type
   */
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}