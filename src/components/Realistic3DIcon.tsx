import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface Realistic3DIconProps {
  icon: LucideIcon;
  color?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'indigo' | 'violet' | 'slate';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  badge?: string | number;
}

const colorThemes = {
  cyan: {
    base: 'from-cyan-400 via-teal-500 to-cyan-700',
    shadow: 'shadow-[0_10px_20px_rgba(6,182,212,0.35)]',
    glow: 'rgba(6,182,212,0.4)',
    text: 'text-white',
    ring: 'border-cyan-200/50',
  },
  rose: {
    base: 'from-rose-400 via-rose-500 to-pink-700',
    shadow: 'shadow-[0_10px_20px_rgba(244,63,94,0.35)]',
    glow: 'rgba(244,63,94,0.4)',
    text: 'text-white',
    ring: 'border-rose-200/50',
  },
  amber: {
    base: 'from-amber-300 via-amber-500 to-orange-600',
    shadow: 'shadow-[0_10px_20px_rgba(245,158,11,0.35)]',
    glow: 'rgba(245,158,11,0.4)',
    text: 'text-white',
    ring: 'border-amber-200/50',
  },
  emerald: {
    base: 'from-emerald-400 via-emerald-500 to-teal-700',
    shadow: 'shadow-[0_10px_20px_rgba(16,185,129,0.35)]',
    glow: 'rgba(16,185,129,0.4)',
    text: 'text-white',
    ring: 'border-emerald-200/50',
  },
  indigo: {
    base: 'from-indigo-400 via-indigo-600 to-blue-800',
    shadow: 'shadow-[0_10px_20px_rgba(99,102,241,0.35)]',
    glow: 'rgba(99,102,241,0.4)',
    text: 'text-white',
    ring: 'border-indigo-200/50',
  },
  violet: {
    base: 'from-violet-400 via-purple-600 to-indigo-800',
    shadow: 'shadow-[0_10px_20px_rgba(139,92,246,0.35)]',
    glow: 'rgba(139,92,246,0.4)',
    text: 'text-white',
    ring: 'border-violet-200/50',
  },
  slate: {
    base: 'from-slate-600 via-slate-800 to-slate-950',
    shadow: 'shadow-[0_10px_20px_rgba(15,23,42,0.35)]',
    glow: 'rgba(15,23,42,0.4)',
    text: 'text-white',
    ring: 'border-slate-400/40',
  },
};

const sizeClasses = {
  sm: {
    box: 'w-8 h-8 rounded-xl',
    icon: 'h-4 w-4',
  },
  md: {
    box: 'w-11 h-11 rounded-2xl',
    icon: 'h-5 w-5',
  },
  lg: {
    box: 'w-14 h-14 rounded-[22px]',
    icon: 'h-7 w-7',
  },
  xl: {
    box: 'w-20 h-20 rounded-[28px]',
    icon: 'h-10 w-10',
  },
};

export default function Realistic3DIcon({
  icon: Icon,
  color = 'cyan',
  size = 'md',
  animated = true,
  className = '',
  badge,
}: Realistic3DIconProps) {
  const theme = colorThemes[color];
  const sz = sizeClasses[size];

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer ${sz.box} bg-gradient-to-br ${theme.base} ${theme.shadow} border ${theme.ring} select-none ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 600,
      }}
      animate={animated ? {
        y: [0, -2.5, 0],
      } : undefined}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{
        scale: 1.12,
        rotateX: -6,
        rotateY: 6,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      whileTap={{ scale: 0.94 }}
    >
      {/* 3D Specular Highlight pill on top left */}
      <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl pointer-events-none" />
      
      {/* Inner Bevel highlight */}
      <div className="absolute inset-0 rounded-[inherit] border border-white/25 pointer-events-none" />

      {/* Icon with drop shadow for 3D depth */}
      <Icon className={`${sz.icon} ${theme.text} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] relative z-10`} />

      {/* Optional Notification Badge */}
      {badge !== undefined && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center bg-rose-500 text-white font-black text-[10px] rounded-full border-2 border-white shadow-md z-20">
          {badge}
        </span>
      )}
    </motion.div>
  );
}
