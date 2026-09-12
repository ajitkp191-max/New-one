import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import propHeart from '../../assets/images/realistic_3d_heart_1789111332698.jpg';
import { Activity, Heart, Sparkles, ShieldCheck, Thermometer, Droplet, Gauge } from 'lucide-react';

interface PulseVitals3DProps {
  initialBpm?: number;
  rhythm?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showEcg?: boolean;
}

export default function PulseVitals3D({
  initialBpm = 76,
  rhythm = 'Normal Sinus Rhythm',
  className = '',
  size = 'md',
  showEcg = true
}: PulseVitals3DProps) {
  const [bpm, setBpm] = useState(initialBpm);
  const [spo2, setSpo2] = useState(99);
  const [temp, setTemp] = useState(38.5);
  const [mapPressure, setMapPressure] = useState(94);

  // 3D Card interactive tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Subtle natural pulse & biometrics fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.round(Math.max(64, Math.min(125, initialBpm + delta)));
      });
      setSpo2(prev => Math.min(100, Math.max(97, 99 + Math.round((Math.random() - 0.5) * 2))));
      setTemp(prev => Number((38.5 + (Math.random() - 0.5) * 0.2).toFixed(1)));
      setMapPressure(prev => Math.round(94 + (Math.random() - 0.5) * 3));
    }, 3500);
    return () => clearInterval(interval);
  }, [initialBpm]);

  const heartSizes = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const beatPeriod = Math.max(0.6, 60 / bpm);

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className={`flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white via-slate-50/90 to-slate-100/90 backdrop-blur-xl rounded-[36px] border border-slate-200/80 shadow-[0_20px_45px_rgba(0,0,0,0.06)] relative overflow-hidden group transition-all duration-200 ${className}`}
    >
      {/* 3D Specular Glare following card tilt */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 via-transparent to-rose-400/5 pointer-events-none rounded-[36px]" />

      {/* Background Pulse Rings with 3D Depth */}
      <motion.div
        className="absolute w-52 h-52 rounded-full bg-rose-500/15 blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.4, 1.12, 1.3, 1],
          opacity: [0.2, 0.65, 0.3, 0.55, 0.2]
        }}
        transition={{
          duration: beatPeriod,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Header Badge */}
      <div className="w-full flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>3D Biometrics Hub</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Telemetry Synced
        </div>
      </div>

      {/* 3D Realistic Pulsing Anatomical Heart with Multi-axis Perspective */}
      <div 
        className={`relative ${heartSizes[size]} flex items-center justify-center my-2`}
        style={{ transform: 'translateZ(25px)' }}
      >
        <motion.img
          src={propHeart}
          alt="3D Anatomical Heart"
          className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_18px_35px_rgba(225,29,72,0.4)] relative z-10"
          animate={{
            scale: [1, 1.18, 1.05, 1.13, 1],
            rotate: [0, -2, 1.5, -0.8, 0],
            y: [0, -5, 1, -2.5, 0]
          }}
          transition={{
            duration: beatPeriod,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Primary Heart Rate & Rhythm Banner */}
      <div className="text-center mt-1 relative z-10 space-y-1" style={{ transform: 'translateZ(18px)' }}>
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{bpm}</span>
          <span className="text-xs font-black uppercase text-rose-500 tracking-wider">BPM</span>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/80 text-emerald-700 text-[10px] font-black">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{rhythm}</span>
        </div>
      </div>

      {/* 3D Multi-parameter Telemetry Dials */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-slate-100 relative z-10 text-center" style={{ transform: 'translateZ(12px)' }}>
        <div className="bg-white/80 p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[9px] font-black text-slate-400 uppercase">
            <Droplet className="w-2.5 h-2.5 text-cyan-500" />
            <span>SpO2</span>
          </div>
          <p className="text-sm font-black text-slate-800 mt-0.5">{spo2}%</p>
        </div>

        <div className="bg-white/80 p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[9px] font-black text-slate-400 uppercase">
            <Gauge className="w-2.5 h-2.5 text-indigo-500" />
            <span>MAP</span>
          </div>
          <p className="text-sm font-black text-slate-800 mt-0.5">{mapPressure} <span className="text-[9px] text-slate-400">mmHg</span></p>
        </div>

        <div className="bg-white/80 p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[9px] font-black text-slate-400 uppercase">
            <Thermometer className="w-2.5 h-2.5 text-amber-500" />
            <span>Temp</span>
          </div>
          <p className="text-sm font-black text-slate-800 mt-0.5">{temp}°C</p>
        </div>
      </div>

      {/* Live Animated ECG Line Visualizer */}
      {showEcg && (
        <div className="w-full mt-3 pt-2 relative z-10" style={{ transform: 'translateZ(8px)' }}>
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-500" />
              Live Lead II ECG Trace
            </span>
            <span className="text-cyan-600 font-mono">25 mm/s • 10 mm/mV</span>
          </div>

          <div className="h-10 w-full bg-slate-950 rounded-2xl relative overflow-hidden flex items-center px-2 shadow-inner border border-slate-800">
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
                backgroundSize: '10px 10px'
              }}
            />

            {/* Glowing Animated ECG Path */}
            <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 300 40">
              <motion.path
                d="M 0 20 L 35 20 L 45 16 L 55 22 L 65 20 L 85 20 L 92 6 L 100 35 L 106 12 L 114 24 L 122 20 L 140 20 L 155 12 L 170 20 L 205 20 L 212 6 L 220 35 L 226 12 L 234 24 L 242 20 L 260 20 L 275 12 L 300 20"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathOffset: 0 }}
                animate={{ pathOffset: -1 }}
                transition={{
                  duration: beatPeriod * 2.4,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </svg>

            {/* Sweep Scan Glow */}
            <motion.div
              className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"
              animate={{ left: ['-10%', '110%'] }}
              transition={{
                duration: beatPeriod * 2.4,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
