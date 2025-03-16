import './globals.css';
import { Inter, Poppins, Roboto } from 'next/font/google';
import { Metadata } from 'next';
import ClientLayout from '../components/layout/ClientLayout';

// Professional font setup
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-accent',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fi by WealthME',
  description: 'Smart AI Financial Advisor - Personalized insights for your financial journey',
  openGraph: {
    title: 'Fi by WealthME',
    description: 'AI-powered financial insights and portfolio recommendations',
    images: ['/og-image.jpg'],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      
      {/* Server component passes children to client component */}
      <body className="bg-gray-900 text-gray-100 min-h-screen flex flex-col relative overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}