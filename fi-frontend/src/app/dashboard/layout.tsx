import "@/styles/globals.css";
import { ReactNode } from "react";
import Providers from "@/components/Providers";
import { Inter } from "next/font/google";
import Chatbot from '@/components/Chatbot';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className={`dark antialiased ${inter.className}`}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
          <ErrorBoundary>
            <AuthGuard>
              <main className="container mx-auto px-4 py-8">{children}</main>
              <Chatbot />
            </AuthGuard>
          </ErrorBoundary>
        </div>
      </div>
    </Providers>
  );
}
