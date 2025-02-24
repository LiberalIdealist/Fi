"use client";
import "../styles/globals.css";
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { useSession, signIn, signOut } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}