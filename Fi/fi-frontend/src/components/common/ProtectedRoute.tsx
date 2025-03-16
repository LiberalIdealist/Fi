"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/authContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Debug logging
  console.log("ProtectedRoute render:", { 
    user: user?.uid || "null", 
    loading, 
    mounted, 
    isRedirecting 
  });

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect if not authenticated
  useEffect(() => {
    // Only run after component has mounted and auth state is determined
    if (!mounted || loading) return;

    if (!user && !isRedirecting) {
      console.log("ProtectedRoute: No user found, will redirect");
      
      // Set redirecting flag to prevent multiple redirects
      setIsRedirecting(true);
      
      // Add a slight delay to allow for any final auth checks
      const redirectTimer = setTimeout(() => {
        console.log("ProtectedRoute: Redirecting to login now");
        router.push('/auth/login');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, mounted, router, isRedirecting]);

  // Don't show anything during SSR to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <p className="text-blue-400">Authenticating...</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-blue-300 underline"
          >
            Refresh if stuck
          </button>
        </div>
      </div>
    );
  }

  // If unauthenticated, show redirecting message
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <p className="text-blue-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}