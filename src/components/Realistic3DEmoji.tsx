import React from 'react';
import { motion } from 'motion/react';

export type EmojiType = 
  | 'dog' | '🐶' 
  | 'cat' | '🐱' 
  | 'bird' | '🦜' 
  | 'paw' | '🐾'
  | 'heart' | '❤️' | '💖'
  | 'pill' | '💊'
  | 'stethoscope' | '🩺'
  | 'lab' | '🧪'
  | 'imaging' | '📸'
  | 'clipboard' | '📋'
  | 'clinic' | '🏥'
  | 'syringe' | '💉'
  | 'thermometer' | '🌡️'
  | 'star' | '⭐'
  | 'shield' | '🛡️';

interface Realistic3DEmojiProps {
  emoji: EmojiType | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-4xl',
  '2xl': 'w-28 h-28 text-5xl',
};

export default function Realistic3DEmoji({
  emoji,
  size = 'md',
  animated = true,
  className = '',
  onClick,
  title,
}: Realistic3DEmojiProps) {
  const norm = emoji.toLowerCase().trim();

  // Determine rendering style and animation based on emoji kind
  const renderVisual = () => {
    // 3D Realistic Heart
    if (norm === 'heart' || norm === '❤️' || norm === '💖') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            scale: [1, 1.18, 1.05, 1.15, 1],
            rotate: [0, -1.5, 1.5, 0],
          } : undefined}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-1 rounded-full bg-rose-500/25 blur-md" />
          
          {/* 3D Anatomical / Glossy Heart SVG with Specular Highlights */}
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] drop-shadow-[0_8px_16px_rgba(225,29,72,0.4)]">
            <defs>
              <linearGradient id="heart3dGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="35%" stopColor="#e11d48" />
                <stop offset="75%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
              <radialGradient id="heartSpecular" cx="35%" cy="30%" r="40%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#ff758f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Heart Body */}
            <path
              d="M50,88 C32,74 12,56 12,35 C12,18 24,8 39,8 C45,8 50,12 50,15 C50,12 55,8 61,8 C76,8 88,18 88,35 C88,56 68,74 50,88 Z"
              fill="url(#heart3dGrad)"
            />
            {/* Left Lobe Specular Highlight */}
            <path
              d="M50,88 C32,74 12,56 12,35 C12,18 24,8 39,8 C45,8 50,12 50,15 C50,12 55,8 61,8 C76,8 88,18 88,35 C88,56 68,74 50,88 Z"
              fill="url(#heartSpecular)"
            />
            {/* Glossy Curved Rim highlight */}
            <ellipse cx="32" cy="24" rx="10" ry="6" transform="rotate(-25 32 24)" fill="#ffffff" opacity="0.65" />
            <ellipse cx="68" cy="24" rx="7" ry="4" transform="rotate(25 68 24)" fill="#ffffff" opacity="0.45" />
            {/* Bottom shadow curve */}
            <path
              d="M26,50 C38,68 46,78 50,84 C54,78 62,68 74,50"
              fill="none"
              stroke="#4c0519"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.3"
            />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Dog
    if (norm === 'dog' || norm === '🐶') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            y: [0, -3, 0],
            rotate: [0, -2, 2, 0],
          } : undefined}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative w-[92%] h-[92%] rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-400 p-0.5 shadow-[0_8px_16px_rgba(217,119,6,0.3)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-50 to-amber-200 flex items-center justify-center relative overflow-hidden">
              {/* Dog 3D Head SVG with fur tone and glossy snout */}
              <svg viewBox="0 0 100 100" className="w-[88%] h-[88%]">
                <defs>
                  <linearGradient id="dogFur" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="60%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                  <radialGradient id="dogNose" cx="40%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                </defs>
                {/* Ears */}
                <path d="M22,25 C14,35 10,60 20,68 C26,72 32,58 30,42 Z" fill="#b45309" />
                <path d="M78,25 C86,35 90,60 80,68 C74,72 68,58 70,42 Z" fill="#92400e" />
                {/* Head Base */}
                <ellipse cx="50" cy="50" rx="34" ry="30" fill="url(#dogFur)" />
                {/* Cheeks / Muzzle */}
                <ellipse cx="50" cy="62" rx="22" ry="18" fill="#fef3c7" />
                {/* Eyes */}
                <ellipse cx="36" cy="44" rx="4.5" ry="5.5" fill="#1e293b" />
                <circle cx="34.5" cy="42" r="1.5" fill="#ffffff" />
                <ellipse cx="64" cy="44" rx="4.5" ry="5.5" fill="#1e293b" />
                <circle cx="62.5" cy="42" r="1.5" fill="#ffffff" />
                {/* 3D Glossy Nose */}
                <path d="M44,58 C44,54 56,54 56,58 C56,63 52,66 50,66 C48,66 44,63 44,58 Z" fill="url(#dogNose)" />
                <ellipse cx="48" cy="57" rx="2.5" ry="1.2" fill="#94a3b8" />
                {/* Cute Tongue */}
                <path d="M47,68 C47,75 53,75 53,68 Z" fill="#f43f5e" />
              </svg>
            </div>
          </div>
        </motion.div>
      );
    }

    // 3D Realistic Cat
    if (norm === 'cat' || norm === '🐱') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            y: [0, -2.5, 0],
            rotate: [0, 1.5, -1.5, 0],
          } : undefined}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative w-[92%] h-[92%] rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 p-0.5 shadow-[0_8px_16px_rgba(71,85,105,0.25)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-[88%] h-[88%]">
                <defs>
                  <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="60%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                  <radialGradient id="catEye" cx="40%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </radialGradient>
                </defs>
                {/* Triangular Ears */}
                <polygon points="20,44 26,18 44,34" fill="#64748b" />
                <polygon points="25,40 29,24 40,34" fill="#fda4af" />
                <polygon points="80,44 74,18 56,34" fill="#475569" />
                <polygon points="75,40 71,24 60,34" fill="#fda4af" />
                {/* Cat Head */}
                <ellipse cx="50" cy="52" rx="33" ry="28" fill="url(#catFur)" />
                {/* White Muzzle */}
                <ellipse cx="50" cy="62" rx="18" ry="14" fill="#ffffff" />
                {/* Amber Eyes with slit pupils */}
                <ellipse cx="36" cy="46" rx="6" ry="6" fill="url(#catEye)" />
                <ellipse cx="36" cy="46" rx="1.5" ry="5" fill="#0f172a" />
                <ellipse cx="64" cy="46" rx="6" ry="6" fill="url(#catEye)" />
                <ellipse cx="64" cy="46" rx="1.5" ry="5" fill="#0f172a" />
                {/* Nose & Whiskers */}
                <polygon points="47,59 53,59 50,63" fill="#f43f5e" />
                {/* Whiskers */}
                <line x1="22" y1="60" x2="38" y2="62" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="67" x2="38" y2="65" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="78" y1="60" x2="62" y2="62" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="80" y1="67" x2="62" y2="65" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </motion.div>
      );
    }

    // 3D Realistic Bird / Parrot
    if (norm === 'bird' || norm === '🦜') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            y: [0, -3, 0],
            rotate: [0, -3, 3, 0],
          } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-[92%] h-[92%] rounded-full bg-gradient-to-br from-emerald-100 to-teal-300 p-0.5 shadow-[0_8px_16px_rgba(16,185,129,0.3)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
              <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]">🦜</span>
            </div>
          </div>
        </motion.div>
      );
    }

    // 3D Realistic Paw
    if (norm === 'paw' || norm === '🐾') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? { scale: [1, 1.08, 1] } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_6px_12px_rgba(13,148,136,0.3)]">
            <defs>
              <linearGradient id="pawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="60%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#115e59" />
              </linearGradient>
            </defs>
            <circle cx="28" cy="36" r="10" fill="url(#pawGrad)" />
            <circle cx="50" cy="22" r="11" fill="url(#pawGrad)" />
            <circle cx="72" cy="36" r="10" fill="url(#pawGrad)" />
            <path d="M50,46 C34,46 22,60 22,74 C22,86 34,92 50,92 C66,92 78,86 78,74 C78,60 66,46 50,46 Z" fill="url(#pawGrad)" />
            <ellipse cx="50" cy="70" rx="14" ry="10" fill="#5eead4" opacity="0.35" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Pill / Capsule
    if (norm === 'pill' || norm === '💊') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            rotate: [15, 25, 15],
            y: [0, -3, 0],
          } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_8px_16px_rgba(59,130,246,0.35)]">
            <defs>
              <linearGradient id="pillRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="pillWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <g transform="rotate(35 50 50)">
              {/* Top Half (Red) */}
              <path d="M36,25 C36,15 64,15 64,25 L64,50 L36,50 Z" fill="url(#pillRed)" />
              {/* Bottom Half (White) */}
              <path d="M36,50 L64,50 L64,75 C64,85 36,85 36,75 Z" fill="url(#pillWhite)" />
              {/* Glossy Reflection strip */}
              <rect x="40" y="20" width="5" height="58" rx="2.5" fill="#ffffff" opacity="0.75" />
              {/* Center join band */}
              <line x1="35" y1="50" x2="65" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Stethoscope
    if (norm === 'stethoscope' || norm === '🩺') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            y: [0, -3, 0],
            rotate: [0, -3, 3, 0]
          } : undefined}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] drop-shadow-[0_8px_16px_rgba(15,23,42,0.3)]">
            <defs>
              <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Tubing */}
            <path d="M30,20 C30,55 35,70 55,70 C70,70 70,55 70,45" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
            {/* Binaural Metal Tubes */}
            <path d="M30,25 L30,15 C30,10 40,8 40,15" fill="none" stroke="url(#chromeGrad)" strokeWidth="4" strokeLinecap="round" />
            <path d="M70,25 L70,15 C70,10 60,8 60,15" fill="none" stroke="url(#chromeGrad)" strokeWidth="4" strokeLinecap="round" />
            {/* Chestpiece Bell */}
            <circle cx="70" cy="45" r="14" fill="url(#chromeGrad)" />
            <circle cx="70" cy="45" r="9" fill="#0284c7" />
            <circle cx="68" cy="43" r="3" fill="#ffffff" opacity="0.8" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Lab Flask / Tube
    if (norm === 'lab' || norm === '🧪') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            y: [0, -3, 0],
            rotate: [0, 4, -4, 0],
          } : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_8px_16px_rgba(6,182,212,0.35)]">
            <defs>
              <linearGradient id="flaskLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            {/* Glass tube */}
            <rect x="40" y="15" width="20" height="65" rx="10" fill="none" stroke="#cbd5e1" strokeWidth="4" />
            {/* Liquid */}
            <path d="M42,48 L58,48 L58,70 C58,76 42,76 42,70 Z" fill="url(#flaskLiquid)" />
            {/* Bubbles */}
            <circle cx="48" cy="62" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="53" cy="55" r="2.5" fill="#ffffff" opacity="0.8" />
            <circle cx="47" cy="52" r="1.5" fill="#ffffff" opacity="0.8" />
            {/* Glass highlight */}
            <line x1="44" y1="20" x2="44" y2="70" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Imaging / Camera
    if (norm === 'imaging' || norm === '📸') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? { scale: [1, 1.05, 1] } : undefined}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_8px_16px_rgba(99,102,241,0.35)]">
            <defs>
              <linearGradient id="camBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            <rect x="20" y="30" width="60" height="46" rx="12" fill="url(#camBody)" />
            <circle cx="50" cy="53" r="16" fill="#1e1b4b" />
            <circle cx="50" cy="53" r="12" fill="#38bdf8" opacity="0.8" />
            <circle cx="46" cy="49" r="4" fill="#ffffff" opacity="0.9" />
            {/* Flash */}
            <circle cx="68" cy="40" r="4" fill="#fef08a" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Clipboard
    if (norm === 'clipboard' || norm === '📋') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? { y: [0, -3, 0] } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_8px_16px_rgba(15,23,42,0.25)]">
            <rect x="25" y="20" width="50" height="65" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="36" y="12" width="28" height="12" rx="4" fill="#94a3b8" />
            <line x1="35" y1="36" x2="65" y2="36" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="48" x2="65" y2="48" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="35" y1="58" x2="58" y2="58" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="35" y1="68" x2="50" y2="68" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Clinic
    if (norm === 'clinic' || norm === '🏥') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? { y: [0, -2, 0] } : undefined}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] drop-shadow-[0_8px_16px_rgba(13,148,136,0.3)]">
            <rect x="22" y="30" width="56" height="55" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="42" y="15" width="16" height="15" rx="2" fill="#0d9488" />
            {/* Red / Cyan Cross */}
            <rect x="47" y="40" width="6" height="18" rx="2" fill="#e11d48" />
            <rect x="41" y="46" width="18" height="6" rx="2" fill="#e11d48" />
            {/* Windows */}
            <rect x="28" y="42" width="8" height="8" rx="2" fill="#38bdf8" />
            <rect x="64" y="42" width="8" height="8" rx="2" fill="#38bdf8" />
            <rect x="28" y="56" width="8" height="8" rx="2" fill="#38bdf8" />
            <rect x="64" y="56" width="8" height="8" rx="2" fill="#38bdf8" />
            {/* Glass Door */}
            <rect x="44" y="68" width="12" height="17" rx="2" fill="#0284c7" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Syringe / Vaccine
    if (norm === 'syringe' || norm === '💉' || norm === 'vaccine') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            y: [0, -3, 0],
            rotate: [-40, -35, -40],
          } : { rotate: -45 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] drop-shadow-[0_8px_16px_rgba(6,182,212,0.35)]">
            <defs>
              <linearGradient id="syrLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {/* Needle */}
            <line x1="16" y1="84" x2="35" y2="65" stroke="url(#needleGrad)" strokeWidth="3" strokeLinecap="round" />
            {/* Needle Hub */}
            <polygon points="32,68 38,62 42,66 36,72" fill="#0d9488" />
            {/* Barrel */}
            <rect x="36" y="24" width="20" height="42" rx="4" transform="rotate(45 46 45)" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Cyan Vaccine Liquid inside barrel */}
            <rect x="38" y="32" width="16" height="26" rx="2" transform="rotate(45 46 45)" fill="url(#syrLiquid)" />
            {/* Measurement Marks */}
            <line x1="42" y1="36" x2="48" y2="42" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
            <line x1="46" y1="40" x2="52" y2="46" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
            <line x1="50" y1="44" x2="56" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
            {/* Plunger Shaft */}
            <line x1="56" y1="44" x2="76" y2="24" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            {/* Plunger Thumb Cap */}
            <rect x="72" y="16" width="14" height="6" rx="3" transform="rotate(45 79 19)" fill="#0d9488" />
            {/* Droplet */}
            <circle cx="12" cy="88" r="2.5" fill="#38bdf8" opacity="0.9" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Shield / Deworming Protection
    if (norm === 'shield' || norm === '🛡️' || norm === 'deworming') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? {
            scale: [1, 1.08, 1],
            rotate: [0, 2, -2, 0],
          } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] drop-shadow-[0_8px_16px_rgba(16,185,129,0.35)]">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            {/* Shield Outer Gold Rim */}
            <path d="M50,14 C70,14 84,24 84,46 C84,70 56,86 50,88 C44,86 16,70 16,46 C16,24 30,14 50,14 Z" fill="url(#goldBorder)" />
            {/* Inner Emerald Shield */}
            <path d="M50,19 C66,19 78,28 78,47 C78,67 55,81 50,83 C45,81 22,67 22,47 C22,28 34,19 50,19 Z" fill="url(#shieldGrad)" />
            {/* Glossy White Specular Arc */}
            <path d="M50,21 C36,21 26,29 26,45 C26,55 35,68 50,75 C50,21 50,21 50,21 Z" fill="#ffffff" opacity="0.25" />
            {/* Cross / Plus symbol */}
            <rect x="46" y="34" width="8" height="24" rx="3" fill="#ffffff" />
            <rect x="38" y="42" width="24" height="8" rx="3" fill="#ffffff" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Prescription / Rx
    if (norm === 'rx' || norm === 'prescription') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? { y: [0, -3, 0] } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_8px_16px_rgba(99,102,241,0.3)]">
            <defs>
              <linearGradient id="rxSheet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            </defs>
            {/* Paper Sheet */}
            <rect x="20" y="16" width="60" height="72" rx="8" fill="url(#rxSheet)" stroke="#cbd5e1" strokeWidth="2.5" />
            {/* Header band */}
            <path d="M20,24 C20,19 24,16 28,16 L72,16 C76,16 80,19 80,24 L80,30 L20,30 Z" fill="#6366f1" />
            {/* Rx Symbol */}
            <text x="26" y="48" fill="#4338ca" fontSize="17" fontWeight="bold" fontFamily="serif">℞</text>
            {/* Prescription Lines */}
            <line x1="44" y1="42" x2="72" y2="42" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="44" y1="48" x2="68" y2="48" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="58" x2="72" y2="58" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="66" x2="65" y2="66" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            {/* Doctor Seal */}
            <circle cx="66" cy="74" r="6" fill="#10b981" opacity="0.85" />
            <path d="M63,74 L65,76 L69,72" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    }

    // 3D Realistic Thermometer
    if (norm === 'thermometer' || norm === '🌡️') {
      return (
        <motion.div
          className="relative w-full h-full flex items-center justify-center select-none"
          animate={animated ? { y: [0, -2, 0] } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_8px_16px_rgba(239,68,68,0.3)]">
            {/* Bulb */}
            <circle cx="50" cy="75" r="14" fill="#ef4444" />
            <circle cx="47" cy="72" r="4" fill="#ffffff" opacity="0.7" />
            {/* Stem */}
            <rect x="44" y="16" width="12" height="52" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
            {/* Red mercury line */}
            <rect x="47" y="32" width="6" height="38" rx="3" fill="#ef4444" />
            {/* Degree ticks */}
            <line x1="58" y1="36" x2="62" y2="36" stroke="#64748b" strokeWidth="1.5" />
            <line x1="58" y1="44" x2="62" y2="44" stroke="#64748b" strokeWidth="1.5" />
            <line x1="58" y1="52" x2="62" y2="52" stroke="#64748b" strokeWidth="1.5" />
          </svg>
        </motion.div>
      );
    }

    // Fallback: 3D glossy badge wrapper around standard emoji
    return (
      <motion.div
        className="relative w-full h-full flex items-center justify-center select-none"
        animate={animated ? {
          scale: [1, 1.08, 1],
          y: [0, -2, 0],
        } : undefined}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-[90%] h-[90%] rounded-2xl bg-gradient-to-br from-white/90 via-slate-50/80 to-slate-200/90 border border-white shadow-[0_6px_14px_rgba(0,0,0,0.08)] flex items-center justify-center p-1 backdrop-blur-sm">
          <span className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]">
            {emoji}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${sizeMap[size]} ${className}`}
      whileHover={{ scale: 1.15, rotate: [0, -4, 4, 0], transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={title}
    >
      {renderVisual()}
    </motion.div>
  );
}
