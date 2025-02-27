"use client";

import React, { Suspense } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import { AuthProviders } from '@/components/auth/AuthProviders';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Create a client component that uses useSearchParams
function SignInContent() {
  // This component can safely use useSearchParams()
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const error = searchParams?.get('error');

  return (
    <div className="max-w-md w-full space-y-8 glass-panel p-8 border border-gray-800/50">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800/50">
          {error === 'CredentialsSignin' 
            ? 'Invalid email or password' 
            : 'Something went wrong. Please try again.'}
        </div>
      )}
      
      <SignInForm callbackUrl={callbackUrl} />
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700/50"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-400 bg-gray-800/50 backdrop-blur-sm">Or sign in with</span>
        </div>
      </div>
      
      <AuthProviders callbackUrl={callbackUrl} />
    </div>
  );
}

// Main page component with Suspense wrapper
export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/images/fi-logo.png"
            alt="Fi Logo"
            width={180}
            height={60}
            priority
            className="mx-auto object-contain"
          />
          <h1 className="mt-3 text-3xl font-extrabold text-white">
            Sign in to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Fi</span>
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Your AI-powered personal finance assistant
          </p>
        </div>
        
        {/* Wrap the component with Suspense */}
        <Suspense fallback={<div className="w-full text-center text-gray-300">Loading...</div>}>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  );
}