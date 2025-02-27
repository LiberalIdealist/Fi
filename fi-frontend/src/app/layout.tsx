"use client";
import '@/styles/globals.css';  // Fix the import path
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import ClientLayout from '@/components/ClientLayout';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children, session }: { children: ReactNode, session: any }) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full`}>
        <SessionProvider session={session}>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}