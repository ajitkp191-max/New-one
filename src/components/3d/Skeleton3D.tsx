import React from 'react';
import { motion } from 'motion/react';

interface Skeleton3DProps {
  className?: string;
  variant?: 'card' | 'avatar' | 'line' | 'stat';
  count?: number;
}

export default function Skeleton3D({
  className = '',
  variant = 'line',
  count = 1
}: Skeleton3DProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-[32px] bg-gradient-to-b from-white to-slate-50 border border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.02)] relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200/80 shrink-0 relative overflow-hidden" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200/80 rounded-lg w-1/3" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded-lg w-full" />
              <div className="h-3.5 bg-slate-100 rounded-lg w-4/5" />
            </div>

            {/* 3D Shimmer Sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full pointer-events-none"
              animate={{ translateX: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm relative overflow-hidden space-y-3"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-200/80" />
            <div className="h-6 bg-slate-200/80 rounded-xl w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent -translate-x-full pointer-events-none"
              animate={{ translateX: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-slate-200/80 relative overflow-hidden shrink-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full"
            animate={{ translateX: ['-100%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200/70 rounded-xl relative overflow-hidden"
          style={{ width: i === items.length - 1 && items.length > 1 ? '70%' : '100%' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full"
            animate={{ translateX: ['-100%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
          />
        </div>
      ))}
    </div>
  );
}
