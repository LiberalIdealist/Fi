import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section with Logo and Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-900 to-gray-900 rounded-2xl p-10 mb-16 overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.png')] bg-repeat opacity-20"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Image 
                src="/logo.png" 
                alt="Fi Logo" 
                width={100} 
                height={100}
                className="rounded-full"
                priority
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 text-white">Welcome to Fi</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Your AI-powered financial advisor that analyzes your documents, provides personalized insights, 
            and helps you build a smarter financial future.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link href="/login" className="w-full sm:w-auto">
              <span className="inline-block w-full px-8 py-4 rounded-lg text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg">
                Login
              </span>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <span className="inline-block w-full px-8 py-4 rounded-lg text-base font-medium bg-white hover:bg-gray-200 text-blue-900 transition-colors shadow-lg">
                Register
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
          <div className="bg-blue-600 w-14 h-14 rounded-lg mb-6 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-white">Personalized Analysis</h2>
          <p className="text-gray-300 mb-4">Get AI-powered insights on your financial status and recommendations tailored to your goals.</p>
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
          <div className="bg-green-600 w-14 h-14 rounded-lg mb-6 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-white">Document Intelligence</h2>
          <p className="text-gray-300 mb-4">Upload financial documents and let our AI extract valuable insights automatically.</p>
          <Link href="/signup" className="text-green-400 hover:text-green-300 inline-flex items-center">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
          <div className="bg-purple-600 w-14 h-14 rounded-lg mb-6 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-white">Smart Portfolio</h2>
          <p className="text-gray-300 mb-4">Receive personalized investment recommendations based on your risk profile and goals.</p>
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">How Fi Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
            <p className="text-gray-400">Securely upload your financial documents and statements.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-400">Our AI analyzes your financial situation and identifies patterns.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Insights</h3>
            <p className="text-gray-400">Receive personalized financial insights and recommendations.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Take Action</h3>
            <p className="text-gray-400">Implement the recommended actions to optimize your finances.</p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-900 to-purple-900 p-10 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to optimize your finances?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Start your journey to financial clarity today with Fi's AI-powered advisor</p>
        <Link href="/signup">
          <span className="inline-block px-8 py-4 rounded-lg text-lg font-medium bg-white hover:bg-gray-100 text-blue-900 transition-colors shadow-lg">
            Get Started Free
          </span>
        </Link>
      </div>
    </div>
  );
}