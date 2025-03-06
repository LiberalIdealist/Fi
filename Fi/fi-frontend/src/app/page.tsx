import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Header with auth links instead of logout button */}
      <header className="relative z-10 p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">Fi</h1>
        <nav>
          <Link href="/signin" 
                className="px-4 py-2 mr-2 text-white hover:text-blue-300">
            Sign In
          </Link>
          <Link href="/signup" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg">
            Sign Up
          </Link>
        </nav>
      </header>
      
      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-white">
        <div className="container max-w-4xl mx-auto text-center mt-[-80px]">
          <h2 className="text-5xl font-bold mb-6">
            Smart financial decisions start here
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Leverage AI-powered insights to optimize your investments, track spending patterns, 
            and build wealth intelligently with our comprehensive financial platform.
          </p>
          
          <Link 
            href="/signup"
            className="px-8 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}