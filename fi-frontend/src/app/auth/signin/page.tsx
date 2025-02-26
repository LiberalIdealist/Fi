"use client";

import React, { Suspense } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import { AuthProviders } from '@/components/auth/AuthProviders';
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function SignInContent() {
  // This component can safely use useSearchParams()
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'; // Add null check with ?
  const error = searchParams?.get('error'); // Add null check with ?

  return (
    <div className="max-w-md w-full space-y-8">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error === 'CredentialsSignin' 
            ? 'Invalid email or password' 
            : 'Something went wrong. Please try again.'}
        </div>
      )}
      
      <SignInForm callbackUrl={callbackUrl} />
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">Or sign in with</span>
        </div>
      </div>
      
      <AuthProviders callbackUrl={callbackUrl} />
    </div>
  );
}

// Main page component with Suspense wrapper
export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Fi
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your AI-powered personal finance assistant
          </p>
        </div>
        
        {/* Wrap the component with Suspense */}
        <Suspense fallback={<div className="w-full text-center">Loading...</div>}>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  );
}