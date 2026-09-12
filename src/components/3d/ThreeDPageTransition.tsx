import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ThreeDPageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  className?: string;
  direction?: 'forward' | 'backward' | 'fade';
}

export default function ThreeDPageTransition({
  children,
  pageKey,
  className = '',
  direction = 'forward'
}: ThreeDPageTransitionProps) {
  const variants = {
    initial: {
      opacity: 0,
      scale: 0.96,
      rotateY: direction === 'forward' ? 4 : -4,
      y: 12,
      filter: 'blur(2px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 26,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      rotateY: direction === 'forward' ? -4 : 4,
      y: -10,
      filter: 'blur(2px)',
      transition: {
        duration: 0.22,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{
        perspective: 1400,
        transformStyle: 'preserve-3d',
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
