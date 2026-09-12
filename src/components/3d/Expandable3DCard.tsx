import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Minimize2, Sparkles, ChevronRight } from 'lucide-react';

interface Expandable3DCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  previewContent: React.ReactNode;
  expandedContent: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  actionText?: string;
  id?: string;
}

export default function Expandable3DCard({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-cyan-50 text-cyan-700',
  previewContent,
  expandedContent,
  icon,
  className = '',
  actionText = 'Expand Details',
  id
}: Expandable3DCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Compact / Preview Card */}
      <motion.div
        id={id}
        layout
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_12px_28px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.07)] transition-shadow duration-300 relative overflow-hidden group flex flex-col justify-between ${className}`}
      >
        {/* Subtle Top Specular Sheen */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 shadow-sm">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400 font-semibold">{subtitle}</p>}
              </div>
            </div>

            {badge && (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>

          <div className="text-sm text-slate-600">
            {previewContent}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(true)}
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-cyan-600 hover:text-cyan-700 group/btn transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" />
            {actionText}
          </span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </motion.div>

      {/* Expanded Modal Overlay with 3D Depth & Backdrop Blur */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md">
            {/* Backdrop Click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="absolute inset-0"
            />

            {/* Expanded Modal Content */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15, rotateX: -6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ perspective: 1200 }}
              className="bg-white rounded-[36px] max-w-2xl w-full p-6 sm:p-8 border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.2)] relative z-10 overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shadow-sm">
                      {icon}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                      {badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                          {badge}
                        </span>
                      )}
                    </div>
                    {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Expanded Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1">
                {expandedContent}
              </div>

              {/* Footer */}
              <div className="pt-5 border-t border-slate-100 mt-6 flex justify-end shrink-0">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-md active:scale-95"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
