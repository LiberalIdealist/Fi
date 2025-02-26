import { DefaultSession, DefaultUser } from "next-auth";

// Extend the NextAuth session type
declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id?: string;
      // Add other custom fields your app needs
      role?: string;
      // Keep the default fields
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user type
   */
  interface User extends DefaultUser {
    // Add custom fields your app needs
    role?: string;
    // You can add any other fields your app requires
  }
}