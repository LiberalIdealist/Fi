"use client";

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

interface AuthProvidersProps {
  callbackUrl: string;
}

export function AuthProviders({ callbackUrl }: AuthProvidersProps) {
  const handleGoogleSignIn = async () => {
    console.log('Initiating Google sign-in with callback:', callbackUrl);
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true // Force redirect to Google OAuth
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <FcGoogle className="h-5 w-5 mr-2" />
        Sign in with Google
      </button>
    </div>
  );
}