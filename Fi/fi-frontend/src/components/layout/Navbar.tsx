"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-gray-950 py-4 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Fi Logo" 
                width={40} 
                height={40} 
                className="mr-2"
              />
              <span className="text-xl font-bold text-white">Fi</span>
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
            <Link href="/#features" className="text-gray-300 hover:text-white px-3 py-2">
              Features
            </Link>
            <Link href="/#about" className="text-gray-300 hover:text-white px-3 py-2">
              About
            </Link>
            
            {/* Only show auth-dependent UI after mounting client-side */}
            {mounted ? (
              user ? (
                <Link href="/dashboard" className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white">
                  Dashboard
                </Link>
              ) : (
                <div className="flex space-x-4">
                  <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    Register
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
            <Link href="/#features" className="block text-gray-300 hover:text-white px-3 py-2">
              Features
            </Link>
            <Link href="/#about" className="block text-gray-300 hover:text-white px-3 py-2">
              About
            </Link>
            
            {/* Auth links for mobile */}
            {mounted && !user && (
              <>
                <Link href="/login" className="block text-gray-300 hover:text-white px-3 py-2">
                  Login
                </Link>
                <Link href="/signup" className="block text-gray-300 hover:text-white px-3 py-2">
                  Register
                </Link>
              </>
            )}
            
            {mounted && user && (
              <Link href="/dashboard" className="block text-gray-300 hover:text-white px-3 py-2">
                Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}