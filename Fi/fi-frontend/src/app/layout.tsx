import './globals.css';
import { Inter } from 'next/font/google';
import { Navbar } from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ClientLayoutWrapper from '../components/layout/ClientLayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fi by WealthME',
  description: 'Smart AI Financial Advisor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}>
        <ClientLayoutWrapper>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}