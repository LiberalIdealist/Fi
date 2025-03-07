"use client";
import './globals.css'; // Make sure this path is correct
import Head from "next/head";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { Inter } from 'next/font/google';
import { ChakraProvider } from '@chakra-ui/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fi by WealthME',
  description: 'Smart AI Financial Advisor',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}>
        <ChakraProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ChakraProvider>
      </body>
    </html>
  );
}