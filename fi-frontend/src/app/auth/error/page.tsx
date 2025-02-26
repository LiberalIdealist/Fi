'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

// Client component with useSearchParams
function ErrorDisplay() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
      <p className="mb-4">There was a problem with your sign-in attempt.</p>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}
      <Link 
        href="/auth/signin" 
        className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Try Again
      </Link>
    </div>
  );
}

// Main page component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <Suspense fallback={<div className="p-8 text-center">Loading error details...</div>}>
          <ErrorDisplay />
        </Suspense>
      </div>
    </div>
  );
}