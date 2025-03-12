"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/authContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router, mounted]);

  // Don't show anything during SSR to avoid hydration issues
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400"></div>
      </div>
    );
  }

  // If no user and not loading, the useEffect will handle redirect
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}