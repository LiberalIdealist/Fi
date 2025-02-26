'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  // Redirect handler for sign-in buttons
  const handleSignIn = async (provider: string) => {
    await signIn(provider, {
      callbackUrl,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Sign In</h1>

        <button
          onClick={() => handleSignIn('google')}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg mb-4 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Additional authentication options would go here */}
      </div>
    </div>
  );
}