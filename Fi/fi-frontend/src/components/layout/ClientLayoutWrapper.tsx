"use client";

import { usePathname } from 'next/navigation';
import { AuthProvider } from '../../hooks/useAuth';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}