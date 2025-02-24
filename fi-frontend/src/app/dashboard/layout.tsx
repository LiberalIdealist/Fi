'use client';

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useCallback, type ReactNode } from 'react';
import LoadingState from '@/components/LoadingState';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const handleReset = useCallback(() => {
    resetErrorBoundary();
  }, [resetErrorBoundary]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={handleReset}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === 'loading') {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Clear any error state if needed
        window.location.reload();
      }}
      onError={(error) => {
        // Log to your error reporting service
        console.error('[Dashboard Error]:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
