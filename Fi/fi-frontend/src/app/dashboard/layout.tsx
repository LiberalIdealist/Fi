"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/authContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add console logs for debugging
    console.log("Dashboard layout mounted");
    const token = localStorage.getItem("fi_auth_token");
    console.log("Token found:", !!token);
    
    // Don't redirect immediately - give time to debug
    const checkAuth = async () => {
      try {
        if (!token) {
          console.log("No token found, redirecting to login");
          router.push("/login");
          return;
        }
        
        // Verify token with backend - only if you need to
        // Comment this out first to see if it's causing the issue
        /*
        await authService.checkAuth();
        console.log("Auth check passed");
        */
        
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("fi_auth_token");
        localStorage.removeItem("user_data");
        router.push("/login");
      }
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
      <nav className="bg-gradient-to-r from-gray-950 to-gray-900 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 px-2">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <span className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Fi</span>
              </Link>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard')}`}>Dashboard</span>
                </Link>
                <Link href="/dashboard/profile">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/profile')}`}>Profile</span>
                </Link>
                <Link href="/dashboard/questionnaire">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/questionnaire')}`}>Questionnaire</span>
                </Link>
                <Link href="/dashboard/documents">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/documents')}`}>Documents</span>
                </Link>
                <Link href="/dashboard/analysis">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/analysis')}`}>Analysis</span>
                </Link>
                <Link href="/dashboard/portfolio">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/portfolio')}`}>Portfolio</span>
                </Link>
                <Link href="/dashboard/chat">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/chat')}`}>Chat</span>
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
                      className="px-3 py-2 text-sm font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors rounded-md"
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
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard')}`}>Dashboard</span>
              </Link>
              <Link href="/dashboard/profile">
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/profile')}`}>Profile</span>
              </Link>
              <Link href="/dashboard/questionnaire">
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/questionnaire')}`}>Questionnaire</span>
              </Link>
              <Link href="/dashboard/documents">
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/documents')}`}>Documents</span>
              </Link>
              <Link href="/dashboard/analysis">
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/analysis')}`}>Analysis</span>
              </Link>
              <Link href="/dashboard/portfolio">
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/portfolio')}`}>Portfolio</span>
              </Link>
              <Link href="/dashboard/chat">
                <span className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors ${isActive('/dashboard/chat')}`}>Chat</span>
              </Link>
              <button 
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-400 transition-colors"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </nav>
      
      {/* Main content */}
      <main className="pb-12 px-4 sm:px-6 md:px-8">{children}</main>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-950 to-gray-900 py-6 mt-4 text-gray-400">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Fi - AI Financial Advisor</p>
        </div>
      </footer>
    </div>
  );
}