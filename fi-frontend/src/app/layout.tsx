"use client";
import "../styles/globals.css";
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { Inter } from 'next/font/google';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fi - Your Personal Financial Advisor',
  description: 'Get smarter with your money',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark antialiased">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content={metadata.viewport} />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100`}>
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

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="client-layout">{children}</div>;
}