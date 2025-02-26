import "@/styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import { Inter } from "next/font/google";
import Chatbot from '@/components/Chatbot';
import { CustomErrorBoundary } from "@/components/ErrorBoundary";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className={`dark antialiased ${inter.className}`}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
          <CustomErrorBoundary>
            <AuthGuard>
              <Sidebar />
              <div className="lg:pl-72">
                <Header />
                <main className="py-10">
                  <div className="px-4 sm:px-6 lg:px-8">
                    {children}
                  </div>
                </main>
              </div>
              <Chatbot />
            </AuthGuard>
          </CustomErrorBoundary>
        </div>
      </div>
    </Providers>
  );
}
