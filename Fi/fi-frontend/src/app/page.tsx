"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      delay: 0.2 + (index * 0.1),
      ease: [0.16, 1, 0.3, 1]
    }
  }),
  hover: { 
    y: -10, 
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    background: "linear-gradient(120deg, rgba(37, 38, 43, 0.8), rgba(44, 47, 60, 0.8))",
    borderColor: "rgba(96, 165, 250, 0.5)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const stepVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
    transition: { duration: 0.2 }
  }
};

export default function HomePage() {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const paragraphs = [
    "Your AI-powered financial advisor that analyzes your documents and provides personalized insights.",
    "Track spending patterns, identify saving opportunities, and optimize your investment strategy.",
    "Get clear visualizations and actionable recommendations to reach your financial goals faster."
  ];

  // Cycle through paragraphs
  useEffect(() => {
    const interval = setInterval(() => {
      setParagraphIndex((prev) => (prev + 1) % paragraphs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating elements for visual interest */}
      <div className="hidden lg:block">
        <motion.div 
          className="absolute top-32 left-10 w-20 h-20 bg-blue-500/10 rounded-full"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute top-60 right-16 w-12 h-12 bg-purple-500/10 rounded-full"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
        />
      </div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-10 md:py-16"
      >
        {/* Hero Section with interactive elements */}
        <motion.div 
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 z-0">
            <motion.div 
              className="absolute inset-0 opacity-30"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
              style={{ backgroundImage: 'url(/pattern.png)', backgroundSize: '950px' }}
            />
          </div>
          
          <motion.div 
            className="relative z-10 px-6 py-16 md:py-24 text-center"
            animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          >
            {/* Logo with animation */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.2
              }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-2 rounded-full blur-md"
                  animate={{ 
                    background: [
                      'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(147,51,234,0) 70%)',
                      'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(59,130,246,0) 70%)',
                      'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(147,51,234,0) 70%)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <Image 
                  src="/logo.png" 
                  alt="Fi Logo" 
                  width={120} 
                  height={120}
                  className="rounded-full shadow-2xl relative z-10"
                  priority
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 rgba(59,130,246,0)',
                      '0 0 0 20px rgba(59,130,246,0.2)',
                      '0 0 0 40px rgba(59,130,246,0)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="font-display text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200"
              variants={fadeInUp}
            >
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient">Fi</span>
            </motion.h1>
            
            <div className="h-20 mb-8">
              <motion.p 
                key={paragraphIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-accent"
              >
                {paragraphs[paragraphIndex]}
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/auth/login" className="w-full sm:w-auto block">
                  <span className="inline-block w-full px-8 py-4 rounded-xl font-accent text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                    Log In
                  </span>
                </Link>
              </motion.div>
              
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/signup" className="w-full sm:w-auto block">
                  <span className="inline-block w-full px-8 py-4 rounded-xl border border-blue-400/20 backdrop-blur-sm font-accent text-base font-medium bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg shadow-white/5 hover:shadow-white/10">
                    Register
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Wave decoration at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-full h-12 md:h-16">
              <motion.path
                d="M0,0 C320,60 420,80 720,40 C1020,0 1380,60 1440,80 L1440,100 L0,100 Z"
                fill="rgba(17, 24, 39)"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              />
            </svg>
          </div>
        </motion.div>
        
        {/* Feature Cards with Interactive Animations */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[
            {
              color: "blue",
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              title: "Personalized Analysis",
              description: "Get AI-powered insights on your financial status and recommendations tailored to your goals."
            },
            {
              color: "green",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              title: "Document Intelligence",
              description: "Upload financial documents and let our AI extract valuable insights automatically."
            },
            {
              color: "purple",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              title: "Smart Portfolio",
              description: "Receive personalized investment recommendations based on your risk profile and goals."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              variants={featureCardVariants}
              whileHover="hover"
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-xl transition-all"
            >
              <motion.div 
                className={`bg-${feature.color}-600/80 w-14 h-14 rounded-xl mb-6 flex items-center justify-center text-white`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, 5, -5, 0], 
                  transition: { duration: 0.4 }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold mb-4 text-white font-display">{feature.title}</h2>
              <p className="text-gray-300 mb-4 font-primary">{feature.description}</p>
              <Link href="/signup" className={`text-${feature.color}-400 hover:text-${feature.color}-300 inline-flex items-center`}>
                <span className="relative group">
                  Learn more
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current group-hover:w-full transition-all duration-300"></span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* How It Works Section with Interactive Elements */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300"
          >
            How Fi Works
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {[
              { num: 1, title: "Upload Documents", desc: "Securely upload your financial documents and statements." },
              { num: 2, title: "AI Analysis", desc: "Our AI analyzes your financial situation and identifies patterns." },
              { num: 3, title: "Get Insights", desc: "Receive personalized financial insights and recommendations." },
              { num: 4, title: "Take Action", desc: "Implement the recommended actions to optimize your finances." }
            ].map((step, index) => (
              <motion.div
                key={step.num}
                custom={index}
                variants={fadeInUp}
                className="text-center relative"
              >
                <motion.div 
                  className={`relative z-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20`}
                  variants={stepVariants}
                  whileHover="hover"
                >
                  <motion.span 
                    className="text-2xl font-bold text-white"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {step.num}
                  </motion.span>
                  
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(37, 99, 235, 0)',
                        '0 0 0 10px rgba(37, 99, 235, 0.1)',
                        '0 0 0 20px rgba(37, 99, 235, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                </motion.div>
                
                {/* Connecting lines between steps */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] right-0 h-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600/50 to-blue-800/50"
                      initial={{ scaleX: 0, originX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + (index * 0.2), duration: 0.8 }}
                    />
                  </div>
                )}
                
                <h3 className="text-lg md:text-xl font-semibold mb-2 font-display">{step.title}</h3>
                <p className="text-gray-400 font-primary">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* CTA Section with Interactive Button */}
        <motion.div 
          className="text-center rounded-3xl overflow-hidden shadow-2xl relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90 z-0">
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{ 
                background: [
                  'radial-gradient(circle at 20% 80%, rgba(29, 78, 216, 0.3), transparent 60%)',
                  'radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.3), transparent 60%)',
                  'radial-gradient(circle at 20% 80%, rgba(29, 78, 216, 0.3), transparent 60%)'
                ]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>
          
          <motion.div 
            className="relative z-10 p-10 md:p-16"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-6 text-white font-display"
              variants={fadeInUp}
            >
              Ready to optimize your finances?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-primary"
              variants={fadeInUp}
            >
              Start your journey to financial clarity today with Fi's AI-powered advisor
            </motion.p>
            
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/signup">
                <motion.span 
                  className="inline-block px-8 py-5 rounded-xl text-lg font-medium bg-white relative overflow-hidden shadow-xl shadow-white/10 group"
                  onMouseDown={() => setIsMouseDown(true)}
                  onMouseUp={() => setIsMouseDown(false)}
                  onMouseLeave={() => setIsMouseDown(false)}
                >
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  
                  <motion.span
                    className="absolute inset-0 w-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-30"
                    animate={isMouseDown ? { width: '100%' } : { width: '0%' }}
                    transition={{ duration: isMouseDown ? 0.2 : 0.5 }}
                  />
                  
                  <span className="relative z-10 bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent font-display">
                    Get Started Free
                  </span>
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-full h-12 md:h-20">
              <motion.path
                d="M0,100 C240,70 480,20 720,60 C960,100 1200,70 1440,30 L1440,100 L0,100 Z"
                fill="rgb(17 24 39)"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              />
            </svg>
          </div>
        </motion.div>
        
        {/* Trust indicators / Testimonials - Optional */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-gray-400 text-sm font-primary">
            Trusted by investors worldwide • 100% secure • 256-bit encryption
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}