"use client";

import { usePathname } from 'next/navigation';
import { AuthProvider } from '../../contexts/authContext';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}