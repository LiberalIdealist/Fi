'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Logo on landing page */}
          <div className="h-10 w-10 relative">
            <Image
              src="/images/fi-logo.png"
              alt="Fi Finance Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Fi Finance
          </span>
        </div>
        <div className="space-x-2">
          <Link 
            href="/login" 
            className="px-4 py-2 text-blue-400 hover:text-blue-300 border border-blue-500/40 rounded-lg"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-slow" />
      </div>

      {/* Glass blur overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl z-0" />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
            Financial Intelligence
          </h1>
          
          <p className="text-xl text-gray-300 mb-10">
            Gain insights into your financial future with AI-powered analysis and personalized recommendations.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/signin">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium text-lg flex items-center gap-2"
              >
                Get Started <FiArrowRight />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features section with animated cards */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            { title: 'AI Analysis', description: 'Intelligent insights from your financial data' },
            { title: 'Risk Assessment', description: 'Understand your risk profile with precision' },
            { title: 'Portfolio Generation', description: 'Let AI generate perfect investment mix' }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 * index }}
              className="bg-gray-900/50 backdrop-blur-lg p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all group"
            >
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-purple-500 mt-4 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
