"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Fi Logo" width={40} height={40} className="mr-2" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">
            Fi
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-6 hover:text-blue-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="mr-6 hover:text-blue-300 transition-colors">
              Profile
            </Link>
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <Link 
              href="/signin" 
              className="mr-4 hover:text-blue-300 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};