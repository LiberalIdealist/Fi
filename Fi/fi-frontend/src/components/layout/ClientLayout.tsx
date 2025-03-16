"use client";

import React from 'react';
import Navbar from "./Navbar";
import Footer from "./Footer";
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '../../contexts/authContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundLayer />
      
      {/* Main container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-[1920px] mx-auto w-full">
        <ClientLayoutWrapper>
          <AuthProvider>
            <Navbar />
            <AnimatePresence mode="wait" initial={true}>
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                {children}
              </main>
            </AnimatePresence>
            <Footer />
          </AuthProvider>
        </ClientLayoutWrapper>
      </div>
    </>
  );
}

// Background component
function BackgroundLayer() {
  return (
    <>
      {/* Static dark gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black"></div>
        
        {/* Very subtle accent at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600/30"></div>
        
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>
      
      {/* Subtle glass overlay for better readability */}
      <div className="fixed inset-0 z-0 bg-black/20 backdrop-blur-sm"></div>
    </>
  );
}