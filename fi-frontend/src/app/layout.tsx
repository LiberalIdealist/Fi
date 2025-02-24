"use client";
import "@/styles/globals.css";
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark antialiased">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}