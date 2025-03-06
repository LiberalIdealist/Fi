import '../styles/globals.css'; // Ensure this points to your CSS file with gradients
import Head from "next/head";
import { Navbar } from "../components/Navbar";
import  Footer  from "../components/Footer";
import { Inter } from 'next/font/google';

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
      <Head>
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${inter.className} bg-gray-900 min-h-screen`}>
        <Navbar />
        <main className="flex-grow container mx-auto p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}