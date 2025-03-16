"use client";

import { motion } from 'framer-motion';

// Animation variants that maintain layout structure
const variants = {
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ type: 'linear', duration: 0.3 }}
      className="w-full" // Ensure full width
    >
      {children}
    </motion.div>
  );
}