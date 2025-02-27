'use client';

import "@/styles/globals.css";
import { ReactNode, useState, useEffect } from "react";
import { Providers } from "@/components/Providers";
import { Inter } from "next/font/google";
import { CustomErrorBoundary } from "@/components/ErrorBoundary";
import AuthGuard from "@/components/AuthGuard";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  RiDashboardLine, RiFileTextLine, RiUserLine, RiPieChartLine,
  RiSettings4Line, RiLogoutBoxRLine, RiMenuLine, RiCloseLine,
  RiBellLine, RiSearchLine, RiArrowDownSLine
} from 'react-icons/ri';

const inter = Inter({ subsets: ["latin"] });

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Navigation items
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { href: '/dashboard/market-analysis', label: 'Market Analysis', icon: RiPieChartLine },
  { href: '/dashboard/documents', label: 'Documents', icon: RiFileTextLine },
  { href: '/dashboard/profile', label: 'Profile', icon: RiUserLine },
  { href: '/dashboard/settings', label: 'Settings', icon: RiSettings4Line },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Close mobile menu on wider screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Providers>
      <div className={`dark antialiased ${inter.className}`}>
        <div className="min-h-screen bg-[#0F0F1A] text-gray-200">
          <CustomErrorBoundary>
            <AuthGuard>
              <div className="flex h-screen">
                {/* Desktop Sidebar */}
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hidden lg:block bg-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 h-screen flex-shrink-0 overflow-hidden"
                    >
                      <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-10">
                          {/* Replace gradient div with actual logo */}
                          <div className="h-10 w-10 relative">
                            <Image
                              src="/images/fi-logo.png" 
                              alt="Fi Finance Logo"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Fi by WealthME
                          </h1>
                        </div>
                        
                        <nav className="space-y-1 flex-1">
                          {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            
                            return (
                              <Link href={item.href} key={item.href}>
                                <div className="relative">
                                  {isActive && (
                                    <motion.div
                                      layoutId="activeDesktopTab"
                                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"
                                      transition={{ type: "spring", duration: 0.5 }}
                                    />
                                  )}
                                  <div className={`flex items-center gap-3 p-3 rounded-xl relative z-10 ${
                                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                                  }`}>
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 absolute right-0 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </nav>
                        
                        <div className="border-t border-gray-800/50 pt-4 mt-4">
                          <div className="flex items-center gap-3 p-2 mb-4 rounded-xl">
                            {session?.user?.image ? (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image
                                  src={session.user.image}
                                  alt={session.user.name || "User"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white">
                                {session?.user?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                              <h3 className="text-sm font-medium truncate">{session?.user?.name || "User"}</h3>
                              <p className="text-xs text-gray-400 truncate">{session?.user?.email || ""}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 p-3 w-full text-left text-red-400 hover:text-red-300 rounded-xl"
                          >
                            <RiLogoutBoxRLine size={20} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>
                
                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 left-0 bottom-0 w-64 bg-gray-900 shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2">
                            {/* Logo in mobile menu */}
                            <div className="h-8 w-8 relative">
                              <Image
                                src="/images/fi-logo.png"
                                alt="Fi Logo"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                              Fi
                            </span>
                          </div>
                          <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 rounded-full hover:bg-gray-800"
                          >
                            <RiCloseLine size={20} />
                          </button>
                        </div>
                        
                        <nav className="space-y-1 mb-6">
                          {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            
                            return (
                              <Link href={item.href} key={item.href}>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                                  isActive 
                                    ? 'bg-blue-600/20 text-white' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}>
                                  <item.icon size={18} />
                                  <span>{item.label}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </nav>
                        
                        <div className="border-t border-gray-800 pt-4">
                          <div className="flex items-center gap-3 mb-4 p-2">
                            {session?.user?.image ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                  src={session.user.image}
                                  alt={session.user.name || "User"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-sm">
                                {session?.user?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium">{session?.user?.name || "User"}</div>
                              <div className="text-xs text-gray-500">{session?.user?.email || ""}</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2 p-2 w-full text-left text-red-400 hover:text-red-300 rounded-lg"
                          >
                            <RiLogoutBoxRLine size={18} />
                            <span className="text-sm">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                  {/* Header */}
                  <header className="bg-gray-900/40 backdrop-blur-md border-b border-gray-800/50 py-3 px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Mobile menu button */}
                      <button 
                        onClick={() => setIsMobileMenuOpen(true)} 
                        className="p-2 rounded-lg hover:bg-gray-800/50 lg:hidden"
                      >
                        <RiMenuLine size={20} />
                      </button>
                      
                      {/* Desktop sidebar toggle */}
                      <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-2 rounded-lg hover:bg-gray-800/50 hidden lg:block"
                      >
                        <RiMenuLine size={20} />
                      </button>
                      
                      {/* Logo in header for mobile (when menu is closed) */}
                      <div className="h-8 w-8 relative lg:hidden">
                        <Image
                          src="/images/fi-logo.png"
                          alt="Fi Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      
                      {/* Page title - show on desktop */}
                      <h2 className="text-lg font-medium hidden sm:block">
                        {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                      {/* Search - show on larger screens */}
                      <div className="hidden md:flex relative items-center">
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          className="bg-gray-800/50 border border-gray-700/50 rounded-lg py-1.5 pl-9 pr-4 text-sm w-40 lg:w-60 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      
                      {/* Notification bell */}
                      <button className="p-2 rounded-lg hover:bg-gray-800/50 relative">
                        <RiBellLine size={18} />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      </button>
                      
                      {/* User menu - show on mobile/tablet */}
                      <div className="relative lg:hidden">
                        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-800/50">
                          {session?.user?.image ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white">
                              {session?.user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <RiArrowDownSLine size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </header>
                  
                  {/* Main content area with scrolling */}
                  <main className="flex-1 overflow-auto px-4 sm:px-6 py-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-7xl mx-auto"
                    >
                      {children}
                    </motion.div>
                  </main>
                </div>
              </div>
            </AuthGuard>
          </CustomErrorBoundary>
        </div>
      </div>
    </Providers>
  );
}
