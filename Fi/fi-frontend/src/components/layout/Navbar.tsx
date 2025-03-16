"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Console log to debug
  console.log("Navbar rendering, user:", user?.uid || "no user");

  return (
    <nav className="bg-gradient-to-r from-gray-950 to-gray-900 py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-x-2">
              <Image 
                src="/logo.png" 
                alt="Fi Logo" 
                width={40} 
                height={40} 
                className="mr-2"
              />
             
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/#features" className="text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
              Features
            </Link>
            <Link href="/#about" className="text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
              About
            </Link>
            
            {/* Only show auth-dependent UI after mounting client-side */}
            {mounted ? (
              user ? (
                <>
                  <Link href="/dashboard" className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    Dashboard
                  </Link>
                  <button 
                    onClick={logout}
                    className="hover:text-red-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link href="/auth/login" className="text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
                    Login
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Link>
                </div>
              )
            ) : (
              // Placeholder during SSR to avoid hydration issues
              <div className="w-20 h-8"></div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <Link href="/#features" className="block text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
              Features
            </Link>
            <Link href="/#about" className="block text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
              About
            </Link>
            
            {/* Auth links for mobile */}
            {mounted && !user && (
              <>
                <Link href="/auth/login" className="block text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="block text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
                  Get Started
                </Link>
              </>
            )}
            
            {mounted && user && (
              <>
                <Link href="/dashboard" className="block text-gray-300 hover:text-blue-400 px-3 py-2 transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="hover:text-red-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}