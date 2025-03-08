"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-800' : 'hover:bg-gray-800';
  };
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <span className="text-xl font-bold">Fi</span>
              </Link>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>Dashboard</span>
                </Link>
                <Link href="/dashboard/profile">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/profile')}`}>Profile</span>
                </Link>
                <Link href="/dashboard/questionnaire">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/questionnaire')}`}>Questionnaire</span>
                </Link>
                <Link href="/dashboard/documents">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/documents')}`}>Documents</span>
                </Link>
                <Link href="/dashboard/analysis">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/analysis')}`}>Analysis</span>
                </Link>
                <Link href="/dashboard/portfolio">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/portfolio')}`}>Portfolio</span>
                </Link>
                <Link href="/dashboard/chat">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/chat')}`}>Chat</span>
                </Link>
              </div>
            </div>
            
            {/* User menu */}
            <div className="hidden md:block">
              <div className="flex items-center">
                <div className="ml-3 relative">
                  <div>
                    <button 
                      type="button" 
                      onClick={handleLogout}
                      className="px-3 py-2 text-sm font-medium hover:bg-gray-800 rounded-md"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/dashboard">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}>Dashboard</span>
              </Link>
              <Link href="/dashboard/profile">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/profile')}`}>Profile</span>
              </Link>
              <Link href="/dashboard/questionnaire">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/questionnaire')}`}>Questionnaire</span>
              </Link>
              <Link href="/dashboard/documents">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/documents')}`}>Documents</span>
              </Link>
              <Link href="/dashboard/analysis">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/analysis')}`}>Analysis</span>
              </Link>
              <Link href="/dashboard/portfolio">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/portfolio')}`}>Portfolio</span>
              </Link>
              <Link href="/dashboard/chat">
                <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/chat')}`}>Chat</span>
              </Link>
              <button 
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </nav>
      
      {/* Main content */}
      <main className="pb-12">{children}</main>
      
      {/* Footer */}
      <footer className="bg-gray-950 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Fi - AI Financial Advisor</p>
        </div>
      </footer>
    </div>
  );
}