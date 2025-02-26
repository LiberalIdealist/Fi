"use client";

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

interface AuthProvidersProps {
  callbackUrl: string;
}

export function AuthProviders({ callbackUrl }: AuthProvidersProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => signIn('google', { callbackUrl })}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <FcGoogle className="h-5 w-5 mr-2" />
        Sign in with Google
      </button>
      
      {/* You can add more providers here if needed */}
      {/* Example:
      <button
        onClick={() => signIn('github', { callbackUrl })}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <FaGithub className="h-5 w-5 mr-2" />
        Sign in with GitHub
      </button>
      */}
    </div>
  );
}