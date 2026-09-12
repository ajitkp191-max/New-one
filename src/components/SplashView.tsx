import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds loading experience
    const intervalTime = 25;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-50 overflow-hidden" id="splash-container">
      {/* Skip Button for fast access */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute top-5 right-5 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white transition-all backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-lg"
      >
        <span>Skip</span>
        <span className="text-teal-400">→</span>
      </button>

      {/* Dynamic abstract radial clinical glowing spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-[100px]" />

      <div className="relative flex flex-col items-center z-10 max-w-sm w-full px-6 text-center">
        {/* Animated glowing paw logo using SVGs & motion */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-28 h-28 mb-6 flex items-center justify-center"
        >
          {/* Glowing pulse rings */}
          <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-teal-500/30 animate-pulse" />

          {/* Detailed Veterinary Paw Icon in 3D-styled SVG */}
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">
            {/* Top Pads */}
            <circle cx="30" cy="35" r="10" fill="currentColor" opacity="0.85" />
            <circle cx="50" cy="22" r="10" fill="currentColor" />
            <circle cx="70" cy="35" r="10" fill="currentColor" opacity="0.85" />
            {/* Lower Big Pad */}
            <path d="M50,45 C35,45 25,58 25,72 C25,82 35,90 50,90 C65,90 75,82 75,72 C75,58 65,45 50,45 Z" fill="currentColor" />
            {/* Centered medical cross in paw pad */}
            <rect x="46" y="60" width="8" height="18" fill="#020617" rx="2" />
            <rect x="41" y="65" width="18" height="8" fill="#020617" rx="2" />
          </svg>
        </motion.div>

        {/* Brand Name */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-200 via-emerald-300 to-sky-200 bg-clip-text text-transparent"
        >
          VetPulse Pro
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-slate-400 text-sm mt-2 tracking-wider font-semibold uppercase flex items-center gap-1.5 justify-center"
        >
          <Activity className="h-4 w-4 text-teal-400 shrink-0" />
          Smart Veterinary Care
        </motion.p>

        {/* Animating Medical Pulse line overlay */}
        <div className="w-full h-12 my-6 relative overflow-hidden flex items-center justify-center bg-slate-900/40 rounded-xl border border-white/5">
          <svg className="w-56 h-10 text-teal-500/40" viewBox="0 0 100 40">
            <path 
              d="M0,20 L30,20 L35,10 L40,30 L45,0 L50,40 L55,15 L60,25 L65,20 L100,20" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              strokeDasharray="150"
              strokeDashoffset={150 - (progress / 100) * 150}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-teal-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
            SYS_OK
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 p-0.5">
          <motion.div 
            className="bg-gradient-to-r from-teal-500 to-sky-400 h-full rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Text descriptions loading status */}
        <div className="mt-4 flex items-center justify-between w-full text-[11px] font-mono text-slate-500">
          <span>{Math.round(progress)}% loaded</span>
          {progress < 40 ? (
            <span>Securing sandbox cloud...</span>
          ) : progress < 75 ? (
            <span>Pre-loading clinical modules...</span>
          ) : (
            <span className="flex items-center gap-1 text-teal-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Core modules verified
            </span>
          )}
        </div>
      </div>

      {/* PWA / Android packaging indicators */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono tracking-wider">
        PWA SUPPORT ENABLED • ANDROID ENGINE ACTIVE
      </div>
    </div>
  );
}
