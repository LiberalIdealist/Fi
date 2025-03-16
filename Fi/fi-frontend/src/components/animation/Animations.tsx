"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = "up",
  className = "" 
}: FadeInProps) => {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };
  
  const initial = { 
    opacity: 0, 
    ...directionOffset[direction] 
  };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ 
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = "" 
}: {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ 
  children,
  index = 0,
  className = "" 
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.5
          }
        })
      }}
      custom={index}
    >
      {children}
    </motion.div>
  );
};

export const PulseButton = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.button>
  );
};

export const CardHover = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)", 
        borderColor: "rgba(96, 165, 250, 0.3)" // blue-400 with low opacity
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};