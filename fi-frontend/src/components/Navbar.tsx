"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 py-3 mb-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link 
          href="/" 
          className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          WealthMe
        </Link>
        {session && (
          <Link 
            href="/dashboard" 
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <span className="text-gray-300">Hello, {session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
