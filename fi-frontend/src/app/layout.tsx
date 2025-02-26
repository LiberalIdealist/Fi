"use client";
import '@/styles/globals.css';  // Fix the import path
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}