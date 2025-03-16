"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = !pathname.includes("/login") && !pathname.includes("/signup") && pathname !== "/";
  
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with exact same size/structure
    return (
      <div className="flex flex-col min-h-screen w-full">
        <div className="h-16 bg-gray-800/70"></div>
        <div className="flex-grow"></div>
        <div className="bg-gray-800/50 py-8"></div>
      </div>
    );
  }

  return (
    <>
      {/* Animated background for landing/login pages only */}
      {!isLoggedIn && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Subtle animated accent in top-left and bottom-right for non-logged in pages */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 animate-blob animation-delay-4000"></div>
        </div>
      )}
      
      {/* Conditional cursor effect - only on non-logged in pages */}
      {!isLoggedIn && (
        <div id="cursor-glow" className="hidden md:block fixed w-64 h-64 rounded-full pointer-events-none z-0 bg-blue-500/5 blur-3xl"></div>
      )}
      
      {children}
      
      {/* Cursor effect script only for non-logged in pages */}
      {!isLoggedIn && mounted && typeof window !== 'undefined' && (
        <script dangerouslySetInnerHTML={{
          __html: `
            if (window.innerWidth > 768) {
              const cursorGlow = document.getElementById('cursor-glow');
              document.addEventListener('mousemove', (e) => {
                if (cursorGlow) {
                  cursorGlow.style.transform = "translate(" + (e.clientX - 128) + "px, " + (e.clientY - 128) + "px)";
                }
              });
            }
          `
        }} />
      )}
    </>
  );
}