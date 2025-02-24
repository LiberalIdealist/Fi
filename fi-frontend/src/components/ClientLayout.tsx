"use client";

import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Providers>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </Providers>
  );
}