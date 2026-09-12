import React from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Sparkles, LucideIcon } from 'lucide-react';

export type Button3DVariant = 'cyan' | 'emerald' | 'rose' | 'slate' | 'amber' | 'ghost';

interface Morphing3DButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: Button3DVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
}

const variantStyles: Record<Button3DVariant, { bg: string; shadow: string; glow: string; text: string }> = {
  cyan: {
    bg: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-400 hover:to-teal-500',
    shadow: 'shadow-[0_10px_25px_rgba(6,182,212,0.35)] active:shadow-[0_4px_12px_rgba(6,182,212,0.25)]',
    glow: 'rgba(6,182,212,0.5)',
    text: 'text-white'
  },
  emerald: {
    bg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500',
    shadow: 'shadow-[0_10px_25px_rgba(16,185,129,0.35)] active:shadow-[0_4px_12px_rgba(16,185,129,0.25)]',
    glow: 'rgba(16,185,129,0.5)',
    text: 'text-white'
  },
  rose: {
    bg: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-500',
    shadow: 'shadow-[0_10px_25px_rgba(244,63,94,0.35)] active:shadow-[0_4px_12px_rgba(244,63,94,0.25)]',
    glow: 'rgba(244,63,94,0.5)',
    text: 'text-white'
  },
  slate: {
    bg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700',
    shadow: 'shadow-[0_10px_25px_rgba(15,23,42,0.25)] active:shadow-[0_4px_12px_rgba(15,23,42,0.15)]',
    glow: 'rgba(15,23,42,0.4)',
    text: 'text-white'
  },
  amber: {
    bg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500',
    shadow: 'shadow-[0_10px_25px_rgba(245,158,11,0.35)] active:shadow-[0_4px_12px_rgba(245,158,11,0.25)]',
    glow: 'rgba(245,158,11,0.5)',
    text: 'text-white'
  },
  ghost: {
    bg: 'bg-white hover:bg-slate-50 border border-slate-200/80',
    shadow: 'shadow-sm active:shadow-none',
    glow: 'rgba(0,0,0,0.05)',
    text: 'text-slate-700'
  }
};

const sizeStyles = {
  sm: 'py-2 px-3.5 text-xs rounded-xl gap-1.5',
  md: 'py-2.5 px-5 text-xs font-black rounded-2xl gap-2',
  lg: 'py-3.5 px-7 text-sm font-black rounded-[22px] gap-2.5'
};

export default function Morphing3DButton({
  children,
  onClick,
  variant = 'cyan',
  size = 'md',
  loading = false,
  success = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  id
}: Morphing3DButtonProps) {
  const currentVariant = variantStyles[variant];

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.025, y: -1 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.96, y: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`relative inline-flex items-center justify-center font-black transition-colors select-none overflow-hidden ${sizeStyles[size]} ${currentVariant.bg} ${currentVariant.shadow} ${currentVariant.text} ${
        disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : 'cursor-pointer'
      } ${className}`}
    >
      {/* 3D Top Highlight Bevel */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30 pointer-events-none" />

      {/* Morphing state transitions */}
      <motion.div
        layout
        className="flex items-center justify-center gap-2"
      >
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Processing...</span>
          </motion.div>
        ) : success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 text-white"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Done!</span>
          </motion.div>
        ) : (
          <>
            {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
            <span>{children}</span>
          </>
        )}
      </motion.div>
    </motion.button>
  );
}
