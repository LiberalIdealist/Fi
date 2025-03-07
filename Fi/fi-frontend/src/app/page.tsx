import Link from 'next/link';
import Image from 'next/image';
import '../styles/globals.css'; // Make sure this path is correct

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">Fi</h1>
        </div>
        <nav>
          <a href="/signin" className="px-4 py-2 mr-3 text-white hover:text-blue-300 transition-colors">Sign In</a>
          <a href="/signup" className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300">Sign Up</a>
        </nav>
      </header>
      
      {/* Hero section */}
      <section className="relative z-10 flex flex-col items-center justify-center mt-10 px-4 text-white text-center">
        <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text">
          Financial Insights
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Make smarter financial decisions with our AI-powered platform that analyzes your portfolio and provides personalized recommendations.
        </p>
        <a href="/signup" className="px-8 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300 hover:shadow-xl animate-pulse">
          Get Started
        </a>
        
        {/* Feature cards */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          <div className="relative p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-[length:200%_200%]">
            <div className="bg-gray-900 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Why Choose Fi?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="text-lg font-semibold mb-2">Portfolio Analysis</h4>
                  <p className="text-gray-400">Get detailed insights into your investments and performance metrics</p>
                </div>
                
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="text-3xl mb-2">🤖</div>
                  <h4 className="text-lg font-semibold mb-2">AI Advisor</h4>
                  <p className="text-gray-400">Receive personalized recommendations based on your financial goals</p>
                </div>
                
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="text-3xl mb-2">🔒</div>
                  <h4 className="text-lg font-semibold mb-2">Secure & Private</h4>
                  <p className="text-gray-400">Your financial data is encrypted and never shared with third parties</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonial section */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          <blockquote className="p-8 bg-gray-800 bg-opacity-50 rounded-lg text-left">
            <p className="text-xl italic mb-4">"Fi has transformed how I manage my investments. The AI recommendations have helped me increase my returns by 15% in just three months."</p>
            <cite className="block text-right text-gray-400">— Sarah Johnson, Software Engineer</cite>
          </blockquote>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 mt-20 p-6 text-center text-gray-400">
        <p>© 2025 Fi by WealthME. All rights reserved.</p>
        <div className="mt-2">
          <a href="/terms" className="mx-2 hover:text-white">Terms</a>
          <a href="/privacy" className="mx-2 hover:text-white">Privacy</a>
          <a href="/contact" className="mx-2 hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
}